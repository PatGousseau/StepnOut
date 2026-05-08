import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { supabase } from './supabase';

const PROJECT_ID = '6ac120ac-1dca-4d86-9088-4dbe426901fc';

// Fires the OS permission dialog. Caller should follow up with
// registerPushTokenIfGranted to persist the token on success.
export async function requestNotificationPermission(): Promise<Notifications.PermissionStatus> {
    if (!Device.isDevice) return 'undetermined' as Notifications.PermissionStatus;
    const { status } = await Notifications.requestPermissionsAsync({
        ios: {
            allowAlert: true,
            allowSound: true,
            allowBadge: true,
        },
    });
    return status;
}

// Silent: never prompts. If permission is already granted, fetches
// the Expo push token and saves it to the user's profile.
export async function registerPushTokenIfGranted(userId: string): Promise<string | null> {
    if (!Device.isDevice) return null;

    const { status } = await Notifications.getPermissionsAsync();
    if (status !== 'granted') return null;

    try {
        const token = (await Notifications.getExpoPushTokenAsync({
            projectId: PROJECT_ID,
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
