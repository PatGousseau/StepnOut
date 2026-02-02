import React, { useEffect, useRef } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
  FlatList,
  Dimensions,
  SafeAreaView,
  Platform,
  Animated,
  PanResponder,
} from 'react-native';
import { Text } from './StyledText';
import { colors } from '../constants/Colors';
import { formatDistanceToNow } from 'date-fns';
import { Notification } from '../types';
import { router } from 'expo-router';
import { useLanguage } from '../contexts/LanguageContext';

interface NotificationSidebarProps {
  visible: boolean;
  notifications: Notification[];
  onClose: () => void;
}

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.8;

const NotificationSidebar: React.FC<NotificationSidebarProps> = ({ visible, onClose, notifications }) => {
  const { t } = useLanguage();
  const translateX = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      translateX.setValue(SIDEBAR_WIDTH);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: SIDEBAR_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      onClose();
    });
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => {
        return true;
      },
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dx) > 5;
      },
      onPanResponderGrant: () => {
      },
      onPanResponderMove: (_, gestureState) => {
        const newX = Math.max(0, gestureState.dx);
        translateX.setValue(newX);
      },
      onPanResponderRelease: (_, gestureState) => {
        const velocity = gestureState.vx;
        const shouldClose = gestureState.dx > SIDEBAR_WIDTH / 2 || velocity > 0.5;
        
        if (shouldClose) {
          handleClose();
        } else {
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  const renderNotification = ({ item }: { item: Notification }) => {
    const triggerUserName = item.trigger_profile?.username || item.trigger_profile?.name || t('Unknown User');
    
    let notificationText = '';
    if (item.action_type === 'like') {
      notificationText = item.comment_id ? t('liked your comment') : t('liked your post');
    } else if (item.action_type === 'comment') {
      const commentText = item.comment?.body || '';
      notificationText = t('commented: "(comment)"', { comment: commentText });
    }
    
    const handlePostPress = () => {
      handleClose();
      router.push(`/post/${item.post_id}`);
    };

    const handleProfilePress = () => {
      handleClose();
      router.push(`/profile/${item.trigger_user_id}`);
    };
    
    return (
      <TouchableOpacity 
        style={styles.notificationItem} 
        onPress={handlePostPress}
        activeOpacity={0.7}
      >
        <View style={styles.notificationContent}>
          <Text style={styles.notificationText}>
            <Text 
              style={styles.userName} 
              onPress={handleProfilePress}
              suppressHighlighting={false}
            >
              {triggerUserName}
            </Text>
            {' '}
            {notificationText}
          </Text>
          <Text style={styles.timeText}>
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true })}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View 
          style={[
            styles.overlay,
            { opacity }
          ]}
        >
          <Animated.View 
            style={[
              styles.sidebar,
              {
                transform: [{ translateX }],
              }
            ]}
            {...panResponder.panHandlers}
          >
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.header}>
                <View style={styles.headerContent}>
                  <Text style={styles.title}>{t('Notifications')}</Text>
                </View>
                <View style={styles.divider} />
              </View>

              {notifications.length > 0 ? (
                <FlatList
                  data={notifications}
                  renderItem={renderNotification}
                  keyExtractor={item => item.notification_id.toString()}
                  contentContainerStyle={styles.listContainer}
                />
              ) : (
                <View style={styles.emptyContainer}>
                  <Text style={styles.emptyText}>{t('No notifications yet')}</Text>
                </View>
              )}
            </SafeAreaView>
          </Animated.View>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  divider: {
    backgroundColor: '#cfcbca',
    height: 1,
    width: '100%',
  },
  emptyContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  headerContent: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: 16,
    position: 'relative',
  },
  listContainer: {
    flexGrow: 1,
  },
  notificationContent: {
    flex: 1,
  },
  notificationItem: {
    alignItems: 'center',
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
    flexDirection: 'row',
    padding: 16,
  },
  notificationText: {
    fontSize: 14,
    marginBottom: 4,
  },
  overlay: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  sidebar: {
    backgroundColor: colors.light.background,
    borderBottomLeftRadius: 16,
    borderTopLeftRadius: 16,
    bottom: 0,
    elevation: 5,
    paddingLeft:8,
    position: 'absolute',
    right: 0,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    top: 0,
    width: Dimensions.get('window').width * 0.8,
  },
  timeText: {
    color: '#666',
    fontSize: 12,
  },
  title: {
    color: colors.light.primary,
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  userName: {
    color: colors.light.primary,
    fontWeight: 'bold',
  },
});

export default NotificationSidebar; 