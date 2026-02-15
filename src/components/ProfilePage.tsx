import React, { useEffect, useState, useCallback, useMemo } from "react";
import { isInstagramUsernameValidProfile } from "../utils/validation";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  RefreshControl,
  TextInput,
  Linking,
} from "react-native";
import UserProgress from "./UserProgress";
import Post from "./Post";
import useUserProgress from "../hooks/useUserProgress";
import useUserComments from "../hooks/useUserComments";
import { router } from "expo-router";
import { formatRelativeTime } from "../utils/time";
import { useAuth } from "../contexts/AuthContext";
import Icon from "react-native-vector-icons/Ionicons";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "../constants/Colors";
import { Loader } from "./Loader";
import { ProfileSkeleton } from "./Skeleton";
import { profileService } from "../services/profileService";
import { UserProfile } from "../models/User";
import { useLanguage } from "../contexts/LanguageContext";
import { useLikes } from "../contexts/LikesContext";
import { useReactions } from "../contexts/ReactionsContext";
import { ProfileActions } from "./ActionsMenu";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { imageService } from "../services/imageService";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { captureEvent, setUserProperties } from "../lib/posthog";
import { PROFILE_EVENTS, USER_PROPERTIES } from "../constants/analyticsEvents";

type ProfilePageProps = {
  userId?: string;
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ userId }) => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { initializePostLikes, initializeCommentLikes } = useLikes();
  const { initializePostReactions, initializeCommentReactions } = useReactions();

  const targetUserId = userId || user?.id || "";
  const isOwnProfile = !userId || userId === user?.id;

  const {
    data,
    loading: progressLoading,
    error,
    userPosts,
    postsLoading,
    hasMorePosts,
    fetchUserPosts,
  } = useUserProgress(targetUserId);
  const {
    userComments,
    commentsLoading,
    hasMoreComments,
    fetchUserComments,
  } = useUserComments(targetUserId);
  const [page, setPage] = useState(1);
  const [commentsPage, setCommentsPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedUsername, setEditedUsername] = useState("");
  const [editedInstagram, setEditedInstagram] = useState("");
  const [fullResImageUrl, setFullResImageUrl] = useState<string | null>(null);
  const [isLoadingFullRes, setIsLoadingFullRes] = useState(false);


  // Use React Query to fetch profile data
  const {
    data: userProfile,
    isLoading: profileLoading,
    error: profileError,
    refetch: refetchProfile,
  } = useQuery({
    queryKey: ["profile", targetUserId],
    queryFn: () => {
      if (!targetUserId) {
        throw new Error("Invalid user ID");
      }
      return profileService.fetchProfileById(targetUserId);
    },
    enabled: !!targetUserId,
    staleTime: 30000,
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    setCommentsPage(1);
    await Promise.all([refetchProfile(), fetchUserPosts(1), fetchUserComments(1)]);
    setRefreshing(false);
  }, [fetchUserPosts, fetchUserComments, refetchProfile]);

  const handleUpdateProfilePicture = async () => {
    try {
      setImageUploading(true);
      if (!user?.id) return;
      const result = await profileService.updateProfilePicture(user.id);

      if (result.success) {
        // Optimistically update with preview URL if available
        if (result.previewUrl && userProfile && targetUserId) {
          queryClient.setQueryData<UserProfile>(["profile", targetUserId], (old) => {
            if (!old) return old;
            return {
              ...old,
              profileImageUrl: result.previewUrl || old.profileImageUrl,
            };
          });
        }

        // Invalidate query to refetch fresh data
        if (targetUserId) {
          queryClient.invalidateQueries({ queryKey: ["profile", targetUserId] });
        }

        captureEvent(PROFILE_EVENTS.PICTURE_UPDATED);
        setUserProperties({
          [USER_PROPERTIES.HAS_PROFILE_PICTURE]: true,
        });
      } else if (result.error) {
        Alert.alert("Error", result.error);
      }
    } finally {
      setImageUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      if (editedInstagram && editedInstagram !== userProfile?.instagram) {
        const instagramRegex = /^[a-zA-Z0-9._]+$/;
        if (!instagramRegex.test(editedInstagram)) {
          Alert.alert(t("Error"), t("Instagram usernames can only use letters, numbers, underscores and periods."));
          return;
        }

        try {
          const isValid = await isInstagramUsernameValidProfile(editedInstagram);
          if (!isValid) {
            Alert.alert(t("Error"), t("Instagram profile not found. Check your username"));
            return;
          }
        } catch (err) {
          console.log('Error checking instagram:', err);
          // If fetch fails (e.g. network or calls restrictions), we typically let it pass or show a warning.
          // For now, proceeding as we only want to block if we explicitly know it's invalid.
        }
      }

      if (!user?.id) return;

      const result = await profileService.validateAndUpdateProfile(user.id, {
        instagram: editedInstagram !== userProfile?.instagram ? editedInstagram : undefined,
        username: editedUsername !== userProfile?.username ? editedUsername : undefined,
        name: editedName !== userProfile?.name ? editedName : undefined,
      });

      if (result.success) {
        // Invalidate query to refetch fresh data
        if (targetUserId) {
          queryClient.invalidateQueries({ queryKey: ["profile", targetUserId] });
        }
        setIsEditing(false);
        captureEvent(PROFILE_EVENTS.EDITED, {
          changed_name: editedName !== userProfile?.name,
          changed_username: editedUsername !== userProfile?.username,
          changed_instagram: editedInstagram !== userProfile?.instagram,
        });
        // Update user properties if instagram was changed
        if (editedInstagram !== userProfile?.instagram) {
          setUserProperties({
            [USER_PROPERTIES.HAS_INSTAGRAM]: !!editedInstagram,
          });
        }
      } else if (result.error) {
        Alert.alert("Error", result.error);
      }
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const handleLoadMore = () => {
    if (!postsLoading && hasMorePosts) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchUserPosts(nextPage, true);
    }

    if (!commentsLoading && hasMoreComments) {
      const nextPage = commentsPage + 1;
      setCommentsPage(nextPage);
      fetchUserComments(nextPage, true);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const handleDeleteAccount = async () => {
    try {
      if (!user?.id) return;
      const result = await profileService.confirmAndDeleteAccount(user.id, t);
      if (result.success) {
        captureEvent(PROFILE_EVENTS.ACCOUNT_DELETED);
        await signOut();
      } else if (result.error) {
        Alert.alert("Error", result.error || t("Failed to Delete account"));
      }
    } catch (error) {
      Alert.alert("Error", (error as Error).message);
    }
  };

  const loadFullResImage = useCallback(async () => {
    if (!userProfile?.profileImageUrl) return;

    setIsLoadingFullRes(true);
    try {
      const { fullUrl } = await imageService.getProfileImageUrl(
        userProfile.profileImageUrl,
        "extraLarge"
      );
      setFullResImageUrl(fullUrl);
    } catch (error) {
      console.error("Error loading full res image:", error);
    } finally {
      setIsLoadingFullRes(false);
    }
  }, [userProfile?.profileImageUrl]);

  useEffect(() => {
    if (showFullImage) {
      loadFullResImage();
    } else {
      setFullResImageUrl(null);
    }
  }, [showFullImage, loadFullResImage]);

  // Track profile viewed when profile data loads
  useEffect(() => {
    if (userProfile && targetUserId) {
      captureEvent(PROFILE_EVENTS.VIEWED, {
        profile_user_id: targetUserId,
        is_own_profile: isOwnProfile,
      });
    }
  }, [userProfile, targetUserId, isOwnProfile]);

  useEffect(() => {
    if (userPosts.length > 0) {
      initializePostLikes(userPosts);
      initializePostReactions(userPosts);
    }
  }, [userPosts]);

  useEffect(() => {
    if (userComments.length > 0) {
      initializeCommentLikes(userComments);
      initializeCommentReactions(userComments);
    }
  }, [userComments]);

  const activityItems = useMemo(() => {
    const postItems = userPosts.map((post) => ({
      type: "post" as const,
      id: post.id,
      createdAt: post.created_at,
      post,
    }));

    const commentItems = userComments.map((comment) => ({
      type: "comment" as const,
      id: comment.id,
      createdAt: comment.created_at,
      comment,
    }));

    return [...postItems, ...commentItems].sort((a, b) => {
      const aTime = new Date(a.createdAt).getTime();
      const bTime = new Date(b.createdAt).getTime();
      return bTime - aTime;
    });
  }, [userPosts, userComments]);

  if (progressLoading || profileLoading || !userProfile) {
    return <ProfileSkeleton />;
  }

  if (error || profileError) {
    return (
      <Text>
        {t("Error")}: {error || (profileError as Error)?.message || "Failed to load profile"}
      </Text>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 0,
        }}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
      >
        <View style={styles.profileHeader}>
          <View style={styles.headerLeft}>
            <TouchableOpacity onPress={() => setShowFullImage(true)} disabled={imageUploading}>
              {imageUploading ? (
                <View style={[styles.avatar, styles.avatarLoader]}>
                  <Loader />
                </View>
              ) : userProfile?.profileImageUrl ? (
                <Image source={{ uri: userProfile.profileImageUrl }} style={styles.avatar} />
              ) : (
                <View style={[styles.avatar, { justifyContent: "center", alignItems: "center" }]}>
                  <MaterialCommunityIcons name="account-circle" size={80} color="#e1e1e1" />
                </View>
              )}
              {isEditing && (
                <TouchableOpacity
                  style={styles.editAvatarButton}
                  onPress={handleUpdateProfilePicture}
                  disabled={imageUploading}
                >
                  <FontAwesome name="pencil" size={14} color={colors.light.primary} />
                </TouchableOpacity>
              )}
            </TouchableOpacity>
            <View style={styles.userInfo}>
              {isEditing ? (
                <View style={styles.editContainer}>
                  <View style={styles.editInputContainer}>
                    <Text style={styles.editLabel}>{t("Name")}</Text>
                    <TextInput
                      style={styles.editInput}
                      value={editedName}
                      onChangeText={setEditedName}
                      placeholder={t("Name")}
                      maxLength={16}
                    />
                    <Text style={styles.editLabel}>{t("Username")}</Text>
                    <View style={styles.usernameInputContainer}>
                      <Text style={styles.atSymbol}>@</Text>
                      <TextInput
                        style={[styles.editInput, styles.usernameInput]}
                        value={editedUsername}
                        onChangeText={(text) => setEditedUsername(text.replace(/@|\s/g, ''))}
                        placeholder={t("Username")}
                        maxLength={15}
                      />
                    </View>
                    <Text style={styles.editLabel}>{t("Instagram")}</Text>
                    <View style={styles.usernameInputContainer}>
                      <MaterialCommunityIcons
                        name="instagram"
                        size={20}
                        style={styles.instagramIcon}
                        color={colors.light.primary}
                      />
                      <TextInput
                        style={[styles.editInput, styles.usernameInput]}
                        placeholder={t("Username")}
                        value={editedInstagram}
                        //onChangeText={setEditedInstagram}
                        onChangeText={(text) => setEditedInstagram(text.replace(/[@\s]+/g, ''))}
                        autoCapitalize="none"
                        keyboardType="default"
                      />
                    </View>
                  </View>
                  <View style={styles.editButtonsContainer}>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSaveProfile}>
                      <Text style={styles.saveButtonText}>{t("Save")}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.cancelButton}
                      onPress={() => setIsEditing(false)}
                    >
                      <Text style={styles.cancelButtonText}>{t("Cancel")}</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.userInfoStacked}>
                  <Text style={styles.username}>{userProfile.name}</Text>
                  <Text style={styles.userTitle}>@{userProfile.username}</Text>

                  {userProfile?.instagram && (
                    <TouchableOpacity
                      style={styles.instagram}
                      onPress={() => {
                        Linking.openURL(`https://instagram.com/${userProfile.instagram}`);
                        captureEvent(PROFILE_EVENTS.INSTAGRAM_CLICKED, {
                          profile_user_id: targetUserId,
                          is_own_profile: isOwnProfile,
                        });
                      }}
                    >
                      <MaterialCommunityIcons
                        name="instagram"
                        size={16}
                        color={colors.light.primary}
                      />
                      <Text style={styles.websiteText}>{userProfile.instagram}</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
            </View>
          </View>
          <View style={styles.headerButtons}>
            {isOwnProfile && (
              <ProfileActions
                onEdit={() => {
                  setIsEditing(true);
                  setEditedName(userProfile?.name || "");
                  setEditedUsername(userProfile?.username || "");
                  setEditedInstagram(userProfile?.instagram || "");
                }}
                onSignOut={handleSignOut}
                onDeleteAccount={handleDeleteAccount}
              >
                <Icon name="settings-outline" size={24} color="#333" />
              </ProfileActions>
            )}
          </View>
        </View>
        {isOwnProfile && data && (
          <UserProgress challengeData={data.challengeData} weekData={data.weekData} />
        )}
        {activityItems.map((item) => {
          if (item.type === "post") {
            return (
              <Post
                key={`post-${item.id}`}
                post={item.post}
                postUser={userProfile}
                setPostCounts={() => {}}
                onPostDeleted={() => {}}
              />
            );
          }

          return (
            <TouchableOpacity
              key={`comment-${item.id}`}
              style={styles.commentCard}
              onPress={() => router.push(`/post/${item.comment.post_id}`)}
            >
              <View style={styles.commentTopRow}>
                {userProfile?.profileImageUrl ? (
                  <Image source={{ uri: userProfile.profileImageUrl }} style={styles.commentAvatar} />
                ) : (
                  <View style={styles.defaultCommentAvatar}>
                    <MaterialCommunityIcons name="account-circle" size={30} color="#e1e1e1" />
                  </View>
                )}
                <View style={styles.commentHeaderContent}>
                  <View style={styles.commentNameRow}>
                    <Text style={styles.commentDisplayName}>{userProfile.name}</Text>
                    <Text style={styles.commentUsername}>@{userProfile.username}</Text>
                    <Text style={styles.commentTimestamp}>
                      {formatRelativeTime(item.comment.created_at)}
                    </Text>
                  </View>
                  <Text style={styles.commentBodyText}>{item.comment.text}</Text>
                  <Text style={styles.commentPostContextText} numberOfLines={2}>
                    on {item.comment.post?.challenge_title ? `${item.comment.post.challenge_title}: ` : ""}
                    {item.comment.post?.body || "post"}
                  </Text>
                </View>
              </View>
            </TouchableOpacity>
          );
        })}

        {(postsLoading || commentsLoading) && (
          <View style={{ padding: 20, alignItems: "center" }}>
            <Loader />
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showFullImage}
        transparent={true}
        onRequestClose={() => setShowFullImage(false)}
      >
        <TouchableOpacity
          style={styles.modalContainer}
          activeOpacity={1}
          onPress={() => setShowFullImage(false)}
        >
          <TouchableOpacity style={styles.closeButton} onPress={() => setShowFullImage(false)}>
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.fullScreenImageWrapper}>
            {userProfile?.profileImageUrl ? (
              <>
                <Image
                  source={{ uri: fullResImageUrl || userProfile.profileImageUrl }}
                  style={styles.fullScreenImage}
                  resizeMode="contain"
                />
                {isLoadingFullRes && (
                  <View style={styles.fullScreenLoader}>
                    <Loader />
                  </View>
                )}
              </>
            ) : (
              <MaterialCommunityIcons name="account-circle" size={200} color="#e1e1e1" />
            )}
          </View>
        </TouchableOpacity>
      </Modal>
      {/* {isOwnProfile && <FeedbackButton />} */}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: 40,
    height: 80,
    width: 80,
  },
  avatarLoader: {
    alignItems: "center",
    backgroundColor: "#e1e1e1",
    justifyContent: "center",
  },
  editAvatarButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#fff",
    borderRadius: "50%",
    height: 24,
    width: 24,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colors.light.primary,
  },
  cancelButton: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: colors.light.primary,
    flex: 1,
  },
  cancelButtonText: {
    color: colors.light.primary,
    fontSize: 16,
    fontWeight: "500",
    textAlign: "center",
  },
  closeButton: {
    padding: 10,
    position: "absolute",
    right: 20,
    top: 40,
    zIndex: 1,
  },
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
    padding: 16,
  },
  editContainer: {
    marginLeft: 16,
    flex: 1,
    maxWidth: "80%",
  },
  editInputContainer: {
    gap: 8,
    width: "100%",
  },
  editLabel: {
    fontSize: 14,
    color: colors.light.primary,
    fontWeight: "500",
    marginBottom: -4,
  },
  editInput: {
    backgroundColor: "#fff",
    borderColor: colors.light.primary,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    width: "100%",
  },
  editButtonsContainer: {
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    width: "100%",
  },
  saveButton: {
    backgroundColor: colors.light.primary,
    borderRadius: 8,
    paddingHorizontal: 24,
    paddingVertical: 8,
    flex: 1,
  },
  saveButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
  modalContainer: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    flex: 1,
    justifyContent: "center",
  },
  commentCard: {
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 8,
    padding: 10,
    paddingBottom: 16,
  },
  commentTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  commentAvatar: {
    borderRadius: 15,
    height: 30,
    width: 30,
    marginRight: 10,
  },
  defaultCommentAvatar: {
    borderRadius: 15,
    height: 30,
    width: 30,
    marginRight: 10,
  },
  commentHeaderContent: {
    flex: 1,
  },
  commentNameRow: {
    flexDirection: "row",
    alignItems: "baseline",
    flexWrap: "wrap",
    columnGap: 6,
    marginBottom: 6,
  },
  commentDisplayName: {
    fontSize: 14,
    fontWeight: "bold",
    color: colors.light.text,
  },
  commentUsername: {
    fontSize: 12,
    color: "#666",
  },
  commentTimestamp: {
    fontSize: 11,
    color: "#666",
  },
  commentBodyText: {
    fontSize: 14,
    marginBottom: 8,
    color: colors.light.text,
  },
  commentPostContextText: {
    color: colors.light.lightText,
    fontSize: 12,
  },
  profileHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  headerButtons: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
  },
  headerLeft: {
    alignItems: "center",
    flexDirection: "row",
  },
  userInfo: {
    alignItems: "center",
    flexDirection: "row",
    gap: 16,
  },
  userInfoStacked: {
    marginLeft: 16,
  },
  userTitle: {
    color: "#7F8C8D",
    fontSize: 16,
  },
  username: {
    color: "#0D1B1E",
    fontSize: 24,
    fontWeight: "bold",
  },
  fullScreenImage: {
    height: "100%",
    width: "100%",
  },
  usernameInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderColor: colors.light.primary,
    borderRadius: 8,
    borderWidth: 1,
  },
  atSymbol: {
    fontSize: 16,
    paddingLeft: 12,
    paddingRight: 0,
    color: "#7F8C8D",
  },
  usernameInput: {
    borderWidth: 0,
    flex: 1,
    paddingLeft: 0,
  },
  websiteText: {
    color: colors.light.primary,
    fontSize: 14,
  },
  instagram: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  instagramIcon: {
    paddingLeft: 12,
    paddingRight: 6,
  },
  fullScreenImageWrapper: {
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "80%",
  },
  fullScreenLoader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
  },
});
