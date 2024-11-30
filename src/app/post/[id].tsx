import { Stack } from 'expo-router';
import PostPage from '../../components/PostPage';
import { StyleSheet, SafeAreaView } from 'react-native';

export default function PostPageWrapper() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <PostPage />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
}); 