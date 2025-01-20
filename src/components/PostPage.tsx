import React, { useEffect, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  FlatList,
  LogBox,
} from "react-native";
import Post from "./Post";
import { useLocalSearchParams } from "expo-router";
import { useFetchHomeData } from "../hooks/useFetchHomeData";
import { Text } from "./StyledText";
import { colors } from "../constants/Colors";
import { Post as PostType } from "../types"; // todo: rename one of the Post types
import { CommentsList } from "./Comments";
import { useFetchComments } from "../hooks/useFetchComments";
import { supabase } from "../lib/supabase";

const PostPage = () => {
  const params = useLocalSearchParams();
  const postId = typeof params.id === "string" ? parseInt(params.id) : params.id;

  const { userMap, fetchPost } = useFetchHomeData();
  const { comments, loading: commentsLoading, fetchComments } = useFetchComments(postId);
  const [post, setPost] = useState<PostType | null>(null);
  const [loading, setLoading] = useState(false);
  const [postUserId, setPostUserId] = useState("");

  useEffect(() => {
    LogBox.ignoreLogs(["VirtualizedLists should never be nested"]);

    const loadPost = async () => {
      setLoading(true);
      try {
        if (!postId) {
          console.error("No id available:", params);
          return;
        }
        const fetchedPost = await fetchPost(postId);
        setPost(fetchedPost);
      } catch (error) {
        console.error("Error loading post:", error);
      } finally {
        setLoading(false);
      }
    };

    async function getPostUserId() {
      const { data, error } = await supabase
        .from("post")
        .select("user_id")
        .eq("id", postId)
        .single();

      if (!error && data) {
        setPostUserId(data.user_id);
      }
    }

    loadPost();
    getPostUserId();
    fetchComments();
  }, [postId]);

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color={colors.light.primary} />
      </View>
    );
  }

  if (!post || !userMap[post.user_id]) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Post not found</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
    >
      <View style={styles.scrollViewContent}>
        <Post post={post} postUser={userMap[post.user_id]} setPostCounts={() => {}} />
        <View style={styles.commentsContainer}>
          <CommentsList
            comments={comments.slice(-3)}
            loading={commentsLoading}
          />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  centered: {
    alignItems: "center",
    justifyContent: "center",
  },
  commentsSection: {
    backgroundColor: colors.light.background,
    borderTopColor: "#eee",
    borderTopWidth: 1,
    flex: 1,
    paddingHorizontal: 16,
  },
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  commentsContainer: {
    paddingTop: 10,
    paddingHorizontal: 10,
  },
});

export default PostPage;
