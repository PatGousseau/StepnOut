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

async function getBadgeCount(userId: string): Promise<number> {
    try {
        const [{ data: unreadNotificationCount, error: notificationError }, { data: unreadDmCount, error: dmError }] =
            await Promise.all([
                supabase.rpc('get_unread_notification_count', { target_user_id: userId }),
                supabase.rpc('get_unread_dm_count', { target_user_id: userId }),
            ]);

        if (notificationError) throw notificationError;
        if (dmError) throw dmError;

        return Number(unreadNotificationCount ?? 0) + Number(unreadDmCount ?? 0);
    } catch (error) {
        console.error('Error fetching badge count:', error);
        return 0;
    }
}

// Send a push notification
async function sendPushNotification(
    token: string,
    title: string,
    body: string,
    data: object = {},
    badge?: number
) {
    const message = {
        to: token,
        sound: 'default',
        title,
        body,
        data,
        ...(typeof badge === 'number' ? { badge } : {}),
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

export async function sendDmNotification(
    senderId: string,
    conversationId: string,
    messageBody: string
) {
    const { data: memberRows, error: memberError } = await supabase
        .from('dm_conversation_members')
        .select('user_id')
        .eq('conversation_id', conversationId);

    if (memberError) {
        console.error('Error fetching DM members for push notification:', memberError);
        return;
    }

    const recipientId = memberRows?.find(row => row.user_id !== senderId)?.user_id;
    if (!recipientId) return;

    const { data: senderProfile, error: senderError } = await supabase
        .from('profiles')
        .select('username, name')
        .eq('id', senderId)
        .single();

    if (senderError) {
        console.error('Error fetching sender profile for DM notification:', senderError);
        return;
    }

    const pushToken = await getPushToken(recipientId);
    if (!pushToken) return;

    const senderName = senderProfile?.name || senderProfile?.username || 'Someone';
    const preview = messageBody.trim().slice(0, 120);
    const badge = await getBadgeCount(recipientId);

    await sendPushNotification(
        pushToken,
        senderName,
        preview || 'Sent you a message',
        {
            type: 'dm',
            conversationId,
            senderId,
        },
        badge
    );
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
    const badge = await getBadgeCount(recipientId);

    await sendPushNotification(pushToken, title, body, data, badge);
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
    const badge = await getBadgeCount(recipientId);

    await sendPushNotification(pushToken, title, body, data, badge);
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
    const badge = await getBadgeCount(recipientId);

    await sendPushNotification(pushToken, title, body, data, badge);
}

// Handle sending notifications for new challenges
export async function sendNewChallengeNotification(recipientId: string, challengeId: string, challengeTitle: string) {
    // Save notification to database so it persists (and shows in the in-app badge)
    const { error: dbError } = await supabase
        .from('notifications')
        .insert([{
            user_id: recipientId,
            trigger_user_id: null,
            action_type: 'new_challenge',
            is_read: false,
            challenge_id: challengeId,
        }]);

    if (dbError) {
        console.error('Error saving new challenge notification to database:', dbError);
        // still try to send push
    }

    const pushToken = await getPushToken(recipientId);
    if (!pushToken) return;

    const title = 'Nuova sfida settimanale!';
    const body = challengeTitle;
    const data = { challengeId };
    const badge = await getBadgeCount(recipientId);

    await sendPushNotification(pushToken, title, body, data, badge);
}

// Fetch all user IDs
async function getAllUserIds(): Promise<string[]> {
    const allIds: string[] = [];
    const pageSize = 1000;
    let from = 0;
    let hasMore = true;

    while (hasMore) {
        const { data, error } = await supabase
            .from('profiles')
            .select('id')
            .range(from, from + pageSize - 1);

        if (error) {
            console.error('Error fetching user IDs:', error);
            return allIds;
        }

        allIds.push(...data.map(profile => profile.id));

        hasMore = data.length === pageSize;
        from += pageSize;
    }

    return allIds;
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
): Promise<{ sent: number; failed: number; noToken: number }> {
    let sent = 0;
    let failed = 0;
    let noToken = 0;

    const notifications = userIds.map(async (userId) => {
        const pushToken = await getPushToken(userId);
        if (!pushToken) {
            noToken++;
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
    return { sent, failed, noToken };
}

export { getAllUserIds };
