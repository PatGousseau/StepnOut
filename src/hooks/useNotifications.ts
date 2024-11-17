import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import React from 'react';

interface Notification {
  notification_id: number;
  user_id: string;
  trigger_user_id: string;
  post_id: number;
  action_type: 'like' | 'comment';
  is_read: boolean;
  created_at: string;
  updated_at: string;
  trigger_profile: {
    username: string;
    name: string;
  };
}

export const useNotifications = () => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from('notifications')
        .select(`
          *,
          trigger_profile:profiles!notifications_trigger_user_id_fkey (
            username,
            name
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notifications = (data || []).map(notification => ({
        ...notification,
        trigger_user: notification.trigger_profile
      }));
      
      setNotifications(notifications);
      const newUnreadCount = notifications.filter(n => !n.is_read).length;
      setUnreadCount(newUnreadCount);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('notification_id', notificationId);

      if (error) throw error;

      setNotifications(prev =>
        prev.map(n =>
          n.notification_id === notificationId ? { ...n, is_read: true } : n
        )
      );
      setUnreadCount(prev => {
        const newCount = Math.max(0, prev - 1);
        console.log('Marked as read, new unreadCount:', newCount);
        return newCount;
      });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('notifications')
        .update({ is_read: true })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
      setUnreadCount(0);

    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchNotifications();

      const subscription = supabase
        .channel('notifications')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'notifications',
            filter: `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Received real-time update:', payload.eventType);
            if (payload.eventType === 'INSERT') {
              setNotifications(prev => [payload.new as Notification, ...prev]);
              setUnreadCount(prev => prev + 1);
            } else if (payload.eventType === 'UPDATE') {
              setNotifications(prev => {
                const updated = prev.map(n =>
                  n.notification_id === (payload.new as Notification).notification_id
                    ? payload.new as Notification
                    : n
                );
                const newUnreadCount = updated.filter(n => !n.is_read).length;
                setUnreadCount(newUnreadCount);
                console.log('Updated unreadCount after real-time update:', newUnreadCount);
                return updated;
              });
            }
          }
        )
        .subscribe();

      return () => {
        console.log('Cleaning up subscription');
        subscription.unsubscribe();
      };
    }
  }, [user]);

  // Add memoization to ensure stable reference
  const value = React.useMemo(() => {
    console.log('useNotifications hook returning value:', { unreadCount });
    return {
      notifications,
      unreadCount,
      loading,
      markAsRead,
      markAllAsRead,
      fetchNotifications,
    };
  }, [notifications, unreadCount, loading]);

  return value;
}; 