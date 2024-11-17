import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Modal, RefreshControl } from 'react-native';
import UserProgress from '../components/UserProgress';
import Post from '../components/Post';
import ProfilePic from '../assets/images/profile-pic.png';
import { useFetchHomeData } from '../hooks/useFetchHomeData';
import useUserProgress from '../hooks/useUserProgress';
import { useAuth } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/Colors';
import { supabase } from '../lib/supabase';

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

      setUserProfile({
        username: profile.username,
        name: profile.name,
        profile_media_id: profile.profile_media_id,
        profile_image_url: profile.media?.file_path
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

  if (progressLoading || postsLoading || !userProfile) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
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
          <Image 
            source={userProfile.profile_image_url ? { uri: userProfile.profile_image_url } : ProfilePic} 
            style={styles.avatar} 
          />
          <View style={styles.userInfo}>
            <Text style={styles.username}>{userProfile.name}</Text>
            <Text style={styles.userTitle}>Comfort Zone Challenger</Text>
          </View>
        </View>
        <View style={styles.headerButtons}>
          <View>
            <TouchableOpacity 
              style={styles.settingsButton}
              onPress={() => setShowMenu(true)}
            >
              <Icon name="settings-outline" size={24} color="#333" />
            </TouchableOpacity>
            
            {showMenu && (
              <View style={styles.menuContainer}>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={() => {
                    setShowMenu(false);
                    handleSignOut();
                  }}
                >
                  <Text style={styles.menuOptionText}>Sign Out</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </View>
      {data && <UserProgress challengeData={data.challengeData} weekData={data.weekData} />}
      <Text style={styles.pastChallengesTitle}>Your Past Challenges</Text>
      {userPosts.map((post) => (
        <Post
          key={post.id}
          profilePicture={ProfilePic}
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
          <ActivityIndicator size="small" color="#0000ff" />
        </View>
      )}
    </ScrollView>
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
    marginLeft: 16,
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
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  editButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  menuOptionText: {
    fontSize: 14,
    paddingHorizontal: 16,
    color: colors.light.primary,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  menuContainer: {
    position: 'absolute',
    top: '100%',
    right: 0,
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 8,
    minWidth: 100,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
    zIndex: 1000,
  },
  menuItem: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  settingsButton: {
    padding: 8,
  },
});

export default ProfileScreen;
