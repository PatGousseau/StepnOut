import { Stack } from "expo-router";
import { PersonalizedQuestIntake } from "../../components/personalizedQuest/PersonalizedQuestIntake";

export default function PersonalizedQuestIntakeScreen() {
  return (
    <>
      <Stack.Screen options={{ headerShown: false }} />
      <PersonalizedQuestIntake />
    </>
  );
}
