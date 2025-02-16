import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
} from "react-native";
import Post from "../../components/Post";
import { useFetchHomeData } from "../../hooks/useFetchHomeData";
import { colors } from "../../constants/Colors";
import CreatePost from "../../components/CreatePost";
import { User } from "../../models/User";
import { Loader } from "@/src/components/Loader";
import { StyleSheet } from "react-native";
import { useLanguage } from "../../contexts/LanguageContext";

const Home = () => {
  const { t } = useLanguage();
  const { posts, userMap, loading, fetchAllData, loadMorePosts, hasMore } = useFetchHomeData();
  const [postCounts, setPostCounts] = useState<Record<number, { likes: number; comments: number }>>(
    {}
  );
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"discussions" | "submissions">("discussions");

  useEffect(() => {
    const counts = posts.reduce(
      (acc, post) => ({
        ...acc,
        [post.id]: {
          likes: post.likes_count || 0,
          comments: post.comments_count || 0,
        },
      }),
      {}
    );
    setPostCounts(counts);
  }, [posts]);

  // Initial fetch when component mounts
  useEffect(() => {
    fetchAllData();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchAllData();
    setRefreshing(false);
  }, [fetchAllData]);

  const handlePostDeleted = useCallback(() => {
    // Refresh the posts list
    fetchAllData();
  }, [fetchAllData]);

  // Memoize filtered posts
  const filteredPosts = useMemo(() => {
    return posts.filter((post) => {
      if (activeTab === "submissions") {
        return post.challenge_id != null;
      } else {
        return post.challenge_id == null;
      }
    });
  }, [posts, activeTab]); // Only recompute when posts or activeTab changes

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
    >
      {/* Add tab buttons */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "discussions" && styles.activeTab]}
          onPress={() => setActiveTab("discussions")}
        >
          <Text style={[styles.tabText, activeTab === "discussions" && styles.activeTabText]}>
            {t("Discussions")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tabButton, activeTab === "submissions" && styles.activeTab]}
          onPress={() => setActiveTab("submissions")}
        >
          <Text style={[styles.tabText, activeTab === "submissions" && styles.activeTabText]}>
            {t("Submissions")}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={{ backgroundColor: colors.light.background }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        onScroll={({ nativeEvent }) => {
          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

          if (isCloseToBottom && !loading && hasMore) {
            loadMorePosts();
          }
        }}
        scrollEventThrottle={400}
        keyboardShouldPersistTaps="handled"
      >
        <View style={{ padding: 16 }}>
          {filteredPosts.map((post) => {
            const postUser = userMap[post.user_id] as User;
            return (
              <Post
                key={post.id}
                post={post} // Pass the entire post object
                postUser={postUser}
                setPostCounts={setPostCounts}
                onPostDeleted={handlePostDeleted}
              />
            );
          })}
        </View>

        {loading && <Loader />}
      </ScrollView>

      <View style={styles.createPostButton}>
        <CreatePost />
      </View>
    </KeyboardAvoidingView>
  );
};

// Add new styles
const styles = StyleSheet.create({
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.light.background,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.light.accent,
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  activeTab: {
    borderBottomColor: colors.light.primary,
  },
  tabText: {
    fontSize: 16,
    color: colors.light.lightText,
  },
  activeTabText: {
    color: colors.light.primary,
    fontWeight: "bold",
  },
  createPostButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
});

export default Home;
