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
}

// Handle sending notifications for likes
export async function sendLikeNotification(senderId: string | undefined, senderUsername: string,recipientId: string, postId: string) {

    const pushToken = await getPushToken(recipientId);
    if (!pushToken) return;

    const title = `${senderUsername} liked your post!`;
    const body = 'Check it out now.';
    const data = { postId, senderId };

    await sendPushNotification(pushToken, title, body, data);
}

// Handle sending notifications for comments
export async function sendCommentNotification(senderId: string | undefined, senderUsername: string, recipientId: string, postId: string, commentText: string) {
    const pushToken = await getPushToken(recipientId);
    if (!pushToken) return;

    const title = `${senderUsername} commented on your post!`;
    const body = `"${commentText}"`;
    const data = { postId, senderId };

    await sendPushNotification(pushToken, title, body, data);
}

// Handle sending notifications for new challenges
export async function sendNewChallengeNotification(recipientId: string, challengeId: string, challengeTitle: string) {
    const pushToken = await getPushToken(recipientId);
    if (!pushToken) return;

    const title = 'A new challenge is available!';
    const body = challengeTitle
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
