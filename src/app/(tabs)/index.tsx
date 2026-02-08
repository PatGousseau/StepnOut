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
import FeedSortToggle from "../../components/FeedSortToggle";
import { useFetchHomeData } from "../../hooks/useFetchHomeData";
import { colors } from "../../constants/Colors";
import InlineCreatePost from "../../components/InlineCreatePost";
import { User } from "../../models/User";
import { Loader } from "@/src/components/Loader";
import { PostsListSkeleton } from "@/src/components/Skeleton";
import { useLanguage } from "../../contexts/LanguageContext";
import { Post as PostType, FeedSort } from "../../types";

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
  const [postCounts, setPostCounts] = useState<Record<number, { likes: number; comments: number }>>(
    {}
  );
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState(0); // 0 = submissions, 1 = discussion
  const [submissionSort, setSubmissionSort] = useState<FeedSort>("recent");
  const [discussionSort, setDiscussionSort] = useState<FeedSort>("recent");
  const {
    challengePosts: submissionPosts,
    discussionPosts,
    userMap,
    loading,
    error,
    loadMoreChallenges,
    loadMoreDiscussions,
    isFetchingNextChallengePage,
    isFetchingNextDiscussionPage,
    refetchPosts,
  } = useFetchHomeData(submissionSort, discussionSort);
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
    const allPosts = [...submissionPosts, ...discussionPosts];
    const counts = allPosts.reduce(
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
  }, [submissionPosts, discussionPosts]);

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

  const renderEmpty = useCallback(() => {
    if (loading) return <PostsListSkeleton count={3} />;
    return null;
  }, [loading]);

  const renderFooter = () => (
    <View style={styles.loaderContainer}>
      <Loader />
    </View>
  );

  const renderSubmissionsHeader = useCallback(() => {
    return (
      <FeedSortToggle
        value={submissionSort}
        onChange={setSubmissionSort}
        recentLabel={t("Most recent")}
        popularLabel={t("Popular")}
      />
    );
  }, [submissionSort, t]);

  // Discussion list header (sort toggle + InlineCreatePost)
  const renderDiscussionHeader = useCallback(() => {
    return (
      <View>
        <FeedSortToggle
          value={discussionSort}
          onChange={setDiscussionSort}
          recentLabel={t("Most recent")}
          popularLabel={t("Popular")}
        />
        <InlineCreatePost onPostCreated={handlePostCreated} refreshKey={promptRefreshKey} />
      </View>
    );
  }, [discussionSort, handlePostCreated, promptRefreshKey, t]);

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
      behavior={"padding"}
      style={styles.container}
      keyboardVerticalOffset={120}
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
            onEndReached={loadMoreChallenges}
            onEndReachedThreshold={0.5}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListHeaderComponent={renderSubmissionsHeader}
            ListFooterComponent={isFetchingNextChallengePage ? renderFooter : null}
            ListEmptyComponent={renderEmpty}
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
            onEndReached={loadMoreDiscussions}
            onEndReachedThreshold={0.5}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            ListHeaderComponent={renderDiscussionHeader}
            ListFooterComponent={isFetchingNextDiscussionPage ? renderFooter : null}
            ListEmptyComponent={renderEmpty}
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
