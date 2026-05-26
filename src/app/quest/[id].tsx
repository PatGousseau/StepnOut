import { Stack } from "expo-router";
import { SafeAreaView, StyleSheet } from "react-native";
import { QuestPage } from "../../components/QuestPage";

export default function QuestPageWrapper() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <SafeAreaView style={styles.container}>
        <QuestPage />
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
