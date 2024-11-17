import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Modal, RefreshControl, TextInput } from 'react-native';
import UserProgress from '../components/UserProgress';
import Post from '../components/Post';
import ProfilePic from '../assets/images/profile-pic.png';
import { useFetchHomeData } from '../hooks/useFetchHomeData';
import useUserProgress from '../hooks/useUserProgress';
import { useAuth } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { FontAwesome } from '@expo/vector-icons';
import { colors } from '../constants/Colors';
import { supabase } from '../lib/supabase';
import * as ImagePicker from 'expo-image-picker';

type UserProfile = {
  username: string;
  name: string;
  profile_media_id: string;
  profile_image_url?: string;
};

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { data, loading: progressLoading, error } = useUserProgress();
  const { 
    posts, 
    userMap, 
    loading: postsLoading, 
    hasMore, 
    loadMorePosts,
    fetchAllData 
  } = useFetchHomeData();
  const [userPosts, setUserPosts] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [page, setPage] = useState(1);
  const [refreshing, setRefreshing] = useState(false);
  const [showFullImage, setShowFullImage] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState('');
  const [editedUsername, setEditedUsername] = useState('');

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select(`
          username, 
          name,
          profile_media_id,
          media!profiles_profile_media_id_fkey (
            file_path
          )
        `)
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      const profileImageUrl = profile.media?.file_path 
        ? `${supabase.storageUrl}/object/public/challenge-uploads/${profile.media.file_path}`
        : undefined;

      setUserProfile({
        username: profile.username,
        name: profile.name,
        profile_media_id: profile.profile_media_id,
        profile_image_url: profileImageUrl
      });
    };

    fetchUserProfile();
  }, [user?.id]);

  useEffect(() => {
    if (posts && user?.id) {
      const filteredPosts = posts.filter(post => post.user_id === user.id);
      setUserPosts(prev => page === 1 ? filteredPosts : [...prev, ...filteredPosts]);
    }
  }, [posts, user?.id, page]);

  useEffect(() => {
    fetchAllData(1);
  }, []);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error signing out', (error as Error).message);
    }
  };

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setPage(1);
    await fetchAllData(1);
    setRefreshing(false);
  }, [fetchAllData]);

  const handleUpdateProfilePicture = async () => {
    try {
      setImageUploading(true);
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled) {
        const file = result.assets[0];
        const fileName = `profile/${Date.now()}.jpg`;
        
        // Create form data for upload
        const formData = new FormData();
        formData.append('file', {
          uri: file.uri,
          name: fileName,
          type: 'image/jpeg',
        } as any);

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from('challenge-uploads')
          .upload(fileName, formData, {
            contentType: 'multipart/form-data',
          });

        if (uploadError) throw uploadError;

        // Insert into media table
        const { data: mediaData, error: dbError } = await supabase
          .from('media')
          .insert([{ file_path: fileName }])
          .select('id')
          .single();

        if (dbError) throw dbError;

        // Update profile with new media id
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ profile_media_id: mediaData.id })
          .eq('id', user?.id);

        if (updateError) throw updateError;

        // Update local state
        setUserProfile(prev => ({
          ...prev!,
          profile_media_id: mediaData.id,
          profile_image_url: `${supabase.storageUrl}/object/public/challenge-uploads/${fileName}`
        }));

      }
    } catch (error) {
      console.error('Error updating profile picture:', error);
      Alert.alert('Error', 'Failed to update profile picture');
    } finally {
      setImageUploading(false);
    }
  };

  // Add this to handle pressing outside the menu
  const handlePressOutside = () => {
    if (showMenu) {
      setShowMenu(false);
    }
  };

  // Add this function to handle profile updates
  const handleSaveProfile = async () => {
    try {
      // Check if username is already taken (only if username changed)
      if (editedUsername !== userProfile?.username) {
        const { data: existingUser, error: checkError } = await supabase
          .from('profiles')
          .select('username')
          .eq('username', editedUsername)
          .single();

        if (checkError && checkError.code !== 'PGRST116') {
          throw checkError;
        }

        if (existingUser) {
          throw new Error('Username is already taken');
        }
      }

      // Update profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ 
          username: editedUsername,
          name: editedName 
        })
        .eq('id', user?.id);

      if (updateError) throw updateError;

      // Update local state
      setUserProfile(prev => ({
        ...prev!,
        username: editedUsername,
        name: editedName
      }));
      setIsEditing(false);
    } catch (error) {
      Alert.alert('Error', (error as Error).message);
    }
  };

  if (progressLoading || postsLoading || !userProfile) {
    return <ActivityIndicator size="large" color={colors.light.primary} />;
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
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
          
          if (isCloseToBottom && !postsLoading && hasMore) {
            setPage(prev => prev + 1);
            loadMorePosts();
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
                  source={userProfile.profile_image_url ? { uri: userProfile.profile_image_url } : ProfilePic} 
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
                  <Text style={styles.userTitle}>{userProfile.username}</Text>
                </View>
              )}
            </View>
          </View>
          <View style={styles.headerButtons}>
            <View>
              <TouchableOpacity 
                style={styles.settingsButton}
                onPress={(e) => {
                  e.stopPropagation(); // Prevent the click from bubbling up
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
          </View>
        </View>
        {data && <UserProgress challengeData={data.challengeData} weekData={data.weekData} />}
        <Text style={styles.pastChallengesTitle}>Your Posts</Text>
        {userPosts.map((post) => (
          <Post
            key={post.id}
            profilePicture={userProfile.profile_image_url ? { uri: userProfile.profile_image_url } : ProfilePic}
            name={userProfile.name}
            username={userProfile.username}
            text={post.body}
            media={post.media_file_path ? { uri: post.media_file_path } : undefined}
            likes={post.likes || 0}
            comments={post.comments || 0}
            postId={post.id}
            userId={user?.id}
            setPostCounts={() => {}}
            userMap={userMap}
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
            source={userProfile?.profile_image_url ? { uri: userProfile.profile_image_url } : ProfilePic}
            style={styles.fullScreenImage}
            resizeMode="contain"
          />
        </View>
      </Modal>
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

export default ProfileScreen;
