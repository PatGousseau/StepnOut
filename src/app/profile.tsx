import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, ScrollView, ActivityIndicator, TouchableOpacity, Alert, Modal } from 'react-native';
import UserProgress from '../components/UserProgress';
import Post from '../components/Post';
import ProfilePic from '../assets/images/profile-pic.png';
import { useFetchHomeData } from '../hooks/useFetchHomeData';
import useUserProgress from '../hooks/useUserProgress';
import { useAuth } from '../contexts/AuthContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { colors } from '../constants/Colors';
import { supabase } from '../lib/supabase';

// Update type for user profile data
type UserProfile = {
  username: string;
  name: string;
};

const ProfileScreen: React.FC = () => {
  const { user, signOut } = useAuth();
  const { data, loading: progressLoading, error } = useUserProgress();
  const { posts, userMap, loading: postsLoading } = useFetchHomeData();
  const [userPosts, setUserPosts] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!user?.id) return;
      
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('username, name')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return;
      }

      setUserProfile(profile);
    };

    fetchUserProfile();
  }, [user?.id]);

  useEffect(() => {
    const loadUserPosts = () => {
      const filteredPosts = posts.filter(post => post.user_id === user?.id);
      setUserPosts(filteredPosts);
    };
    loadUserPosts();
  }, [posts, user?.id]);

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      Alert.alert('Error signing out', (error as Error).message);
    }
  };

  if (progressLoading || postsLoading || !userProfile) {
    return <ActivityIndicator size="large" color="#0000ff" />;
  }

  if (error) {
    return <Text>Error: {error}</Text>;
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileHeader}>
        <View style={styles.headerLeft}>
          <Image source={ProfilePic} style={styles.avatar} />
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
