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
} from 'react-native';
import { Text } from './StyledText';
import { colors } from '../constants/Colors';
import { useNotifications } from '../hooks/useNotifications';
import { formatDistanceToNow } from 'date-fns';
import { Ionicons } from '@expo/vector-icons';
import { Notification } from '../types';
import { router } from 'expo-router';

interface NotificationSidebarProps {
  visible: boolean;
  notifications: Notification[];
  onClose: () => void;
}

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.8;

const NotificationSidebar: React.FC<NotificationSidebarProps> = ({ visible, onClose, notifications }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const translateX = useRef(new Animated.Value(SIDEBAR_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;



  useEffect(() => {
    if (visible) {
      setModalVisible(true);
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
      setModalVisible(false);
      onClose();
    });
  };

  const renderNotification = ({ item }: { item: Notification }) => {
    const triggerUserName = item.trigger_profile?.username || item.trigger_profile?.name || 'Unknown User';
    
    let notificationText = '';
    if (item.action_type === 'like') {
      notificationText = 'liked your post';
    } else if (item.action_type === 'comment') {
      const commentText = item.comment.body || '';
      notificationText = `commented: "${commentText}"`;
    }
    
    const handleNotificationPress = () => {
      handleClose(); // Close the sidebar
      router.push(`/post/${item.post_id}`); // Navigate to the post
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
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity }]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View 
              style={[
                styles.sidebar,
                {
                  transform: [{ translateX }]
                }
              ]}
            >
              <SafeAreaView style={styles.safeArea}>
                <View style={styles.header}>
                  <View style={styles.headerContent}>
                    <Text style={styles.title}>Notifications</Text>
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
                    <Text style={styles.emptyText}>No notifications yet</Text>
                  </View>
                )}
              </SafeAreaView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
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