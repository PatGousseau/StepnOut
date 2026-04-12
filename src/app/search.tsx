import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { Stack, router } from 'expo-router';
import { colors } from '../constants/Colors';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { postService, PostSearchResult } from '../services/postService';
import { profileService, UserSearchResult } from '../services/profileService';

type TabKey = 'posts' | 'people';

const SearchScreen: React.FC = () => {
  const { t } = useLanguage();
  const { isAdmin } = useAuth();

  const [tab, setTab] = useState<TabKey>('posts');
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const [postResults, setPostResults] = useState<PostSearchResult[]>([]);
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);

  const normalizedQuery = useMemo(() => query.trim(), [query]);
  const latestRequestRef = useRef(0);

  useEffect(() => {
    if (!isAdmin && tab === 'people') {
      setTab('posts');
    }
  }, [isAdmin, tab]);

  useEffect(() => {
    if (!normalizedQuery) {
      setPostResults([]);
      setUserResults([]);
      setLoading(false);
      return;
    }

    const requestId = ++latestRequestRef.current;

    const timeoutId = setTimeout(async () => {
      try {
        setLoading(true);

        if (tab === 'people') {
          if (!isAdmin) {
            setUserResults([]);
            return;
          }
          const users = await profileService.searchUsers(normalizedQuery);
          if (latestRequestRef.current !== requestId) return;
          setUserResults(users);
          return;
        }

        const posts = await postService.searchPosts(normalizedQuery);
        if (latestRequestRef.current !== requestId) return;
        setPostResults(posts);
      } catch (error) {
        console.error('Error searching:', error);
      } finally {
        if (latestRequestRef.current === requestId) {
          setLoading(false);
        }
      }
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [isAdmin, normalizedQuery, tab]);

  const placeholder = tab === 'people'
    ? t('Search by name or username')
    : t('Search posts');

  const renderPost = ({ item }: { item: PostSearchResult }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/post/${item.id}`)}
    >
      <Image
        source={
          item.mediaUrl
            ? { uri: item.mediaUrl }
            : require('../assets/images/default-pfp.png')
        }
        style={styles.thumb}
      />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.username ? `@${item.username}` : t('Unknown')}
        </Text>
        <Text style={styles.rowSubtitle} numberOfLines={2}>
          {(item.body || '').trim().length > 0 ? item.body : t('No text')}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const renderUser = ({ item }: { item: UserSearchResult }) => (
    <TouchableOpacity
      style={styles.row}
      onPress={() => router.push(`/profile/${item.id}`)}
    >
      <Image
        source={
          item.profileImageUrl
            ? { uri: item.profileImageUrl }
            : require('../assets/images/default-pfp.png')
        }
        style={styles.thumb}
      />
      <View style={styles.rowText}>
        <Text style={styles.rowTitle} numberOfLines={1}>
          {item.name}
        </Text>
        <Text style={styles.rowSubtitle} numberOfLines={1}>
          @{item.username}
        </Text>
      </View>
    </TouchableOpacity>
  );

  const showTabs = isAdmin;
  const emptyText = normalizedQuery.length === 0
    ? t('Start typing to search')
    : t('No results found');

  const resultsCount = tab === 'people' ? userResults.length : postResults.length;

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />

      <Text style={styles.title}>{t('Search')}</Text>

      {showTabs && (
        <View style={styles.tabs}>
          <TouchableOpacity
            style={[styles.tab, tab === 'posts' ? styles.tabActive : null]}
            onPress={() => setTab('posts')}
          >
            <Text style={[styles.tabText, tab === 'posts' ? styles.tabTextActive : null]}>
              {t('Posts')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, tab === 'people' ? styles.tabActive : null]}
            onPress={() => setTab('people')}
          >
            <Text style={[styles.tabText, tab === 'people' ? styles.tabTextActive : null]}>
              {t('People')}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <TextInput
        value={query}
        onChangeText={setQuery}
        placeholder={placeholder}
        placeholderTextColor={colors.light.lightText}
        style={styles.input}
        autoCapitalize="none"
      />

      {loading && (
        <View style={styles.loadingRow}>
          <ActivityIndicator color={colors.light.primary} />
        </View>
      )}

      {!loading && resultsCount === 0 && (
        <Text style={styles.helperText}>{emptyText}</Text>
      )}

      <FlatList
        data={tab === 'people' ? userResults : postResults}
        keyExtractor={(item) => String((item as any).id)}
        keyboardShouldPersistTaps="handled"
        renderItem={tab === 'people' ? (renderUser as any) : (renderPost as any)}
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
    fontWeight: '700',
    color: colors.light.primary,
    marginBottom: 12,
  },
  tabs: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.neutral.grey1,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: colors.light.background,
  },
  tabActive: {
    backgroundColor: colors.light.primary,
  },
  tabText: {
    fontWeight: '600',
    color: colors.light.primary,
  },
  tabTextActive: {
    color: '#fff',
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
    alignItems: 'center',
    paddingVertical: 12,
  },
  helperText: {
    color: colors.light.lightText,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: colors.neutral.grey1 + '66',
  },
  thumb: {
    width: 46,
    height: 46,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: colors.neutral.grey1,
  },
  rowText: {
    flex: 1,
  },
  rowTitle: {
    color: colors.light.primary,
    fontSize: 16,
    fontWeight: '600',
  },
  rowSubtitle: {
    color: colors.light.lightText,
    marginTop: 2,
  },
});

export default SearchScreen;
