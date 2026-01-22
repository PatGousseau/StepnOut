import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import {
  View,
  ScrollView,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  Animated,
  LayoutChangeEvent,
  PanResponder,
  StyleSheet,
} from "react-native";
import Post from "../../components/Post";
import WelcomePostGroup from "../../components/WelcomePostGroup";
import { useFetchHomeData } from "../../hooks/useFetchHomeData";
import { colors } from "../../constants/Colors";
import InlineCreatePost from "../../components/InlineCreatePost";
import { User } from "../../models/User";
import { Loader } from "@/src/components/Loader";
import { useLanguage } from "../../contexts/LanguageContext";
import { Post as PostType } from "../../types";

const groupWelcomePosts = (posts: PostType[]): (PostType | PostType[])[] =>
  posts.reduce<(PostType | PostType[])[]>((acc, post) => {
    if (!post.is_welcome) {
      acc.push(post);
    } else {
      const last = acc[acc.length - 1];
      if (Array.isArray(last)) {
        last.push(post);
      } else {
        acc.push([post]);
      }
    }
    return acc;
  }, []);

const Home = () => {
  const { t } = useLanguage();
  const { posts, userMap, loading, error, loadMorePosts, hasMore, refetchPosts, isFetchingNextPage } = useFetchHomeData();
  const [postCounts, setPostCounts] = useState<Record<number, { likes: number; comments: number }>>(
    {}
  );
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<"discussion" | "submissions">("submissions");
  const [promptRefreshKey, setPromptRefreshKey] = useState(0);
  const [tabContainerWidth, setTabContainerWidth] = useState(0);
  const [expandedWelcomeGroups, setExpandedWelcomeGroups] = useState<Set<string>>(new Set());

  // tab indicator and content positions
  const tabIndicatorPosition = useMemo(() => new Animated.Value(0), []);
  const slideAnimation = useMemo(() => new Animated.Value(0), []);

  // states for locking vertical/horizontal scrolling
  const [scrollEnabled, setScrollEnabled] = useState(true);
  const [isScrolling, setIsScrolling] = useState(false);
  const scrollTimer = useRef<NodeJS.Timeout | null>(null);

  const handleScroll = () => {
    setIsScrolling(true);

    if (scrollTimer.current) {
      clearTimeout(scrollTimer.current);
    }

    scrollTimer.current = setTimeout(() => {
      setIsScrolling(false);
    }, 150);
  };

  const handleTabChange = (tab: "discussion" | "submissions") => {
    // animations for tab indicator and content sliding
    Animated.parallel([
      Animated.spring(tabIndicatorPosition, {
        toValue: tab === "submissions" ? 0 : 1,
        useNativeDriver: true,
        tension: 100,
        friction: 12,
      }),
      Animated.spring(slideAnimation, {
        toValue: tab === "submissions" ? 0 : -tabContainerWidth,
        useNativeDriver: true,
        tension: 120,
        friction: 20,
      }),
    ]).start();
    setActiveTab(tab);
  };

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

  // Note: React Query handles initial fetch automatically, no need for useEffect
  // The useInfiniteQuery in useFetchHomeData will fetch on mount

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      // Refetch posts using React Query
      await refetchPosts();
      setPromptRefreshKey((prev) => prev + 1);
    } finally {
      setRefreshing(false);
    }
  }, [refetchPosts, activeTab]);

  const handlePostDeleted = useCallback(() => {
    // Refresh the posts list using React Query
    refetchPosts();
  }, [refetchPosts]);

  const handlePostCreated = useCallback(() => {
    // Refresh the posts list when a new post is created
    refetchPosts();
    setPromptRefreshKey((prev) => prev + 1);
  }, [refetchPosts]);

  // Memoize filtered posts for each tab independently (not dependent on activeTab)
  const submissionPosts = useMemo(() => {
    return posts.filter((post) => post.challenge_id != null);
  }, [posts]);

  const discussionPosts = useMemo(() => {
    return posts.filter((post) => post.challenge_id == null);
  }, [posts]);

  // Shared scroll handler for infinite loading
  const handleScrollEvent = useCallback(
    ({ nativeEvent }: { nativeEvent: { layoutMeasurement: { height: number }; contentOffset: { y: number }; contentSize: { height: number } } }) => {
      handleScroll();
      const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
      const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;
      if (isCloseToBottom && !loading && hasMore) {
        loadMorePosts();
      }
    },
    [loading, hasMore, loadMorePosts]
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

  // Render posts list for a tab
  const renderPostsList = useCallback(
    (tabPosts: typeof posts, keyPrefix: string) => {
      return groupWelcomePosts(tabPosts).map((item, index) => {
        // Welcome post group
        if (Array.isArray(item)) {
          const groupKey = `${keyPrefix}-welcome-${index}`;
          return (
            <WelcomePostGroup
              key={groupKey}
              posts={item}
              userMap={userMap}
              isExpanded={expandedWelcomeGroups.has(groupKey)}
              onToggle={() => toggleWelcomeGroup(groupKey)}
            />
          );
        }

        // Regular post
        const postUser = userMap[item.user_id] as User;
        if (!postUser) return null;
        return (
          <Post
            key={`${keyPrefix}-${item.id}-${index}`}
            post={item}
            postUser={postUser}
            setPostCounts={setPostCounts}
            onPostDeleted={handlePostDeleted}
          />
        );
      });
    },
    [userMap, setPostCounts, handlePostDeleted, expandedWelcomeGroups, toggleWelcomeGroup]
  );

  // container width for tab indicator
  const onTabContainerLayout = (event: LayoutChangeEvent) => {
    const { width } = event.nativeEvent.layout;
    setTabContainerWidth(width);
  };

  // pan responder for horizontal swipe
  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onMoveShouldSetPanResponder: (_, gestureState) => {
          const isHorizontalSwipe = Math.abs(gestureState.dx) > Math.abs(gestureState.dy);
          // lock scrolling if we're swiping horizontally
          if (isHorizontalSwipe && !isScrolling) {
            setScrollEnabled(false);
            return true;
          }
          return false;
        },
        onPanResponderMove: (_, gestureState) => {
          if (!isScrolling) {
            const basePosition = activeTab === "submissions" ? 0 : -tabContainerWidth;
            const newPosition = basePosition + gestureState.dx;
            const constrainedPosition = Math.max(-tabContainerWidth, Math.min(0, newPosition));
            slideAnimation.setValue(constrainedPosition);
          }
        },
        onPanResponderRelease: (_, gestureState) => {
          setScrollEnabled(true);

          const SWIPE_THRESHOLD = 10;
          if (gestureState.dx > SWIPE_THRESHOLD && activeTab === "discussion" && !isScrolling) {
            handleTabChange("submissions");
          } else if (
            gestureState.dx < -SWIPE_THRESHOLD &&
            activeTab === "submissions" &&
            !isScrolling
          ) {
            handleTabChange("discussion");
          } else {
            Animated.spring(slideAnimation, {
              toValue: activeTab === "submissions" ? 0 : -tabContainerWidth,
              useNativeDriver: true,
              tension: 120,
              friction: 20,
            }).start();
          }
        },
        onPanResponderTerminate: () => {
          setScrollEnabled(true);
        },
      }),
    [activeTab, tabContainerWidth, slideAnimation, isScrolling]
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={{ flex: 1 }}
      keyboardVerticalOffset={Platform.OS === "ios" ? 120 : 0}
    >
      {/* Add tab buttons */}
      <View style={styles.tabContainer} onLayout={onTabContainerLayout}>
        <TouchableOpacity style={styles.tabButton} onPress={() => handleTabChange("submissions")}>
          <Text style={[styles.tabText, activeTab === "submissions" && styles.activeTabText]}>
            {t("Submissions")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.tabButton} onPress={() => handleTabChange("discussion")}>
          <Text style={[styles.tabText, activeTab === "discussion" && styles.activeTabText]}>
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
                    outputRange: [styles.tabContainer.paddingHorizontal, tabContainerWidth / 2],
                  }),
                },
              ],
            },
          ]}
        />
      </View>

      <Animated.View
        {...panResponder.panHandlers}
        style={{
          flex: 1,
          flexDirection: "row",
          width: "200%",
          transform: [{ translateX: slideAnimation }],
        }}
      >
        {/* Submissions tab content */}
        <ScrollView
          scrollEnabled={scrollEnabled}
          onScroll={handleScrollEvent}
          scrollEventThrottle={16}
          style={styles.tabScrollView}
          contentContainerStyle={styles.tabContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          {renderPostsList(submissionPosts, "submission")}
          {error && !loading && (
            <TouchableOpacity style={styles.errorContainer} onPress={onRefresh}>
              <Text style={styles.errorText}>{t('Something went wrong. Tap to retry.')}</Text>
            </TouchableOpacity>
          )}
          {(loading || isFetchingNextPage) && (
            <View style={styles.loaderContainer}>
              <Loader />
            </View>
          )}
        </ScrollView>

        {/* Discussion tab content */}
        <ScrollView
          scrollEnabled={scrollEnabled}
          onScroll={handleScrollEvent}
          scrollEventThrottle={16}
          style={styles.tabScrollView}
          contentContainerStyle={styles.tabContent}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
          <InlineCreatePost onPostCreated={handlePostCreated} refreshKey={promptRefreshKey} />
          {renderPostsList(discussionPosts, "discussion")}
          {error && !loading && (
            <TouchableOpacity style={styles.errorContainer} onPress={onRefresh}>
              <Text style={styles.errorText}>{t('Something went wrong. Tap to retry.')}</Text>
            </TouchableOpacity>
          )}
          {(loading || isFetchingNextPage) && (
            <View style={styles.loaderContainer}>
              <Loader />
            </View>
          )}
        </ScrollView>
      </Animated.View>
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
  tabScrollView: {
    width: "50%",
    backgroundColor: colors.light.background,
  },
  tabContent: {
    padding: 16,
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
    color: colors.light.textSecondary,
    textAlign: "center",
  },
});

export default Home;
