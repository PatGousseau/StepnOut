import { supabase } from './supabase';

// Fetch a user's push token from Supabase
async function getPushToken(userId: string): Promise<string | null> {
    const { data, error } = await supabase
        .from('profiles')
        .select('push_token')
        .eq('id', userId)
        .single();

    if (error) {
        console.error('Error fetching push token:', error);
        return null;
    }

    return data.push_token;
}

// Send a push notification
async function sendPushNotification(token: string, title: string, body: string, data: object = {}) {
    const message = {
        to: token,
        sound: 'default',
        title,
        body,
        data,
    };

    try {
        const response = await fetch('https://exp.host/--/api/v2/push/send', {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(message),
        });

        const result = await response.json();

        if (result.errors) {
            console.error('Error sending notification:', result.errors);
        }
    } catch (error) {
        // Don't let push notification failures bubble up and break other operations
        console.error('Error sending push notification:', error);
    }
}

// Handle sending notifications for likes
export async function sendLikeNotification(
    senderId: string | undefined, 
    senderUsername: string, 
    recipientId: string, 
    postId: string,
    translations: { title: string; body: string },
    commentId?: string
) {
    // Save notification to database
    const { error: dbError } = await supabase
        .from('notifications')
        .insert([{
            user_id: recipientId,
            trigger_user_id: senderId,
            post_id: postId,
            action_type: 'like',
            is_read: false,
            ...(commentId && { comment_id: commentId })
        }]);

    if (dbError) {
        console.error('Error saving notification to database:', dbError);
        return;
    }

    // Send push notification
    const pushToken = await getPushToken(recipientId);
    if (!pushToken) return;
    
    const title = translations.title.replace('(username)', senderUsername);
    const body = translations.body;
    const data = { postId, senderId, ...(commentId ? { commentId } : {}) };

    await sendPushNotification(pushToken, title, body, data);
}

export async function sendReactionNotification(
    senderId: string | undefined,
    senderUsername: string,
    recipientId: string,
    postId: string,
    emoji: string,
    translations: { title: string; body: string },
    commentId?: string
) {
    const { error: dbError } = await supabase
        .from('notifications')
        .insert([{
            user_id: recipientId,
            trigger_user_id: senderId,
            post_id: postId,
            action_type: 'reaction',
            emoji,
            is_read: false,
            ...(commentId && { comment_id: commentId })
        }]);

    if (dbError) {
        console.error('Error saving reaction notification to database:', dbError);
        return;
    }

    const pushToken = await getPushToken(recipientId);
    if (!pushToken) return;

    const title = translations.title.replace('(username)', senderUsername);
    const body = translations.body;
    const data = { postId, senderId, emoji, ...(commentId ? { commentId } : {}) };

    await sendPushNotification(pushToken, title, body, data);
}

// Handle sending notifications for comments
export async function sendCommentNotification(
    senderId: string | undefined, 
    senderUsername: string, 
    recipientId: string, 
    postId: string, 
    commentText: string, 
    commentId: string,
    translations: { title: string; body: string }
) {
    // Save notification to database
    const { error: dbError } = await supabase
        .from('notifications')
        .insert([{
            user_id: recipientId,
            trigger_user_id: senderId,
            post_id: postId,
            action_type: 'comment',
            is_read: false,
            comment_id: commentId,
        }]);

    if (dbError) {
        console.error('Error saving notification to database:', dbError);
        return;
    }

    // Send push notification
    const pushToken = await getPushToken(recipientId);
    if (!pushToken) return;

    const title = translations.title.replace('(username)', senderUsername);
    const body = `"${commentText}"`;
    const data = { postId, senderId, commentId };

    await sendPushNotification(pushToken, title, body, data);
}

// Handle sending notifications for new challenges
export async function sendNewChallengeNotification(recipientId: string, challengeId: string, challengeTitle: string) {
    const pushToken = await getPushToken(recipientId);
    if (!pushToken) return;

    const title = 'Nuova sfida!';
    const body = challengeTitle;
    const data = { challengeId };

    await sendPushNotification(pushToken, title, body, data);
}

// Fetch all user IDs
async function getAllUserIds(): Promise<string[]> {
    const { data, error } = await supabase
        .from('profiles')
        .select('id');

    if (error) {
        console.error('Error fetching user IDs:', error);
        return [];
    }

    return data.map(profile => profile.id);
}

// Handle sending notifications to all users about a new challenge
export async function sendNewChallengeNotificationToAll(challengeId: string, challengeTitle: string) {
    const userIds = await getAllUserIds();

    // Send notification to each user
    const notifications = userIds.map(userId =>
        sendNewChallengeNotification(userId, challengeId, challengeTitle)
    );

    await Promise.all(notifications);
}

// Send custom notification to specific users
export async function sendCustomNotification(
    title: string,
    body: string,
    userIds: string[]
): Promise<{ sent: number; failed: number }> {
    let sent = 0;
    let failed = 0;

    const notifications = userIds.map(async (userId) => {
        const pushToken = await getPushToken(userId);
        if (!pushToken) {
            failed++;
            return;
        }
        try {
            await sendPushNotification(pushToken, title, body, {});
            sent++;
        } catch {
            failed++;
        }
    });

    await Promise.all(notifications);
    return { sent, failed };
}

export { getAllUserIds };
