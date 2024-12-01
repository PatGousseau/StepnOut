import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import React from 'react';
import { Notification } from '../types';

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
          post_id,
          trigger_profile:profiles!notifications_trigger_user_id_fkey (
            username,
            name
          ),
          comment:comments (
            body
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const notifications = (data || []).map(notification => ({
        ...notification,
        trigger_user: notification.trigger_profile,
        body: notification.comment?.[0]?.body || ''
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
    if (!user) return;

    // Initial fetch
    fetchNotifications();

    // Set up real-time subscription
    const channel = supabase
      .channel('notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${user.id}`
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            console.log("got a new notification");
            
            const { data: fullNotification, error } = await supabase
              .from('notifications')
              .select(`
                *,
                post_id,
                trigger_profile:profiles!notifications_trigger_user_id_fkey (
                  username,
                  name
                ),
                comment:comments (
                  body
                )
              `)
              .eq('notification_id', payload.new.notification_id)
              .single();

            if (!error && fullNotification) {
              setNotifications(prev => {
                const exists = prev.some(n => n.notification_id === fullNotification.notification_id);
                if (exists) return prev;
                
                return [{
                  ...fullNotification,
                  trigger_user: fullNotification.trigger_profile,
                  body: fullNotification.comment?.[0]?.body || ''
                }, ...prev];
              });

              setUnreadCount(prev => prev + 1);
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [user]);

//   const value = React.useMemo(() => {

//     return {
//       notifications,
//       unreadCount,
//       loading,
//       markAsRead,
//       markAllAsRead,
//       fetchNotifications,
//     };
//   }, [notifications, unreadCount, loading]);


//   return value; 
   return {
    notifications,
    unreadCount,
    loading,
    markAsRead,
    markAllAsRead,
    fetchNotifications,
  };
}; 

