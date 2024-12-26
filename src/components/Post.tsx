import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  View, 
  StyleSheet,
  Modal,
  TouchableOpacity,
  Pressable,
  KeyboardAvoidingView,
  Platform,
  TouchableWithoutFeedback,
  GestureResponderEvent,
  Alert,
  Share,
} from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome'; 
import { CommentsModal } from './Comments'; 
import { colors } from '../constants/Colors';
import { VideoView, useVideoPlayer } from 'expo-video';
import { Text } from './StyledText';
import { Image } from 'expo-image';
import { useAuth } from '../contexts/AuthContext';
import { User } from '../models/User';
import { useFetchComments } from '../hooks/useFetchComments';
import { router } from 'expo-router';
import { Menu, MenuTrigger, MenuOptions, MenuOption } from 'react-native-popup-menu';
import { Post as PostType } from '../types';
import { postService } from '../services/postService';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import ImageViewer from 'react-native-image-zoom-viewer';

interface PostProps {
  post: PostType;
  postUser: User;
  setPostCounts?: React.Dispatch<React.SetStateAction<{ [key: number]: { likes: number; comments: number } }>>;
  isPostPage?: boolean;
  onPostDeleted?: () => void;
}

const Post: React.FC<PostProps> = ({ 
  post,
  postUser, 
  setPostCounts,
  isPostPage = false,
}) => {
  const { t } = useLanguage();

  if (!post) return null;
  
  const [showComments, setShowComments] = useState(false);
  const [liked, setLiked] = useState(post.liked);
  const [likeCount, setLikeCount] = useState(post.likes_count);
  const [commentCount, setCommentCount] = useState(post.comments_count || 0);
  const [showFullScreenImage, setShowFullScreenImage] = useState(false);
  const { user } = useAuth();
  const { comments: commentList, loading: commentsLoading, fetchComments } = useFetchComments(post.id);
  const [profileImageUrl, setProfileImageUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadProfileImage = async () => {
      if (postUser?.profileImageUrl?.startsWith('http')) {
        const relativePath = postUser.profileImageUrl.split('challenge-uploads/')[1];
        const { data } = await supabase.storage
          .from('challenge-uploads')
          .getPublicUrl(relativePath, {
            transform: {
              quality: 20,
              width: 100,
              height: 100,
            },
          });
        setProfileImageUrl(data.publicUrl);
      }
    };

    loadProfileImage();
  }, [postUser?.profileImageUrl]);

  useEffect(() => {
    const initializeLikes = async () => {
      const likes = await postService.fetchLikes(post.id);
      setLiked(likes.some((like) => like.user_id === user?.id));
      setLikeCount(likes.length);
    };

    if (post.id) {
      initializeLikes();
    }
  }, [post.id]);

  useEffect(() => {
    setCommentCount(post.comments_count);
  }, [post.comments_count]);

  const updateParentCounts = useCallback((newLikeCount: number, newCommentCount: number) => {
    if (setPostCounts) {
      setPostCounts(prevCounts => ({
        ...prevCounts,
        [post.id]: {
          likes: newLikeCount,
          comments: newCommentCount,
        },
      }));
    }
  }, [post.id, setPostCounts]);

  const handleLikeToggle = async () => {
    if (!post.id || !post.user_id || !user?.id) {
      console.error(t('Missing required data for like toggle'));
      return;
    }

    const isLiking = !liked;
    setLiked(isLiking);
    const newLikeCount = isLiking ? likeCount + 1 : likeCount - 1;
    setLikeCount(newLikeCount);
    updateParentCounts(newLikeCount, commentCount);

    const result = await postService.toggleLike(post.id, user.id, post.user_id);
    
    if (result === null) {
      setLiked(!isLiking);
      setLikeCount(prevCount => isLiking ? prevCount - 1 : prevCount + 1);
    }
  };

  const handleCommentAdded = (increment: number) => {
    const newCommentCount = commentCount + increment;
    setCommentCount(newCommentCount);
    updateParentCounts(likeCount, newCommentCount);
  };

  const isVideo = (source: string) => {
    return source.match(/\.(mp4|mov|avi|wmv)$/i);
  };

  const handleMediaPress = () => {
    if (post.media?.file_path && isVideo(post.media.file_path)) {
      return;
    }

    setShowFullScreenImage(true);
  };

  const renderMedia = () => {
    if (!post.media?.file_path) return null;
    
    if (isVideo(post.media?.file_path)) {
      const player = useVideoPlayer(post.media?.file_path);
      
      return (
        <TouchableOpacity 
          onPress={handleMediaPress}
          activeOpacity={1}
        >
          <VideoView
            player={player}
            style={styles.mediaContent}
            contentFit="cover"
            nativeControls
          />
        </TouchableOpacity>
      );
    }
    return (
      <TouchableOpacity 
        onPress={handleMediaPress}
        activeOpacity={1}
      >
        <Image
          source={{ uri: post.media?.file_path }}
          style={styles.mediaContent}
          cachePolicy="memory-disk" 
          contentFit="cover"
          transition={200}
        />
      </TouchableOpacity>
    );
  };

  const handleOpenComments = () => {
    setShowComments(true);
    fetchComments();
  };

  const handlePostPress = (e: GestureResponderEvent) => {
    if (e.target === e.currentTarget) {
      router.push(`/post/${post.id}`);
    }
  };

  const handleProfilePress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    router.push(`/profile/${postUser.id}`);
  }
  
  const handleReportPost = () => {
    Alert.alert(
      t('Report Post'),
      t('Are you sure you want to report this post?'),
      [
        {
          text: t('Cancel'),
          style: 'cancel'
        },
        {
          text: t('Report'),
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;
            
            await postService.reportPost(post.id, user.id, post.user_id);
          }
        }
      ]
    );
  };

  const handleBlockUser = () => {
    Alert.alert(
      t('Block User'),
      t('Are you sure you want to block this user?'),
      [
        {
          text: t('Cancel'),
          style: 'cancel'
        },
        {
          text: t('Block'),
          style: 'destructive',
          onPress: async () => {
            if (!user?.id) return;
            
            await postService.blockUser(user.id, post.user_id);
          }
        }
      ]
    );
  };

  const handleDeletePost = async () => {
    Alert.alert(
      t('Delete Post'),
      t('Are you sure you want to delete this post?'),
      [
        {
          text: t('Cancel'),
          style: 'cancel'
        },
        {
          text: t('Delete'),
          style: 'destructive',
          onPress: async () => {
            await postService.deletePost(post.id);
          }
        }
      ]
    );
  };

  const handleChallengePress = (e: GestureResponderEvent) => {
    e.stopPropagation();
    if (post.challenge_id) {
      router.push(`/challenge/${post.challenge_id}`);
    }
  };

  const getOriginalImageUrl = (filePath: string) => {
    if (filePath.startsWith('http') && filePath.includes('challenge-uploads/')) {
      const relativePath = filePath.split('challenge-uploads/')[1].split('?')[0];
      const { data } = supabase.storage
        .from('challenge-uploads')
        .getPublicUrl(relativePath);
      return data.publicUrl;
    }
    return filePath;
  };

  const handleImageLongPress = async () => {
    try {
      const imageUrl = getOriginalImageUrl(post.media?.file_path || '');
      
      // Download the image first
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const base64Data = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          const base64data = reader.result;
          resolve(base64data);
        };
      });

      if (Platform.OS === 'ios') {
        await Share.share({
          url: base64Data as string,
        });
      } else {
        await Share.share({
          message: imageUrl,  // il va falloir voir si ca marche sur android
          url: imageUrl,
        });
      }
    } catch (error) {
      console.error('Error sharing image:', error);
    }
  };

  return (
    <Pressable 
      onPress={handlePostPress} 
      style={[
        styles.container,
        post.challenge_id ? styles.challengeContainer : null
      ]}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={handleProfilePress}>
          <Image 
            source={
              profileImageUrl
                ? { uri: profileImageUrl }
                : require('../assets/images/default-pfp.png')
            }
            style={styles.profilePicture} 
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={handleProfilePress} style={styles.nameContainer}>
          <View style={styles.userInfoContainer}>
            <Text style={styles.name}>{postUser?.name || t('Unknown')}</Text>
            <Text style={styles.username}>@{postUser?.username || t('unknown')}</Text>
          </View>
        </TouchableOpacity>
        <Menu style={styles.menuContainer}>
          <MenuTrigger style={{ padding: 8 }}>
            <Icon name="ellipsis-h" size={16} color={colors.neutral.grey1} />
          </MenuTrigger>
          <MenuOptions customStyles={optionsStyles}>
            {user?.id === post.user_id ? (
              <MenuOption onSelect={handleDeletePost}>
                <Text style={[styles.menuOptionText, { color: 'red' }]}>{t('Delete Post')}</Text>
              </MenuOption>
            ) : (
              <>
                <MenuOption onSelect={handleReportPost}>
                  <Text style={styles.menuOptionText}>{t('Report Post')}</Text>
                </MenuOption>
                <MenuOption onSelect={handleBlockUser}>
                  <Text style={styles.menuOptionText}>{t('Block User')}</Text>
                </MenuOption>
              </>
            )}
          </MenuOptions>
        </Menu>
      </View>
      {post.challenge_id && (
        <TouchableOpacity onPress={handleChallengePress}>
          <View style={styles.challengeBox}>
            <Text style={styles.challengeTitle} numberOfLines={1} ellipsizeMode="tail">
              <Text style={{ fontWeight: 'bold' }}>{t('Challenge:')}</Text> {post.challenge_title}
            </Text>
          </View>
        </TouchableOpacity>
      )}
      {post.body && <Text style={styles.text}>{post.body}</Text>}
      {renderMedia()}
      <View>
      <View style={styles.footer}>
        <TouchableOpacity onPress={handleLikeToggle}>
          <View style={styles.iconContainer}>
            <Icon name={liked ? "heart" : "heart-o"} size={16} color={liked ? "#eb656b" : colors.neutral.grey1} />
            <Text style={styles.iconText}>{likeCount.toString()}</Text>
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={handleOpenComments}>
          <View style={styles.iconContainer}>
            <Icon name="comment-o" size={16} color={colors.neutral.grey1} />
            <Text style={styles.iconText}>{commentCount.toString()}</Text>
          </View>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent
        visible={showComments}
        onRequestClose={() => setShowComments(false)}
      >
        <View style={styles.modalOverlay}>
          <TouchableWithoutFeedback onPress={() => setShowComments(false)}>
            <View style={styles.modalBackground} />
          </TouchableWithoutFeedback>

          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalContainer}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 25}
          >
            <CommentsModal
              initialComments={commentList}
              onClose={() => setShowComments(false)}
              loading={commentsLoading}
              postId={post.id}
              postUserId={postUser.id}
              onCommentAdded={handleCommentAdded}
            />
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <Modal
        animationType="fade"
        transparent
        visible={showFullScreenImage}
        onRequestClose={() => setShowFullScreenImage(false)}
      >
        <View style={styles.fullScreenContainer}>
          <View style={styles.fullScreenHeader}>
            <Menu>
              <MenuTrigger style={styles.fullScreenMenuTrigger}>
                <Icon name="ellipsis-h" size={20} color="white" />
              </MenuTrigger>
              <MenuOptions customStyles={optionsStyles}>
                <MenuOption onSelect={handleImageLongPress}>
                  <Text style={styles.menuOptionText}>{t('Save Image')}</Text>
                </MenuOption>
              </MenuOptions>
            </Menu>
          </View>
          <ImageViewer
            imageUrls={[{ 
              url: getOriginalImageUrl(post.media?.file_path || ''),
            }]}
            enableSwipeDown
            onSwipeDown={() => setShowFullScreenImage(false)}
            renderIndicator={() => null}
            onLongPress={handleImageLongPress}
            saveToLocalByLongPress={false}
            enablePreload={true}
            style={styles.fullScreenImage}
          />
        </View>
      </Modal>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 8,
    padding: 10,
    paddingBottom: 16,
    borderRadius: 8,
    borderColor: '#ccc',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  challengeContainer: {
    // backgroundColor: '#ffeecc',
    // borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  profilePicture: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  nameContainer: {
    flex: 1,
  },
  userInfoContainer: {
    flexDirection: 'column',
  },
  name: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  username: {
    fontSize: 12,
    color: '#666',
  },
  text: {
    fontSize: 14,
    marginBottom: 8,
  },
  mediaContent: {
    width: '100%',
    height: undefined,
    aspectRatio: 1,
    borderRadius: 8,
    marginTop: 8,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
    marginLeft: 5,
  },
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 32, 
  },
  iconText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#5A5A5A',
  },
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    height: '100%',
  },
  modalBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: '100%',
    maxHeight: '75%',
    height: '100%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  fullScreenContainer: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullScreenImageWrapper: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    marginLeft: 'auto',
    padding: 8,
  },
  menuOptionText: {
    fontSize: 16,
    padding: 10,
  },
  challengeBox: {
    backgroundColor: colors.light.accent2,
    paddingHorizontal: 16,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1.25,
    borderColor: colors.light.primary,
    marginBottom: 4,
    marginTop: 4,
    alignSelf: 'flex-start',
    width: '100%',
  },
  challengeTitle: {
    color: colors.light.primary,
    fontSize: 13,
  },
  closeButton: {
    position: 'absolute',
    top: 10,
    right: 10,
    padding: 5,
    borderRadius: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.5)',
  },
  closeButtonText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  fullScreenImage: {
    width: '100%',
    height: '100%',
  },
  fullScreenHeader: {
    position: 'absolute',
    top: 40,
    right: 0,
    zIndex: 9999,
    padding: 16,
  },
  fullScreenMenuTrigger: {
    padding: 8,
  },
});

const optionsStyles = {
  optionsContainer: {
    borderRadius: 10,
    padding: 5,
    width: 150,
    backgroundColor: 'white',
    zIndex: 9999,
    marginTop: 45,
  },
};

export default Post;
