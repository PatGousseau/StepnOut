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
import ProfilePic from "../assets/images/profile-pic.png";
import useUserProgress from "../hooks/useUserProgress";
import { useAuth } from "../contexts/AuthContext";
import Icon from "react-native-vector-icons/Ionicons";
import { FontAwesome } from "@expo/vector-icons";
import { colors } from "../constants/Colors";
import { Loader } from "./Loader";
import { User } from "../models/User";
import { profileService } from "../services/profileService";
import { useLanguage } from "../contexts/LanguageContext";
import { Menu, MenuOptions, MenuOption, MenuTrigger } from "react-native-popup-menu";
import { MaterialCommunityIcons } from "@expo/vector-icons";

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

  // for features that are only available to the user themselves
  const isOwnProfile = userId ? userId === user?.id : true;

  useEffect(() => {
    const loadUser = async () => {
      const targetUserId = userId || user?.id;
      if (!targetUserId) return;

      const userProfile = await User.getUser(targetUserId);
      if (userProfile) {
        setUserProfile(userProfile);
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
        // Reload the user profile to get updated data
        if (user?.id) {
          const userProfile = await User.getUser(user.id);
          if (userProfile && result.profileImageUrl) {
            userProfile.profileImageUrl = result.profileImageUrl;
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
      const isValidUsername = /^[a-zA-Z0-9_-]+$/.test(editedUsername);

      if (!isValidUsername) {
        Alert.alert(
          "Invalid Username",
          "Username can only contain letters, numbers, underscores, and hyphens."
        );
        return;
      }
      const result = await profileService.updateProfile(user?.id!, {
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
    // First confirmation
    Alert.alert(
      t("Delete Account"),
      t("Are you sure you want to proceed? This will permanently delete your account."),
      [
        {
          text: t("Cancel"),
          style: "cancel",
        },
        {
          text: t("Continue"),
          style: "destructive",
          onPress: () => {
            // Second confirmation
            Alert.alert(
              t("Final Warning"),
              t(
                "This action cannot be undone. All your data will be permanently deleted. Are you absolutely sure?"
              ),
              [
                {
                  text: t("Cancel"),
                  style: "cancel",
                },
                {
                  text: t("Delete Account"),
                  style: "destructive",
                  onPress: async () => {
                    try {
                      const result = await profileService.deleteAccount(user?.id!);
                      if (result.success) {
                        await signOut();
                      } else {
                        Alert.alert("Error", result.error || t("Failed to delete account"));
                      }
                    } catch (error) {
                      Alert.alert("Error", (error as Error).message);
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

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

  const menuStyles = {
    optionsContainer: {
      backgroundColor: "white",
      borderRadius: 8,
      width: 150,
      borderWidth: 2,
      borderColor: colors.light.primary,
    },
    optionWrapper: {
      paddingVertical: 8,
      paddingHorizontal: 12,
    },
  };

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
              ) : (
                <Image
                  source={
                    userProfile?.profileImageUrl ? { uri: userProfile.profileImageUrl } : ProfilePic
                  }
                  style={styles.avatar}
                />
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
              <Menu>
                <MenuTrigger>
                  <Icon name="settings-outline" size={24} color="#333" />
                </MenuTrigger>
                <MenuOptions customStyles={menuStyles}>
                  <MenuOption
                    onSelect={() => {
                      setIsEditing(true);
                      setEditedName(userProfile?.name || "");
                      setEditedUsername(userProfile?.username || "");
                      setEditedInstagram(userProfile?.instagram || "");
                    }}
                  >
                    <View style={styles.menuItemContent}>
                      <Icon name="pencil-outline" size={16} color={colors.light.primary} />
                      <Text style={styles.menuOptionText}>{t("Edit Profile")}</Text>
                    </View>
                  </MenuOption>
                  <MenuOption onSelect={handleSignOut}>
                    <View style={styles.menuItemContent}>
                      <Icon name="log-out-outline" size={16} color={colors.light.primary} />
                      <Text style={styles.menuOptionText}>{t("Sign Out")}</Text>
                    </View>
                  </MenuOption>
                  <MenuOption onSelect={handleDeleteAccount}>
                    <View style={styles.menuItemContent}>
                      <Icon name="trash-outline" size={16} color="#FF3B30" />
                      <Text style={[styles.menuOptionText, { color: "#FF3B30" }]}>
                        {t("Delete Account")}
                      </Text>
                    </View>
                  </MenuOption>
                </MenuOptions>
              </Menu>
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
          <TouchableOpacity 
            style={styles.closeButton} 
            onPress={() => setShowFullImage(false)}
          >
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.fullScreenImageWrapper}>
            <Image
              source={
                userProfile?.profileImageUrl 
                  ? { uri: userProfile.profileImageUrl } 
                  : ProfilePic
              }
              style={styles.fullScreenImage}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
      </Modal>
      {/* {isOwnProfile && <FeedbackButton />} */}
    </View>
  );
};

const styles = StyleSheet.create({
  avatar: {
    borderRadius: "50%",
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
  },
});
