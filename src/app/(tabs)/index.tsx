import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  StyleSheet,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import Post from "../../components/Post";
import WelcomePostGroup from "../../components/WelcomePostGroup";
import FeedSortToggle from "../../components/FeedSortToggle";
import { useFetchHomeData } from "../../hooks/useFetchHomeData";
import { colors } from "../../constants/Colors";
import InlineCreatePost from "../../components/InlineCreatePost";
import { HomeChallengeBanner } from "../../components/HomeChallengeBanner";
import { User } from "../../models/User";
import { Loader } from "@/src/components/Loader";
import { PostsListSkeleton } from "@/src/components/Skeleton";
import { useLanguage } from "../../contexts/LanguageContext";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Post as PostType, FeedSort } from "../../types";

type FeedItem =
  | { type: "post"; post: PostType; key: string }
  | { type: "welcome-group"; posts: PostType[]; key: string };

const prepareFeedItems = (posts: PostType[]): FeedItem[] => {
  const items: FeedItem[] = [];
  let welcomeGroup: PostType[] = [];

  for (const post of posts) {
    if (post.is_welcome) {
      welcomeGroup.push(post);
      continue;
    }

    if (welcomeGroup.length > 0) {
      items.push({
        type: "welcome-group",
        posts: welcomeGroup,
        key: `welcome-${items.length}`,
      });
      welcomeGroup = [];
    }

    items.push({ type: "post", post, key: `post-${post.id}` });
  }

  if (welcomeGroup.length > 0) {
    items.push({
      type: "welcome-group",
      posts: welcomeGroup,
      key: `welcome-${items.length}`,
    });
  }

  return items;
};

const Home = () => {
  const { t } = useLanguage();
  const router = useRouter();
  const queryClient = useQueryClient();
  const { firstTime } = useLocalSearchParams<{ firstTime?: string }>();
  const defaultSort: FeedSort = firstTime === "true" ? "popular" : "recent";
  const [, setPostCounts] = useState<Record<number, { likes: number; comments: number }>>({});
  const [refreshing, setRefreshing] = useState(false);
  const [sort, setSort] = useState<FeedSort>(defaultSort);
  const [promptRefreshKey, setPromptRefreshKey] = useState(0);
  const [expandedWelcomeGroups, setExpandedWelcomeGroups] = useState<Set<string>>(new Set());
  const hasConsumedFirstTime = useRef(false);

  const { posts, userMap, loading, error, loadMore, isFetchingNextPage, refetchPosts } = useFetchHomeData(sort);

  useEffect(() => {
    if (hasConsumedFirstTime.current) return;
    if (firstTime !== "true") return;

    hasConsumedFirstTime.current = true;
    setSort("popular");
    router.setParams({ firstTime: undefined });
  }, [firstTime, router]);

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

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refetchPosts();
      setPromptRefreshKey((prev) => prev + 1);
    } finally {
      setRefreshing(false);
    }
  }, [refetchPosts]);

  const handlePostDeleted = useCallback((postId: number) => {
    type HomePostsPage = { posts: PostType[]; hasMore: boolean };
    type HomePostsData = { pages: HomePostsPage[]; pageParams: number[] };

    queryClient.setQueriesData<HomePostsData>({ queryKey: ["home-posts"] }, (oldData) => {
      if (!oldData) return oldData;
      return {
        ...oldData,
        pages: oldData.pages.map((page) => ({
          ...page,
          posts: page.posts.filter((post) => post.id !== postId),
        })),
      };
    });

    queryClient.invalidateQueries({ queryKey: ["challenge-completion"] });
  }, [queryClient]);

  const handlePostCreated = useCallback(() => {
    refetchPosts();
    setPromptRefreshKey((prev) => prev + 1);
  }, [refetchPosts]);

  const feedItems = useMemo(() => prepareFeedItems(posts), [posts]);

  const toggleWelcomeGroup = useCallback((key: string) => {
    setExpandedWelcomeGroups((prev) => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => {
      if (item.type === "welcome-group") {
        return (
          <WelcomePostGroup
            posts={item.posts}
            userMap={userMap as Record<string, User>}
            isExpanded={expandedWelcomeGroups.has(item.key)}
            onToggle={() => toggleWelcomeGroup(item.key)}
          />
        );
      }

      const postUser = userMap[item.post.user_id] as User;
      if (!postUser) return null;

      return (
        <Post
          post={item.post}
          postUser={postUser}
          setPostCounts={setPostCounts}
          onPostDeleted={handlePostDeleted}
        />
      );
    },
    [expandedWelcomeGroups, handlePostDeleted, toggleWelcomeGroup, userMap]
  );

  const renderEmpty = useCallback(() => {
    if (loading) return <PostsListSkeleton count={3} />;
    return null;
  }, [loading]);

  const renderFooter = () => (
    <View style={styles.loaderContainer}>
      <Loader />
    </View>
  );

  const renderHeader = useCallback(() => {
    return (
      <View>
        <HomeChallengeBanner />
        <InlineCreatePost onPostCreated={handlePostCreated} refreshKey={promptRefreshKey} />
        <FeedSortToggle
          value={sort}
          onChange={setSort}
          recentLabel={t("Most recent")}
          popularLabel={t("Popular")}
        />
      </View>
    );
  }, [handlePostCreated, promptRefreshKey, sort, t]);

  const renderError = useCallback(() => {
    if (!error || loading) return null;
    return (
      <TouchableOpacity style={styles.errorContainer} onPress={onRefresh}>
        <Text style={styles.errorText}>{t("Something went wrong. Tap to retry.")}</Text>
      </TouchableOpacity>
    );
  }, [error, loading, onRefresh, t]);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
    >
      <FlatList
        data={feedItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={isFetchingNextPage ? renderFooter : null}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="on-drag"
        automaticallyAdjustKeyboardInsets
      />
      {renderError()}
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
  },
  listContent: {
    flexGrow: 1,
    padding: 16,
  },
  loaderContainer: {
    alignItems: "center",
    padding: 20,
  },
  errorContainer: {
    alignItems: "center",
    padding: 20,
  },
  errorText: {
    color: colors.light.lightText,
    textAlign: "center",
  },
});

export default Home;
