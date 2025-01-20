import { Stack } from "expo-router";
import PostPage from "../../components/PostPage";
import { StyleSheet, SafeAreaView, View, ScrollView } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Text } from "../../components/StyledText";

export default function PostPageWrapper() {
  const params = useLocalSearchParams();
  const postId = Array.isArray(params.id)
    ? parseInt(params.id[0])
    : typeof params.id === "string"
    ? parseInt(params.id)
    : null;

  if (!postId) {
    return <Text>No post ID provided</Text>;
  }

  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <PostPage />
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
  },
  postContainer: {
    // Remove flex constraint to allow natural height
  },
  commentsContainer: {
    paddingTop: 10,
    paddingHorizontal: 10,
  },
});
