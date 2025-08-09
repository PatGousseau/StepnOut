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
  const [activeTab, setActiveTab] = useState<"discussion" | "submissions">("submissions");
  const [tabContainerWidth, setTabContainerWidth] = useState(0);

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

  const handlePostCreated = useCallback(() => {
    // Refresh the posts list when a new post is created
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

      <ScrollView
        {...panResponder.panHandlers}
        scrollEnabled={scrollEnabled}
        onScroll={({ nativeEvent }) => {
          handleScroll();

          const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
          const isCloseToBottom =
            layoutMeasurement.height + contentOffset.y >= contentSize.height - 20;

          if (isCloseToBottom && !loading && hasMore) {
            loadMorePosts();
          }
        }}
        scrollEventThrottle={16}
        style={{ backgroundColor: colors.light.background }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        maintainVisibleContentPosition={{
          minIndexForVisible: 0,
        }}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View
          style={{
            flexDirection: "row",
            width: "200%",
            transform: [{ translateX: slideAnimation }],
          }}
        >
          <View style={{ width: "50%", padding: 16 }}>
            {filteredPosts.map((post, index) => {
              const postUser = userMap[post.user_id] as User;
              return (
                <Post
                  key={`${post.id}-${index}`}
                  post={post}
                  postUser={postUser}
                  setPostCounts={setPostCounts}
                  onPostDeleted={handlePostDeleted}
                />
              );
            })}
          </View>
          <View style={{ width: "50%", padding: 16 }}>
            {filteredPosts.map((post, index) => {
              const postUser = userMap[post.user_id] as User;
              return (
                <Post
                  key={`${post.id}-${index}`}
                  post={post}
                  postUser={postUser}
                  setPostCounts={setPostCounts}
                  onPostDeleted={handlePostDeleted}
                />
              );
            })}
          </View>
        </Animated.View>

        {loading && <Loader />}
      </ScrollView>

      {activeTab === "discussion" && (
        <View style={styles.createPostButton}>
          <CreatePost onPostCreated={handlePostCreated} />
        </View>
      )}
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
  tabIndicator: {
    position: "absolute",
    bottom: 0,
    left: "12.5%",
    width: "25%",
    borderRadius: 10,
    height: 3,
    backgroundColor: colors.light.primary,
  },
});

export default Home;
