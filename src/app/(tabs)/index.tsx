import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  FlatList,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  Animated,
  LayoutChangeEvent,
  StyleSheet,
} from "react-native";
import { useQueryClient } from "@tanstack/react-query";
import PagerView from "react-native-pager-view";
import Post from "../../components/Post";
import WelcomePostGroup from "../../components/WelcomePostGroup";
import { useFetchHomeData } from "../../hooks/useFetchHomeData";
import { colors } from "../../constants/Colors";
import InlineCreatePost from "../../components/InlineCreatePost";
import { User } from "../../models/User";
import { Loader } from "@/src/components/Loader";
import { PostsListSkeleton } from "@/src/components/Skeleton";
import { useLanguage } from "../../contexts/LanguageContext";
import { Post as PostType } from "../../types";

// Discriminated union for FlatList items
type FeedItem =
  | { type: "post"; post: PostType; key: string }
  | { type: "welcome-group"; posts: PostType[]; key: string };

// Prepare posts into FeedItem array, grouping consecutive welcome posts
const prepareFeedItems = (posts: PostType[], keyPrefix: string): FeedItem[] => {
  const items: FeedItem[] = [];
  let welcomeGroup: PostType[] = [];

  for (const post of posts) {
    if (post.is_welcome) {
      welcomeGroup.push(post);
    } else {
      if (welcomeGroup.length > 0) {
        items.push({
          type: "welcome-group",
          posts: welcomeGroup,
          key: `${keyPrefix}-welcome-${items.length}`,
        });
        welcomeGroup = [];
      }
      items.push({ type: "post", post, key: `${keyPrefix}-${post.id}` });
    }
  }
  // Flush remaining welcome posts
  if (welcomeGroup.length > 0) {
    items.push({
      type: "welcome-group",
      posts: welcomeGroup,
      key: `${keyPrefix}-welcome-${items.length}`,
    });
  }
  return items;
};

