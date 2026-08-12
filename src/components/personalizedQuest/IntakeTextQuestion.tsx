import React from "react";
import { StyleSheet, TextInput, TouchableOpacity, View } from "react-native";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { colors } from "../../constants/Colors";
import { useLanguage } from "../../contexts/LanguageContext";
import { Text } from "../StyledText";

type IntakeTextQuestionProps = {
  question: string;
  placeholder: string;
  value: string;
  onChangeText: (value: string) => void;
  onSubmit: () => void;
  autoFocus?: boolean;
  /**
   * Seam for voice input. No speech dependency exists yet; when one is added,
   * passing this handler is all that is needed to surface the mic.
   */
  onVoiceInput?: () => void;
};

/**
 * Single-line, deliberately. A textarea invites an essay, and the intake is
 * built for speed.
 */
export const IntakeTextQuestion: React.FC<IntakeTextQuestionProps> = ({
  question,
  placeholder,
  value,
  onChangeText,
  onSubmit,
  autoFocus,
  onVoiceInput,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.container}>
      <Text style={styles.question}>{t(question)}</Text>

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={value}
          onChangeText={onChangeText}
          placeholder={t(placeholder)}
          placeholderTextColor={colors.light.lightText}
          autoFocus={autoFocus}
          multiline={false}
          returnKeyType="next"
          onSubmitEditing={onSubmit}
          blurOnSubmit={false}
          maxLength={280}
        />

        {!!onVoiceInput && (
          <TouchableOpacity
            onPress={onVoiceInput}
            style={styles.micButton}
            accessibilityLabel={t("Use voice input")}
          >
            <MaterialCommunityIcons name="microphone" size={22} color={colors.sideQuest.text} />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 20,
  },
  input: {
    borderBottomColor: colors.sideQuest.bgBorder,
    borderBottomWidth: 2,
    color: colors.light.text,
    flex: 1,
    fontSize: 18,
    paddingBottom: 10,
    paddingTop: 4,
  },
  inputRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    gap: 8,
  },
  micButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40,
  },
  question: {
    color: colors.light.text,
    fontSize: 24,
    fontWeight: "700",
    lineHeight: 32,
  },
});
