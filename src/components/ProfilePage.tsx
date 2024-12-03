import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Modal, RefreshControl, TextInput } from 'react-native';
import UserProgress from './UserProgress';
import Post from './Post';
import ProfilePic from '../assets/images/profile-pic.png';
import useUserProgress from '../hooks/useUserProgress';
import { useAuth } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '../constants/Colors';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';
import { Loader } from './Loader';
import FeedbackButton from './FeedbackButton';
import { User } from '../models/User';
import { profileService } from '../services/profileService';

type ProfilePageProps = {
  userId: string;
};

export const ProfilePage: React.FC<ProfilePageProps> = ({ userId }) => {
  const { user, signOut } = useAuth();
  const { 
    data, 
    loading: progressLoading, 
    error,
    userPosts,
    postsLoading,
    hasMorePosts,
    fetchUserPosts
  } = useUserProgress(userId);
  const [page, setPage] = useState(1);
  const [showMenu, setShowMenu] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedUsername, setEditedUsername] = useState('');
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
        Alert.alert('Error', result.error);
      }
    } finally {
      setImageUploading(false);
    }
  };

  const handlePressOutside = () => {
    if (showMenu) {
      setShowMenu(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      const result = await profileService.updateProfile(user?.id!, {
        username: editedUsername !== userProfile?.username ? editedUsername : undefined,
        name: editedName !== userProfile?.name ? editedName : undefined
      });

      if (result.success) {
        userProfile!.username = editedUsername;
        userProfile!.name = editedName;
        setIsEditing(false);
      } else if (result.error) {
        Alert.alert('Error', result.error);
      }
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
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
      console.error('Error signing out:', error);
    }
  };

  if (progressLoading || !userProfile) {
    return <Loader />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <View style={{ flex: 1 }}>
      {showMenu && (
        <TouchableOpacity 
          activeOpacity={1} 
          style={[StyleSheet.absoluteFill, { backgroundColor: 'transparent' }]} 
          onPress={handlePressOutside}
        />
      )}
      <ScrollView 
        style={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
          />
        }
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
          autoscrollToTopThreshold: 0
        }}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          
          if (isCloseToBottom) {
            handleLoadMore();
          }
        }}
        scrollEventThrottle={400}
      >
        <View style={styles.profileHeader}>
          <View style={styles.headerLeft}>
            <TouchableOpacity 
              onPress={() => setShowFullImage(true)}
              style={styles.avatarContainer}
              disabled={imageUploading}
            >
              {imageUploading ? (
                <View style={[styles.avatar, styles.avatarLoader]}>
                  <ActivityIndicator size="small" color={colors.light.primary} />
                </View>
              ) : (
                <Image 
                  source={userProfile?.profileImageUrl ? { uri: userProfile.profileImageUrl } : ProfilePic} 
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
                <View style={styles.userInfo}>
                  <View style={styles.editInputContainer}>
                    <TextInput
                      style={[styles.username, styles.editableText]}
                      value={editedName}
                      onChangeText={setEditedName}
                      placeholder="Name"
                      maxLength={16}
                    />
                    <TextInput
                      style={[styles.userTitle, styles.editableText]}
                      value={editedUsername}
                      onChangeText={setEditedUsername}
                      placeholder="Username"
                      maxLength={16}
                    />
                  </View>
                  <View style={styles.editButtonsContainer}>
                    <TouchableOpacity 
                      style={styles.saveButton}
                      onPress={handleSaveProfile}
                    >
                      <Text style={styles.saveButtonText}>Save</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.cancelButton}
                      onPress={() => setIsEditing(false)}
                    >
                      <Text style={styles.cancelButtonText}>Cancel</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : (
                <View style={styles.userInfoStacked}>
                  <Text style={styles.username}>{userProfile.name}</Text>
                  <Text style={styles.userTitle}>@{userProfile.username}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.headerButtons}>
            {isOwnProfile && (  // Only show settings for own profile
              <View>
                <TouchableOpacity 
                  style={styles.settingsButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    setShowMenu(!showMenu);
                  }}
                >
                  <Icon name="settings-outline" size={24} color="#333" />
                </TouchableOpacity>
                {showMenu && (
                  <View style={styles.menuContainer}>
                    <TouchableOpacity 
                      style={styles.menuItem}
                      onPress={() => {
                        setShowMenu(false);
                        setIsEditing(true);
                        setEditedName(userProfile?.name || '');
                        setEditedUsername(userProfile?.username || '');
                      }}
                    >
                      <View style={styles.menuItemContent}>
                        <Icon name="pencil-outline" size={16} color={colors.light.primary} />
                        <Text style={styles.menuOptionText}>Edit Profile</Text>
                      </View>
                    </TouchableOpacity>
                    <TouchableOpacity 
                      style={styles.menuItem}
                      onPress={() => {
                        setShowMenu(false);
                        handleSignOut();
                      }}
                    >
                      <View style={styles.menuItemContent}>
                        <Icon name="log-out-outline" size={16} color={colors.light.primary} />
                        <Text style={styles.menuOptionText}>Sign Out</Text>
                      </View>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            )}
          </View>
        </View>
        {isOwnProfile && data && <UserProgress challengeData={data.challengeData} weekData={data.weekData} />}
        <Text style={styles.pastChallengesTitle}>{isOwnProfile ? 'Your' : ''} Posts</Text>
        {userPosts.map((post) => (
          <Post
            key={post.id}
            post={post}  // Pass the entire post object
            postUser={userProfile}
            setPostCounts={() => {}}
            onPostDeleted={() => {}}
        />
        ))}
        {postsLoading && (
          <View style={{ padding: 20, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={colors.light.primary} />
          </View>
        )}
      </ScrollView>

      <Modal
        visible={showFullImage}
        transparent={true}
        onRequestClose={() => setShowFullImage(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity 
            style={styles.closeButton}
            onPress={() => setShowFullImage(false)}
          >
            <Icon name="close" size={24} color="#fff" />
          </TouchableOpacity>
          <Image
            source={userProfile?.profileImageUrl ? { uri: userProfile.profileImageUrl } : ProfilePic}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
      {isOwnProfile && <FeedbackButton />}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: colors.light.background,
    flex: 1,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
    justifyContent: 'space-between',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  userInfoStacked: {
    marginLeft: 16,
    gap: 4,
  },
  username: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#0D1B1E',
  },
  userTitle: {
    fontSize: 16,
    color: '#7F8C8D',
  },
  pastChallengesTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 16,
    color: '#0D1B1E',
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  menuOptionText: {
    fontSize: 14,
    color: colors.light.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  menuContainer: {
    position: 'absolute',
    top: 40,
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 4,
    minWidth: 100,
    borderWidth: 2,
    borderColor: colors.light.primary,
    zIndex: 1000,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  settingsButton: {
    padding: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  editAvatarButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: colors.light.background,
    borderRadius: 8,
    padding: 3,
    borderWidth: 2,
    borderColor: colors.light.primary,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImage: {
    width: '100%',
    height: '80%',
  },
  closeButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 1,
    padding: 10,
  },
  avatarLoader: {
    backgroundColor: '#e1e1e1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  input: {
    borderWidth: 1,
    borderColor: colors.light.primary,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
  },
  editButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  editButtonEditProfile: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    flex: 1,
    alignItems: 'center',
  },
  editButtonTextEditProfile: {
    color: '#fff',
    fontWeight: '600',
  },
  editInputContainer: {
    gap: 2,
  },
  editableText: {
    backgroundColor: '#fff',
    borderRadius: 4,
    paddingHorizontal: 8,
    paddingVertical: 0,
    borderWidth: 1,
    borderColor: colors.light.primary,
    marginLeft: 7,
  },
  editButtonsContainer: {
    flexDirection: 'column',
    gap: 4,
    marginTop: 4,
    marginBottom: -24,
  },
  saveButton: {
    backgroundColor: colors.light.primary,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  cancelButtonText: {
    color: colors.light.primary,
    fontWeight: '500',
    fontSize: 14,
    textAlign: 'center',
    paddingBottom: 12,
  },
  cancelButton: {
    paddingBottom: 12,
    alignItems: 'center',
  },
});