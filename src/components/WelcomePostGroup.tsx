import React from "react";
import { View, Text, TextStyle, ViewStyle } from "react-native";
import { useRouter } from "expo-router";
import { colors } from "../constants/Colors";
import { useLanguage } from "../contexts/LanguageContext";
import { Post } from "../types";
import { User } from "../models/User";

interface WelcomePostGroupProps {
  posts: Post[];
  userMap: Record<string, User>;
  isExpanded: boolean;
  onToggle: () => void;
}

const WelcomePostGroup = ({ posts, userMap, isExpanded, onToggle }: WelcomePostGroupProps) => {
  const { t } = useLanguage();
  const router = useRouter();

  const latestUser = userMap[posts[0].user_id];
  if (!latestUser) return null;

  const othersCount = posts.length - 1;

  if (isExpanded) {
    return (
      <View style={[styles.container, styles.containerExpanded]}>
        <Text style={styles.emoji}>👋</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.text}>
            {posts.map((post, i) => {
              const user = userMap[post.user_id];
              if (!user) return null;
              return (
                <Text key={post.id}>
                  <Text
                    style={styles.username}
                    onPress={() => router.push(`/profile/${user.id}`)}
                  >
                    {user.name || t("Someone")}
                  </Text>
                  {i < posts.length - 1 ? ", " : " "}
                </Text>
              );
            })}
            {t("joined the community!")}
          </Text>
          <Text style={[styles.toggle, styles.toggleExpanded]} onPress={onToggle}>
            {t("Show less")}
          </Text>
        </View>
      </View>
    );
  }

  const message =
    othersCount === 0
      ? t("joined the community!")
      : t(othersCount === 1 ? "and (count) other joined the community!" : "and (count) others joined the community!")
          .replace("(count)", String(othersCount));

  return (
    <View style={styles.container}>
      <Text style={styles.emoji}>👋</Text>
      <Text style={styles.text}>
        <Text
          style={styles.username}
          onPress={() => router.push(`/profile/${latestUser.id}`)}
        >
          {latestUser.name || t("Someone")}
        </Text>{" "}
        {othersCount > 0 ? (
          <Text style={styles.toggle} onPress={onToggle}>
            {message}
          </Text>
        ) : (
          message
        )}
      </Text>
    </View>
  );
};

const styles: Record<string, ViewStyle | TextStyle> = {
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 6,
  },
  containerExpanded: {
    alignItems: "flex-start",
  },
  emoji: {
    fontSize: 14,
  },
  text: {
    color: colors.neutral.grey3,
    fontSize: 13,
  },
  username: {
    fontWeight: "600",
    color: colors.light.text,
  },
  toggle: {
    color: colors.light.primary,
    fontSize: 13,
  },
  toggleExpanded: {
    marginTop: 8,
  },
};

export default WelcomePostGroup;
