import React, { useEffect, useState, useCallback } from "react";
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
import { useAuth } from "../contexts/AuthContext";
import Icon from "react-native-vector-icons/Ionicons";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "../constants/Colors";
import { Loader } from "./Loader";
import { User } from "../models/User";
import { profileService } from "../services/profileService";
import { useLanguage } from "../contexts/LanguageContext";
import { ProfileActions } from "./ActionsMenu";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { imageService } from "../services/imageService";

type ProfilePageProps = {
  userId: string;
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ userId }) => {
  const { user, signOut } = useAuth();
  const { t } = useLanguage();
  const {
    data,
    loading: progressLoading,
    error,
    userPosts,
    postsLoading,
    hasMorePosts,
    fetchUserPosts,
  } = useUserProgress(userId);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editedUsername, setEditedUsername] = useState("");
  const [editedInstagram, setEditedInstagram] = useState("");
  const [userProfile, setUserProfile] = useState<User | null>(null);
  const [fullResImageUrl, setFullResImageUrl] = useState<string | null>(null);
  const [isLoadingFullRes, setIsLoadingFullRes] = useState(false);

  // for features that are only available to the user themselves
  const isOwnProfile = userId ? userId === user?.id : true;

  useEffect(() => {
    const loadUser = async () => {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return;

      const profile = await profileService.loadUserProfile(targetUserId);
      if (profile) {
        setUserProfile(profile);
      }
    };

    loadUser();
  }, [userId, user?.id]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchUserPosts(1);
    setRefreshing(false);
  }, [fetchUserPosts]);

  const handleUpdateProfilePicture = async () => {
    try {
      setImageUploading(true);
      const result = await profileService.updateProfilePicture(user?.id!);

      if (result.success) {
        if (result.previewUrl && userProfile) {
          // Immediately show the new image while background upload finishes
          userProfile.profileImageUrl = result.previewUrl;
          const clonedUser = Object.assign(
            Object.create(Object.getPrototypeOf(userProfile)),
            userProfile
          ) as User;
          setUserProfile(clonedUser);
        }

        if (user?.id) {
          // Force reload to bypass cached user data
          const refreshedProfile = await profileService.loadUserProfile(user.id, true);
          if (refreshedProfile) {
            if (!refreshedProfile.profileImageUrl && result.previewUrl) {
              refreshedProfile.profileImageUrl = result.previewUrl;
            }
            setUserProfile(refreshedProfile);
          }
        }
      } else if (result.error) {
        Alert.alert("Error", result.error);
      }
    } finally {
      setImageUploading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const result = await profileService.validateAndUpdateProfile(user?.id!, {
        instagram: editedInstagram !== userProfile?.instagram ? editedInstagram : undefined,
        username: editedUsername !== userProfile?.username ? editedUsername : undefined,
        name: editedName !== userProfile?.name ? editedName : undefined,
      });

      if (result.success) {
        userProfile!.username = editedUsername;
        userProfile!.name = editedName;
        userProfile!.instagram = editedInstagram;
        setIsEditing(false);
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
      const result = await profileService.confirmAndDeleteAccount(user?.id!, t);
      if (result.success) {
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

  if (progressLoading || !userProfile) {
    return (
      <View style={[styles.container]}>
        <Loader />
      </View>
    );
  }

  if (error) {
    return (
      <Text>
        {t("Error")}: {error}
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
                        onChangeText={(text) => setEditedUsername(text.replace("@", ""))}
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
                        onChangeText={setEditedInstagram}
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
                      onPress={() =>
                        Linking.openURL(`https://instagram.com/${userProfile.instagram}`)
                      }
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
        <Text style={styles.pastChallengesTitle}>
          {isOwnProfile ? t("Your Posts") : t("Posts")}
        </Text>
        {userPosts.map((post) => (
          <Post
            key={post.id}
            post={post} // Pass the entire post object
            postUser={userProfile}
            setPostCounts={() => {}}
            onPostDeleted={() => {}}
          />
        ))}
        {postsLoading && (
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
  menuItemContent: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8,
  },
  menuOptionText: {
    color: colors.light.primary,
    fontSize: 14,
  },
  modalContainer: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    flex: 1,
    justifyContent: "center",
  },
  pastChallengesTitle: {
    color: "#0D1B1E",
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 16,
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
  input: {
    borderColor: colors.light.primary,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
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
  websiteLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  websiteText: {
    color: colors.light.primary,
    fontSize: 14,
  },
  inputWithIcon: {
    flexDirection: "row",
    alignItems: "center",
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
