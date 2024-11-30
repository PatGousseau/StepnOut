import { Stack } from 'expo-router';
import { StyleSheet, SafeAreaView } from 'react-native';
import { ProfilePage } from '../../components/ProfilePage';
import { useLocalSearchParams } from 'expo-router';

export default function ProfilePageWrapper() {
  const { id } = useLocalSearchParams();
  
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ProfilePage userId={typeof id === 'string' ? id : undefined} />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 