const Home = () => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  const { posts, userMap, loading, error, loadMorePosts, hasMore, refetchPosts, isFetchingNextPage } = useFetchHomeData();
  const [postCounts, setPostCounts] = useState<Record<number, { likes: number; comments: number }>>(
    {}
  );
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 = submissions, 1 = discussion
  const [promptRefreshKey, setPromptRefreshKey] = useState(0);
  const [tabContainerWidth, setTabContainerWidth] = useState(0);
  const [expandedWelcomeGroups, setExpandedWelcomeGroups] = useState<Set<string>>(new Set());

  const pagerRef = useRef<PagerView>(null);
  const tabIndicatorPosition = useRef(new Animated.Value(0)).current;

  // Animate tab indicator when activeTab changes
  useEffect(() => {
    Animated.spring(tabIndicatorPosition, {
      toValue: activeTab,
      useNativeDriver: true,
      tension: 100,
      friction: 12,
    }).start();
  }, [activeTab, tabIndicatorPosition]);

  // Handle tab button press
  const handleTabPress = useCallback((index: number) => {
    pagerRef.current?.setPage(index);
  }, []);

  // Handle swipe between pages
  const handlePageSelected = useCallback((e: { nativeEvent: { position: number } }) => {
    setActiveTab(e.nativeEvent.position);
  }, []);

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
    // Optimistically remove the deleted post from the cache
    type HomePostsPage = { posts: PostType[]; hasMore: boolean };
    type HomePostsData = { pages: HomePostsPage[]; pageParams: number[] };

    queryClient.setQueriesData<HomePostsData>(
      { queryKey: ["home-posts"] },
      (oldData) => {
        if (!oldData) return oldData;
        return {
          ...oldData,
          pages: oldData.pages.map((page) => ({
            ...page,
            posts: page.posts.filter((post) => post.id !== postId),
          })),
        };
      }
    );

    // Invalidate challenge completion queries so the challenge page reflects the deletion
    queryClient.invalidateQueries({ queryKey: ["challenge-completion"] });
  }, [queryClient]);

  const handlePostCreated = useCallback(() => {
    refetchPosts();
    setPromptRefreshKey((prev) => prev + 1);
  }, [refetchPosts]);

  // Memoize filtered posts for each tab
  const submissionPosts = useMemo(() => {
    return posts.filter((post) => post.challenge_id != null);
  }, [posts]);

  const discussionPosts = useMemo(() => {
    return posts.filter((post) => post.challenge_id == null);
  }, [posts]);

  // Prepare feed items for FlatList
  const submissionFeedItems = useMemo(
    () => prepareFeedItems(submissionPosts, "sub"),
    [submissionPosts]
  );
  const discussionFeedItems = useMemo(
    () => prepareFeedItems(discussionPosts, "disc"),
    [discussionPosts]
  );

  // Toggle welcome group expansion
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

  // Render item for FlatList
  const renderItem = useCallback(
    ({ item }: { item: FeedItem }) => {
      if (item.type === "welcome-group") {
        return (
          <WelcomePostGroup
            posts={item.posts}
            userMap={userMap}
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
    [userMap, expandedWelcomeGroups, toggleWelcomeGroup, setPostCounts, handlePostDeleted]
  );

  const keyExtractor = useCallback((item: FeedItem) => item.key, []);

  // Container width for tab indicator positioning
  const onTabContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTabContainerWidth(width);
  };

  // Load more posts when reaching end of list
  const handleEndReached = useCallback(() => {
    if (!loading && hasMore) {
      loadMorePosts();
    }
  }, [loading, hasMore, loadMorePosts]);

  // Render loading footer
  const renderFooter = useCallback(() => {
    if (!isFetchingNextPage) return null;
    return (
      <View style={styles.loaderContainer}>
        <Loader />
      </View>
    );
  }, [isFetchingNextPage]);

  // Render empty state (skeleton or empty)
  const renderEmptySubmissions = useCallback(() => {
    if (loading) {
      return <PostsListSkeleton count={3} />;
    }
    return null;
  }, [loading]);

  const renderEmptyDiscussion = useCallback(() => {
    if (loading) {
      return <PostsListSkeleton count={3} />;
    }
    return null;
  }, [loading]);

  // Discussion list header (InlineCreatePost)
  const renderDiscussionHeader = useCallback(() => {
    return <InlineCreatePost onPostCreated={handlePostCreated} refreshKey={promptRefreshKey} />;
  }, [handlePostCreated, promptRefreshKey]);

  // Error component
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
      {/* Tab buttons */}
      <View style={styles.tabContainer} onLayout={onTabContainerLayout}>
        <TouchableOpacity style={styles.tabButton} onPress={() => handleTabPress(0)}>
          <Text style={[styles.tabText, activeTab === 0 && styles.activeTabText]}>
            {t("Submissions")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => handleTabPress(1)}>
          <Text style={[styles.tabText, activeTab === 1 && styles.activeTabText]}>
            {t("Discussion")}
          </Text>
        </TouchableOpacity>
        <Animated.View
          style={[
            styles.tabIndicator,
            {
              transform: [
                {
                  translateX: tabIndicatorPosition.interpolate({
                    inputRange: [0, 1],
                    outputRange: [16, tabContainerWidth / 2],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      {/* PagerView for horizontal tab swiping */}
      <PagerView
        ref={pagerRef}
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageSelected}
      >
        {/* Page 0: Submissions */}
        <View key="submissions" style={styles.page}>
          <FlatList
            data={submissionFeedItems}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptySubmissions}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets={true}
          />
          {renderError()}
        </View>

        {/* Page 1: Discussion */}
        <View key="discussion" style={styles.page}>
          <FlatList
            data={discussionFeedItems}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            onEndReached={handleEndReached}
            onEndReachedThreshold={0.5}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListHeaderComponent={renderDiscussionHeader}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderEmptyDiscussion}
            contentContainerStyle={styles.listContent}
            keyboardShouldPersistTaps="handled"
            keyboardDismissMode="on-drag"
            automaticallyAdjustKeyboardInsets={true}
          />
          {renderError()}
        </View>
      </PagerView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: colors.light.background,
    paddingHorizontal: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.grey1 + "90",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  tabText: {
    fontSize: 16,
    color: colors.light.lightText,
  },
  activeTabText: {
    color: colors.light.primary,
    fontWeight: "bold",
  },
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "12.5%",
    width: "25%",
    borderRadius: 10,
    height: 3,
    backgroundColor: colors.light.primary,
  },
  pagerView: {
    flex: 1,
  },
  page: {
    flex: 1,
    backgroundColor: colors.light.background,
  },
  listContent: {
    padding: 16,
    flexGrow: 1,
  },
  loaderContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorContainer: {
    padding: 20,
    alignItems: "center",
  },
  errorText: {
    color: colors.light.lightText,
    textAlign: "center",
  },
});

export default Home;
