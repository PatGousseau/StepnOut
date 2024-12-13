import React, { useEffect, useRef, useState } from 'react';
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
      notificationText = t('liked your post');
    } else if (item.action_type === 'comment') {
      const commentText = item.comment?.body || '';
      notificationText = t('commented: "(comment)"', { comment: commentText });
    }
    
    const handleNotificationPress = () => {
      handleClose();
      router.push(`/post/${item.post_id}`);
    };
    
    return (
      <TouchableOpacity 
        style={styles.notificationItem} 
        onPress={handleNotificationPress}
      >
        <View style={styles.notificationContent}>
          <Text style={styles.notificationText}>
            <Text style={styles.userName}>{triggerUserName}</Text>
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
      <View style={styles.overlay}>
        <Animated.View 
          style={[
            styles.sidebar,
            {
              transform: [{ translateX }],
              opacity
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
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: Dimensions.get('window').width * 0.8,
    backgroundColor: colors.light.background,
    shadowColor: '#000',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    borderTopLeftRadius: 16,
    borderBottomLeftRadius: 16,
    paddingLeft:8,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    padding: 16,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: colors.light.primary,
    textAlign: 'center',
  },
  listContainer: {
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: 'row',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
  },
  notificationContent: {
    flex: 1,
  },
  notificationText: {
    fontSize: 14,
    marginBottom: 4,
  },
  timeText: {
    fontSize: 12,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
  },
  userName: {
    fontWeight: 'bold',
  },
  commentText: {
    fontStyle: 'italic',
    color: '#666',
  },
  divider: {
    height: 1,
    backgroundColor: '#cfcbca',
    width: '100%',
  },
});

export default NotificationSidebar; 