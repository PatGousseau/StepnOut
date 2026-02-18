import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Animated,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { Image } from 'expo-image';
import { LinearGradient } from 'expo-linear-gradient';
import { Text } from './StyledText';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../constants/Colors';
import { router } from 'expo-router';
import { useRecentlyActiveUsers, RecentlyActiveUser } from '../hooks/useRecentlyActiveUsers';
import { useLanguage } from '../contexts/LanguageContext';

const AVATAR_SIZE = 40;
const GREEN_DOT_SIZE = 12;
const COLLAPSED_HEIGHT = 44;
const EXPANDED_HEIGHT = 110;

interface UserAvatarProps {
  user: RecentlyActiveUser;
  onPress: () => void;
  variant: 'SMALL' | 'LARGE';
  zIndex?: number;
}

const UserAvatar = ({ user, onPress, variant, zIndex }: UserAvatarProps) => {
  if (variant === 'SMALL') {
    return (
      <TouchableOpacity 
        onPress={onPress} 
        style={[
          styles.smallAvatarContainer,
          zIndex !== undefined && { zIndex }
        ]}
      >
        <View style={styles.avatarWrapper}>
          {user.profileImageUrl ? (
            <Image
              source={{ uri: user.profileImageUrl }}
              style={styles.smallAvatar}
              contentFit="cover"
              transition={200}
            />
          ) : (
            <View style={[styles.smallAvatar, styles.placeholderAvatar]}>
              <Ionicons 
                name="person" 
                size={12} 
                color={colors.neutral.grey1} 
              />
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity onPress={onPress} style={styles.avatarContainer}>
      <View style={styles.avatarWrapper}>
        {user.profileImageUrl ? (
          <Image
            source={{ uri: user.profileImageUrl }}
            style={styles.avatar}
            contentFit="cover"
            transition={200}
          />
        ) : (
          <View style={[styles.avatar, styles.placeholderAvatar]}>
            <Ionicons 
              name="person" 
              size={20} 
              color={colors.neutral.grey1} 
            />
          </View>
        )}
        {user.isActiveToday && (
          <View style={styles.greenDot} />
        )}
      </View>
      <Text style={styles.username} numberOfLines={1}>
        @{user.username}
      </Text>
    </TouchableOpacity>
  );
};

export const RecentlyActiveBanner = () => {
  const { t } = useLanguage();
  const { activeUsers, activeTodayCount, loading, loadingMore, hasMore, fetchUsers, loadMore } = useRecentlyActiveUsers();
  const [isExpanded, setIsExpanded] = useState(false);
  const heightAnimation = useRef(new Animated.Value(COLLAPSED_HEIGHT)).current;
  const rotateAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const toggleExpanded = useCallback(() => {
    const toExpanded = !isExpanded;
    setIsExpanded(toExpanded);

    Animated.parallel([
      Animated.spring(heightAnimation, {
        toValue: toExpanded ? EXPANDED_HEIGHT : COLLAPSED_HEIGHT,
        useNativeDriver: false,
        tension: 100,
        friction: 12,
      }),
      Animated.spring(rotateAnimation, {
        toValue: toExpanded ? 1 : 0,
        useNativeDriver: true,
        tension: 100,
        friction: 12,
      }),
    ]).start();
  }, [isExpanded, heightAnimation, rotateAnimation]);

  const spin = rotateAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '180deg'],
  });

  const handleUserPress = useCallback((userId: string) => {
    router.push(`/profile/${userId}`);
  }, []);

  const handleScrollEnd = useCallback(({ nativeEvent: e }: any) => {
    const nearEnd = e.layoutMeasurement.width + e.contentOffset.x >= e.contentSize.width - 100;
    if (nearEnd && hasMore && !loadingMore) loadMore();
  }, [hasMore, loadingMore, loadMore]);

  if (loading || activeUsers.length === 0) {
    return null;
  }

  return (
    <Animated.View style={[styles.container, { height: heightAnimation }]}>
      <TouchableOpacity
        style={styles.header}
        onPress={toggleExpanded}
        activeOpacity={0.7}
      >
        <View style={styles.headerLeft}>
          <View style={styles.activeDotIndicator} />
          <Text style={styles.headerText}>
            {activeTodayCount > 0
              ? `${activeTodayCount} ${t('recently active')}`
              : t('recently active')}
          </Text>
          {!isExpanded && (
            <View style={styles.smallAvatarsOuterWrapper}>
              <View style={styles.smallAvatarsWrapper}>
                {activeUsers
                  .filter((user) => user.isActiveToday)
                  .map((user, index) => (
                    <UserAvatar
                      key={user.id}
                      user={user}
                      onPress={() => handleUserPress(user.id)}
                      variant="SMALL"
                      zIndex={activeTodayCount - index}
                    />
                  ))}
              </View>
              <LinearGradient
                colors={[`${colors.light.background}00`, colors.light.background]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.avatarFadeGradient}
                pointerEvents="none"
              />
            </View>
          )}
        </View>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons
            name="chevron-down"
            size={18}
            color={colors.light.lightText}
          />
        </Animated.View>
      </TouchableOpacity>

      <Animated.View
        style={[
          styles.content,
          {
            opacity: heightAnimation.interpolate({
              inputRange: [COLLAPSED_HEIGHT, EXPANDED_HEIGHT],
              outputRange: [0, 1],
            }),
          },
        ]}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.avatarList}
          onScroll={handleScrollEnd}
          scrollEventThrottle={200}
        >
          {activeUsers.map((user) => (
            <UserAvatar
              key={user.id}
              user={user}
              onPress={() => handleUserPress(user.id)}
              variant="LARGE"
            />
          ))}
          {loadingMore && (
            <View style={styles.loadingMore}>
              <ActivityIndicator size="small" color={colors.light.lightText} />
            </View>
          )}
        </ScrollView>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.light.background,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.grey2,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    height: COLLAPSED_HEIGHT,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  activeDotIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.light.success,
    marginRight: 8,
  },
  headerText: {
    fontSize: 13,
    color: colors.light.lightText,
    fontWeight: '500',
  },
  smallAvatarsOuterWrapper: {
    flex: 1,
    marginLeft: 8,
    position: 'relative',
  },
  smallAvatarsWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 4,
    overflow: 'hidden',
  },
  avatarFadeGradient: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: 32,
  },
  content: {
    paddingHorizontal: 8,
    paddingBottom: 8,
  },
  avatarList: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 8,
    gap: 8,
  },
  avatarContainer: {
    alignItems: 'center',
    width: AVATAR_SIZE + 10,
  },
  smallAvatarContainer: {
    alignItems: 'center',
    width: 24,
    marginLeft: -4,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatar: {
    width: AVATAR_SIZE,
    height: AVATAR_SIZE,
    borderRadius: AVATAR_SIZE / 2,
  },
  smallAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  placeholderAvatar: {
    backgroundColor: colors.neutral.grey2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  greenDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: GREEN_DOT_SIZE,
    height: GREEN_DOT_SIZE,
    borderRadius: GREEN_DOT_SIZE / 2,
    backgroundColor: colors.light.success,
    borderWidth: 2,
    borderColor: colors.light.background,
  },
  username: {
    fontSize: 10,
    color: colors.light.text,
    marginTop: 4,
    textAlign: 'center',
    width: '100%',
  },
  loadingMore: {
    width: AVATAR_SIZE + 10,
    height: AVATAR_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default RecentlyActiveBanner;

