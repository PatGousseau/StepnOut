import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { supabase } from './supabase'; 

export async function registerForPushNotificationsAsync(userId: string) {
    
    if (!Device.isDevice) {
        return null;
    }
    
    // Check if permission is granted
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        alert('Failed to get push token for notifications!');
        return null;
    }

    try {
        const token = (await Notifications.getExpoPushTokenAsync({
            projectId: '6ac120ac-1dca-4d86-9088-4dbe426901fc'
        })).data;

        await savePushTokenToSupabase(userId, token);
        return token;
    } catch (error) {
        console.error('Error getting push token:', error);
        return null;
    }
}

async function savePushTokenToSupabase(userId: string, token: string) {
    
    const { error } = await supabase
        .from('profiles')
        .update({ push_token: token }) 
        .eq('id', userId);

    if (error) {
        console.error('Error saving push token to Supabase:', error);
    } else {
        console.log('Push token saved successfully!');
    }
}
