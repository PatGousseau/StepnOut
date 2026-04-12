import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from "react-native";
import { router } from "expo-router";
import { colors } from "../constants/Colors";
import { profileService, UserSearchResult } from "../services/profileService";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";

const SearchUsersScreen: React.FC = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const normalizedQuery = useMemo(() => query.trim(), [query]);

  useEffect(() => {
    if (!isAdmin) {
      router.replace("/");
      return;
    }

    if (!normalizedQuery) {
      setResults([]);
      setLoading(false);
      return;
    }

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);
        const users = await profileService.searchUsers(normalizedQuery);
        setResults(users);
      } catch (error) {
        console.error("Error searching users:", error);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [isAdmin, normalizedQuery]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t("Search users")}</Text>

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={t("Search by name or username")}
        placeholderTextColor={colors.light.lightText}
        style={styles.input}
        autoCapitalize="none"
      />

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.light.primary} />
        </View>
      )}

      {!loading && normalizedQuery.length === 0 && (
        <Text style={styles.helperText}>{t("Start typing to find people")}</Text>
      )}

      {!loading && normalizedQuery.length > 0 && results.length === 0 && (
        <Text style={styles.helperText}>{t("No users found")}</Text>
      )}

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        keyboardShouldPersistTaps="handled"
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.userRow}
            onPress={() => router.push(`/profile/${item.id}`)}
          >
            <Image
              source={
                item.profileImageUrl
                  ? { uri: item.profileImageUrl }
                  : require("../assets/images/default-pfp.png")
              }
              style={styles.avatar}
            />
            <View style={styles.userTextContainer}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.username}>@{item.username}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.light.background,
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.light.primary,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: colors.neutral.grey1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.light.primary,
    marginBottom: 12,
  },
  loadingRow: {
    alignItems: "center",
    paddingVertical: 12,
  },
  helperText: {
    color: colors.light.lightText,
    textAlign: "center",
    marginTop: 12,
  },
  userRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.grey1 + "66",
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    marginRight: 12,
    backgroundColor: colors.neutral.grey1,
  },
  userTextContainer: {
    flex: 1,
  },
  name: {
    color: colors.light.primary,
    fontSize: 16,
    fontWeight: "600",
  },
  username: {
    color: colors.light.lightText,
    marginTop: 2,
  },
});

export default SearchUsersScreen;
