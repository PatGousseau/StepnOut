import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  Alert,
  TouchableOpacity,
  Image,
  ScrollView,
  RefreshControl,
} from "react-native";
import DropDownPicker from "react-native-dropdown-picker";
import { supabase } from "../../lib/supabase";
import { colors } from "../../constants/Colors";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { useAuth } from "../../contexts/AuthContext";
import { sendNewChallengeNotificationToAll, sendCustomNotification, getAllUserIds } from "../../lib/notificationsService";
import { uploadMedia } from "../../utils/handleMediaUpload";

type Challenge = {
  id: number;
  title: string;
  title_it: string;
  description: string;
  description_it: string;
  difficulty: "easy" | "medium" | "hard";
  created_at: string;
  image_media_id: number | null;
  is_active: boolean | null;
};

type UserProfile = {
  id: string;
  username: string;
  name: string;
};

type AdminTimeseriesPoint = { date: string; count: number };
type ChallengeLeaderboardItem = {
  challengeId: number;
  challengeTitle: string;
  uniqueCompleters: number;
  totalCompletions: number;
  avgComfort: number | null;
};

type ActivationStep = {
  key: string;
  label: string;
  count: number;
  rateFromStart: number;
};

type AdminAnalytics = {
  userCount: number;
  newUsers7d: number;
  newUsersPrev7d: number;

  weeklyActiveUsers7d: number;
  weeklyActiveUsersPrev7d: number;
  dau1d: number;
  mau30d: number;
  dauMauRatio: number;
  newCompleters7d: number;
  returningCompleters7d: number;

  medianDaysToFirstCompletion30d: number | null;

  activeChallenge: { id: number; title: string } | null;
  activeChallengeUniqueCompletions: number;
  activeChallengeTotalCompletions: number;

  completions14d: AdminTimeseriesPoint[];
  newUsers14d: AdminTimeseriesPoint[];

  completionBuckets: { label: string; percent: number; count: number }[];

  posts7d: number;
  postsPrev7d: number;
  comments7d: number;
  commentsPrev7d: number;
  feedback7d: number;
  pendingReports: number;

  topChallenges30d: ChallengeLeaderboardItem[];
  activationFunnel7d: ActivationStep[];
};

const dayKeyUtc = (iso: string) => {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
};

const utcDaySeries = (days: number): AdminTimeseriesPoint[] => {
  const out: AdminTimeseriesPoint[] = [];
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);

  for (let i = days - 1; i >= 0; i -= 1) {
    const dd = new Date(d);
    dd.setUTCDate(dd.getUTCDate() - i);
    out.push({ date: dayKeyUtc(dd.toISOString()), count: 0 });
  }

  return out;
};

const fillSeries = (series: AdminTimeseriesPoint[], rows: { created_at: string }[]) => {
  const byDay = new Map<string, number>();
  rows.forEach((r) => {
    const k = dayKeyUtc(r.created_at);
    byDay.set(k, (byDay.get(k) || 0) + 1);
  });
  series.forEach((p) => {
    p.count = byDay.get(p.date) || 0;
  });
};

const median = (xs: number[]) => {
  if (xs.length === 0) return null;
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

const fetchAll = async <T,>(
  fetchPage: (from: number, to: number) => Promise<{ data: T[] | null; error: unknown }>,
  pageSize = 1000
) => {
  const out: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data, error } = await fetchPage(from, from + pageSize - 1);
    if (error) throw error;
    if (!data || data.length === 0) break;
    out.push(...data);
    if (data.length < pageSize) break;
  }
  return out;
};

const ChallengeCreation: React.FC = () => {
  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [openDifficulty, setOpenDifficulty] = useState<boolean>(false);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [imageMediaId, setImageMediaId] = useState<number | null>(null);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [titleIt, setTitleIt] = useState<string>("");
  const [descriptionIt, setDescriptionIt] = useState<string>("");

  const [notifTitle, setNotifTitle] = useState<string>("");
  const [notifBody, setNotifBody] = useState<string>("");
  const [sendToAll, setSendToAll] = useState<boolean>(true);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const [sendingNotification, setSendingNotification] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState<string>("");

  const [analytics, setAnalytics] = useState<AdminAnalytics | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState<boolean>(false);

  const { user } = useAuth();

  const fetchChallenges = async () => {
    try {
      const { data, error } = await supabase
        .from("challenges")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setChallenges(data || []);
    } catch (error) {
      console.error("Error fetching challenges:", error);
      Alert.alert("Error", "Failed to load challenges");
    }
  };

  const fetchUsers = async () => {
    try {
      const pageSize = 1000;
      const users: UserProfile[] = [];

      for (let from = 0; ; from += pageSize) {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, username, name")
          .order("username", { ascending: true })
          .range(from, from + pageSize - 1);

        if (error) throw error;

        const page = (data || []) as UserProfile[];
        users.push(...page);

        if (page.length < pageSize) break;
      }

      setAllUsers(users);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const isoDaysAgo = (days: number) => new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();
      const since1d = isoDaysAgo(1);
      const since7d = isoDaysAgo(7);
      const since14d = isoDaysAgo(14);
      const since30d = isoDaysAgo(30);
      const since14to7d = isoDaysAgo(14);

      const results = await Promise.all([
        supabase.from("profiles").select("id", { count: "exact", head: true }),
        supabase.from("profiles").select("id", { count: "exact", head: true }).gte("created_at", since7d),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since14to7d)
          .lt("created_at", since7d),
        supabase
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since7d)
          .not("username", "is", null)
          .neq("username", ""),

        supabase.from("post").select("user_id").not("challenge_id", "is", null).gte("created_at", since7d),
        supabase
          .from("post")
          .select("user_id")
          .not("challenge_id", "is", null)
          .gte("created_at", since14to7d)
          .lt("created_at", since7d),
        supabase.from("post").select("user_id").not("challenge_id", "is", null).lt("created_at", since14to7d),

        supabase.from("challenges").select("id, title").eq("is_active", true).limit(1).maybeSingle(),

        supabase.from("post").select("created_at").not("challenge_id", "is", null).gte("created_at", since14d),
        supabase.from("profiles").select("created_at").gte("created_at", since14d),

        supabase.from("profiles").select("id, created_at").gte("created_at", since30d),
        supabase.from("post").select("user_id, created_at").not("challenge_id", "is", null).gte("created_at", since30d),

        supabase
          .from("post")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since7d)
          .eq("is_welcome", false),
        supabase
          .from("post")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since14to7d)
          .lt("created_at", since7d)
          .eq("is_welcome", false),
        supabase.from("comments").select("id", { count: "exact", head: true }).gte("created_at", since7d),
        supabase
          .from("comments")
          .select("id", { count: "exact", head: true })
          .gte("created_at", since14to7d)
          .lt("created_at", since7d),
        supabase.from("feedback").select("id", { count: "exact", head: true }).gte("created_at", since7d),
        supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "pending"),

        supabase.from("post").select("user_id").gte("created_at", since1d).eq("is_welcome", false),
        supabase.from("comments").select("user_id").gte("created_at", since1d),
        supabase.from("likes").select("user_id").gte("created_at", since1d),

        supabase.from("post").select("user_id").gte("created_at", since30d).eq("is_welcome", false),
        supabase.from("comments").select("user_id").gte("created_at", since30d),
        supabase.from("likes").select("user_id").gte("created_at", since30d),

        supabase
          .from("post")
          .select("challenge_id, user_id, comfort_zone_rating, challenges:challenges(title, title_it)")
          .not("challenge_id", "is", null)
          .gte("created_at", since30d),
      ]);

      const err = results.map((r) => r.error).find(Boolean);
      if (err) throw err;

      const [
        usersRes,
        newUsersRes,
        newUsersPrev7dRes,
        createdProfile7dRes,
        completers7dRes,
        completersPrev7dRes,
        completersBeforePrev7dRes,
        activeChallengeRes,
        completions14dRes,
        newUsers14dRes,
        profiles30dRes,
        completions30dRes,
        posts7dRes,
        postsPrev7dRes,
        comments7dRes,
        commentsPrev7dRes,
        feedback7dRes,
        pendingReportsRes,
        postsUsers1dRes,
        commentsUsers1dRes,
        likesUsers1dRes,
        postsUsers30dRes,
        commentsUsers30dRes,
        likesUsers30dRes,
        challengePosts30dRes,
      ] = results;

      const completers7d = new Set((completers7dRes.data || []).map((r) => r.user_id));
      const completersPrev7d = new Set((completersPrev7dRes.data || []).map((r) => r.user_id));
      const completersBeforePrev7d = new Set((completersBeforePrev7dRes.data || []).map((r) => r.user_id));

      let returningCompleters7d = 0;
      completers7d.forEach((uid) => {
        if (completersPrev7d.has(uid) || completersBeforePrev7d.has(uid)) returningCompleters7d += 1;
      });

      const weeklyActiveUsers7d = completers7d.size;
      const weeklyActiveUsersPrev7d = completersPrev7d.size;
      const newCompleters7d = weeklyActiveUsers7d - returningCompleters7d;

      const dauSet = new Set<string>([
        ...((postsUsers1dRes.data || []).map((r) => r.user_id)),
        ...((commentsUsers1dRes.data || []).map((r) => r.user_id)),
        ...((likesUsers1dRes.data || []).map((r) => r.user_id)),
      ]);
      const mauSet = new Set<string>([
        ...((postsUsers30dRes.data || []).map((r) => r.user_id)),
        ...((commentsUsers30dRes.data || []).map((r) => r.user_id)),
        ...((likesUsers30dRes.data || []).map((r) => r.user_id)),
      ]);
      const dau1d = dauSet.size;
      const mau30d = mauSet.size;
      const dauMauRatio = mau30d ? Math.round((dau1d / mau30d) * 1000) / 10 : 0;

      const completions14d = utcDaySeries(14);
      const newUsers14d = utcDaySeries(14);
      fillSeries(completions14d, completions14dRes.data || []);
      fillSeries(newUsers14d, newUsers14dRes.data || []);

      const completionPosts = await fetchAll(
        (from, to) =>
          supabase
            .from("post")
            .select("user_id")
            .not("challenge_id", "is", null)
            .order("id", { ascending: true })
            .range(from, to),
        1000
      );

      const completionsPerUser = new Map<string, number>();
      (completionPosts as { user_id: string }[]).forEach((r) => {
        completionsPerUser.set(r.user_id, (completionsPerUser.get(r.user_id) || 0) + 1);
      });

      const totalUsers = usersRes.count || 0;
      const bucketCounts = new Map<string, number>([
        ["1", 0],
        ["2", 0],
        ["3", 0],
        ["4", 0],
        ["5+", 0],
      ]);

      completionsPerUser.forEach((n) => {
        const b = n >= 5 ? "5+" : String(n);
        if (bucketCounts.has(b)) bucketCounts.set(b, (bucketCounts.get(b) || 0) + 1);
      });

      const completionBuckets = (["1", "2", "3", "4", "5+"] as const).map((label) => {
        const count = bucketCounts.get(label) || 0;
        const percent = totalUsers ? Math.round((count / totalUsers) * 1000) / 10 : 0;
        return { label, count, percent };
      });

      const createdByUser = new Map<string, string>();
      (profiles30dRes.data || []).forEach((p) => createdByUser.set(p.id, p.created_at));

      const firstCompletionAt = new Map<string, string>();
      (completions30dRes.data || []).forEach((c) => {
        const prev = firstCompletionAt.get(c.user_id);
        if (!prev || new Date(c.created_at).getTime() < new Date(prev).getTime()) firstCompletionAt.set(c.user_id, c.created_at);
      });

      const deltas = Array.from(firstCompletionAt.entries())
        .map(([uid, completedAt]) => {
          const createdAt = createdByUser.get(uid);
          if (!createdAt) return null;
          const days = (new Date(completedAt).getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
          return Number.isFinite(days) && days >= 0 ? days : null;
        })
        .filter((x): x is number => x !== null);

      const m = median(deltas);
      const medianDaysToFirstCompletion30d = m === null ? null : Math.round(m * 10) / 10;

      const activeChallenge = activeChallengeRes.data ?? null;
      let activeChallengeUniqueCompletions = 0;
      let activeChallengeTotalCompletions = 0;

      const joined7d = newUsersRes.count || 0;
      const createdProfile7d = createdProfile7dRes.count || 0;
      const challengeCompleters7d = weeklyActiveUsers7d;

      const activationFunnel7d: ActivationStep[] = [
        {
          key: 'joined',
          label: 'Joined (7d)',
          count: joined7d,
          rateFromStart: 100,
        },
        {
          key: 'profile_created',
          label: 'Created profile (username set)',
          count: createdProfile7d,
          rateFromStart: joined7d ? Math.round((createdProfile7d / joined7d) * 1000) / 10 : 0,
        },
        {
          key: 'challenge_completed',
          label: 'Completed challenge',
          count: challengeCompleters7d,
          rateFromStart: joined7d ? Math.round((challengeCompleters7d / joined7d) * 1000) / 10 : 0,
        },
      ];

      if (activeChallenge) {
        const [uniqueRes, totalRes] = await Promise.all([
          supabase.from("post").select("user_id").eq("challenge_id", activeChallenge.id),
          supabase.from("post").select("id", { count: "exact", head: true }).eq("challenge_id", activeChallenge.id),
        ]);
        if (uniqueRes.error) throw uniqueRes.error;
        if (totalRes.error) throw totalRes.error;
        activeChallengeUniqueCompletions = new Set((uniqueRes.data || []).map((r) => r.user_id)).size;
        activeChallengeTotalCompletions = totalRes.count || 0;
      }

      type ChallengePostRow = {
        challenge_id: number;
        user_id: string;
        comfort_zone_rating: number | null;
        challenges: { title: string | null; title_it: string | null } | Array<{ title: string | null; title_it: string | null }> | null;
      };

      const challengeMap = new Map<number, {
        title: string;
        users: Set<string>;
        total: number;
        comfortSum: number;
        comfortCount: number;
      }>();

      ((challengePosts30dRes.data || []) as ChallengePostRow[]).forEach((row) => {
        const chMeta = Array.isArray(row.challenges) ? row.challenges[0] : row.challenges;
        const title = chMeta?.title_it || chMeta?.title || `Challenge #${row.challenge_id}`;

        const current = challengeMap.get(row.challenge_id) || {
          title,
          users: new Set<string>(),
          total: 0,
          comfortSum: 0,
          comfortCount: 0,
        };

        current.total += 1;
        current.users.add(row.user_id);

        if (typeof row.comfort_zone_rating === 'number') {
          current.comfortSum += row.comfort_zone_rating;
          current.comfortCount += 1;
        }

        challengeMap.set(row.challenge_id, current);
      });

      const topChallenges30d: ChallengeLeaderboardItem[] = Array.from(challengeMap.entries())
        .map(([challengeId, data]) => ({
          challengeId,
          challengeTitle: data.title,
          uniqueCompleters: data.users.size,
          totalCompletions: data.total,
          avgComfort: data.comfortCount ? Math.round((data.comfortSum / data.comfortCount) * 10) / 10 : null,
        }))
        .sort((a, b) => b.uniqueCompleters - a.uniqueCompleters)
        .slice(0, 5);

      setAnalytics({
        userCount: totalUsers,
        newUsers7d: newUsersRes.count || 0,
        newUsersPrev7d: newUsersPrev7dRes.count || 0,

        weeklyActiveUsers7d,
        weeklyActiveUsersPrev7d,
        dau1d,
        mau30d,
        dauMauRatio,
        newCompleters7d,
        returningCompleters7d,

        medianDaysToFirstCompletion30d,

        activeChallenge,
        activeChallengeUniqueCompletions,
        activeChallengeTotalCompletions,

        completions14d,
        newUsers14d,

        completionBuckets,

        posts7d: posts7dRes.count || 0,
        postsPrev7d: postsPrev7dRes.count || 0,
        comments7d: comments7dRes.count || 0,
        commentsPrev7d: commentsPrev7dRes.count || 0,
        feedback7d: feedback7dRes.count || 0,
        pendingReports: pendingReportsRes.count || 0,

        topChallenges30d,
        activationFunnel7d,
      });
    } catch (error) {
      console.error("Error fetching analytics:", error);
    } finally {
      setAnalyticsLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([fetchChallenges(), fetchUsers(), fetchAnalytics()]);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    fetchChallenges();
    fetchUsers();
    fetchAnalytics();
  }, []);

  const handleMediaUpload = async () => {
    try {
      const result = await uploadMedia({
        allowVideo: false,
        allowsEditing: true,
      });
      if (result) {
        setMediaPreview(result.mediaUrl);
        setImageMediaId(result.mediaId);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      Alert.alert("Error", "Failed to upload image");
    }
  };

  const createChallengeInDatabase = async () => {
    try {
      const newChallenge = {
        title,
        title_it: titleIt,
        description,
        description_it: descriptionIt,
        difficulty,
        created_by: user?.id,
        created_at: new Date().toISOString().split("T")[0],
        updated_at: new Date().toISOString().split("T")[0],
        image_media_id: imageMediaId,
      };

      const { error } = await supabase.from("challenges").insert([newChallenge]);

      if (error) {
        console.error("Error inserting data:", error);
        Alert.alert("Error", error.message);
      } else {
        Alert.alert("Success", "Challenge created successfully!");
        setTitle("");
        setDescription("");
        setDifficulty("easy");
        setMediaPreview(null);
        setImageMediaId(null);
        fetchChallenges();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An unknown error occurred";
      Alert.alert("Error", errorMessage);
    }
  };

  const handleCreateChallenge = () => {
    if (!title || !description || !difficulty) {
      Alert.alert("Error", "All fields must be filled out.");
      return;
    }
    createChallengeInDatabase();
  };

  const handleActivateChallenge = async (challengeId: number) => {
    try {
      // First, deactivate all challenges
      const { error: deactivateError } = await supabase
        .from("challenges")
        .update({
          is_active: false,
          updated_at: new Date().toISOString().split("T")[0],
        })
        .neq("id", 0);

      if (deactivateError) throw deactivateError;

      // Then, activate the selected challenge
      const { error: activateError } = await supabase
        .from("challenges")
        .update({
          is_active: true,
          updated_at: new Date().toISOString().split("T")[0],
        })
        .eq("id", challengeId);

      if (activateError) throw activateError;

      // Refresh the challenges list
      await fetchChallenges();
      Alert.alert("Success", "Challenge activated!");
    } catch (error) {
      console.error("Error activating challenge:", error);
      Alert.alert("Error", "Failed to activate challenge");
    }
  };

  const handleSendNotifications = async (challengeId: number, challengeTitle: string) => {
    try {
      await sendNewChallengeNotificationToAll(challengeId.toString(), challengeTitle);
      Alert.alert("Success", "Notifications sent to all users!");
    } catch (error) {
      console.error("Error sending notifications:", error);
      Alert.alert("Error", "Failed to send notifications");
    }
  };

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSendCustomNotification = async () => {
    if (!notifTitle.trim() || !notifBody.trim()) {
      Alert.alert("Error", "Title and body are required");
      return;
    }

    const targetUserIds = sendToAll
      ? await getAllUserIds()
      : selectedUserIds;

    if (targetUserIds.length === 0) {
      Alert.alert("Error", "No users selected");
      return;
    }

    setSendingNotification(true);
    try {
      const result = await sendCustomNotification(notifTitle.trim(), notifBody.trim(), targetUserIds);
      Alert.alert(
        "Done",
        `Sent: ${result.sent}\nFailed: ${result.failed}\nNo push token: ${result.noToken}`
      );
      setNotifTitle("");
      setNotifBody("");
      setSelectedUserIds([]);
    } catch (error) {
      console.error("Error sending custom notification:", error);
      Alert.alert("Error", "Failed to send notifications");
    } finally {
      setSendingNotification(false);
    }
  };

  const newUsers14d = analytics?.newUsers14d || [];
  const completions14d = analytics?.completions14d || [];
  const maxNewUsers14d = Math.max(...newUsers14d.map((p) => p.count), 1);
  const maxCompletions14d = Math.max(...completions14d.map((p) => p.count), 1);

  const pctDelta = (current: number, prev: number) => {
    if (prev === 0) return current > 0 ? 100 : 0;
    return Math.round(((current - prev) / prev) * 100);
  };

  const formatDelta = (d: number) => `${d > 0 ? '+' : ''}${d}%`;

  const activeCompletionRate = analytics?.userCount
    ? Math.round(((analytics.weeklyActiveUsers7d / analytics.userCount) * 1000)) / 10
    : 0;

  const activeChallengeRepeatRate = analytics?.activeChallengeTotalCompletions
    ? Math.round(
        ((
          (analytics.activeChallengeTotalCompletions - analytics.activeChallengeUniqueCompletions) /
          analytics.activeChallengeTotalCompletions
        ) *
          1000)
      ) / 10
    : 0;

  const newUsersDelta = analytics ? pctDelta(analytics.newUsers7d, analytics.newUsersPrev7d) : 0;
  const activeUsersDelta = analytics ? pctDelta(analytics.weeklyActiveUsers7d, analytics.weeklyActiveUsersPrev7d) : 0;
  const postsDelta = analytics ? pctDelta(analytics.posts7d, analytics.postsPrev7d) : 0;
  const commentsDelta = analytics ? pctDelta(analytics.comments7d, analytics.commentsPrev7d) : 0;

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.sectionTitle}>Analytics</Text>

        <View style={styles.insightsCard}>
          <Text style={styles.insightsTitle}>Actionable Insights (7d)</Text>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Acquisition trend</Text>
            <Text style={styles.insightValue}>{analyticsLoading ? '…' : formatDelta(newUsersDelta)}</Text>
          </View>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Active completers trend</Text>
            <Text style={styles.insightValue}>{analyticsLoading ? '…' : formatDelta(activeUsersDelta)}</Text>
          </View>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Content output trend (posts / comments)</Text>
            <Text style={styles.insightValue}>
              {analyticsLoading ? '…' : `${formatDelta(postsDelta)} / ${formatDelta(commentsDelta)}`}
            </Text>
          </View>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Weekly completion penetration</Text>
            <Text style={styles.insightValue}>{analyticsLoading ? '…' : `${activeCompletionRate}%`}</Text>
          </View>
          <View style={styles.insightRow}>
            <Text style={styles.insightLabel}>Current challenge repeat completion</Text>
            <Text style={styles.insightValue}>{analyticsLoading ? '…' : `${activeChallengeRepeatRate}%`}</Text>
          </View>
        </View>

        <View style={styles.analyticsGrid}>
          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>
              {analyticsLoading ? '…' : analytics?.userCount ?? '—'}
            </Text>
            <Text style={styles.analyticsLabel}>Total Users</Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>
              {analyticsLoading ? '…' : analytics?.newUsers7d ?? '—'}
            </Text>
            <Text style={styles.analyticsLabel}>New Users (7d)</Text>
            <Text style={styles.analyticsHint}>
              vs prev 7d: {analyticsLoading ? '…' : formatDelta(newUsersDelta)}
            </Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>
              {analyticsLoading ? '…' : analytics?.dau1d ?? '—'}
            </Text>
            <Text style={styles.analyticsLabel}>DAU (1d Active Users)</Text>
            <Text style={styles.analyticsHint}>
              MAU (30d): {analyticsLoading ? '…' : analytics?.mau30d ?? '—'}
            </Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>
              {analyticsLoading ? '…' : analytics?.weeklyActiveUsers7d ?? '—'}
            </Text>
            <Text style={styles.analyticsLabel}>Active Completers (7d)</Text>
            <Text style={styles.analyticsHint}>
              New: {analyticsLoading ? '…' : analytics?.newCompleters7d ?? '—'} · Returning:{' '}
              {analyticsLoading ? '…' : analytics?.returningCompleters7d ?? '—'}
            </Text>
            <Text style={styles.analyticsHint}>
              vs prev 7d: {analyticsLoading ? '…' : formatDelta(activeUsersDelta)}
            </Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>
              {analyticsLoading ? '…' : `${analytics?.dauMauRatio ?? 0}%`}
            </Text>
            <Text style={styles.analyticsLabel}>DAU / MAU</Text>
            <Text style={styles.analyticsHint}>Daily stickiness signal</Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>
              {analyticsLoading
                ? '…'
                : analytics?.activeChallenge
                  ? analytics.activeChallengeUniqueCompletions
                  : '—'}
            </Text>
            <Text style={styles.analyticsLabel}>Completed Current Challenge</Text>
            {analytics?.activeChallenge?.title ? (
              <Text style={styles.analyticsHint} numberOfLines={1}>
                {analytics.activeChallenge.title}
              </Text>
            ) : null}
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>
              {analyticsLoading ? '…' : analytics?.medianDaysToFirstCompletion30d ?? '—'}
            </Text>
            <Text style={styles.analyticsLabel}>Median Days to 1st Completion (30d)</Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>
              {analyticsLoading ? '…' : analytics?.posts7d ?? '—'}
            </Text>
            <Text style={styles.analyticsLabel}>Posts (7d)</Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>
              {analyticsLoading ? '…' : analytics?.comments7d ?? '—'}
            </Text>
            <Text style={styles.analyticsLabel}>Comments (7d)</Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>
              {analyticsLoading ? '…' : analytics?.feedback7d ?? '—'}
            </Text>
            <Text style={styles.analyticsLabel}>Feedback (7d)</Text>
          </View>

          <View style={styles.analyticsCard}>
            <Text style={styles.analyticsValue}>
              {analyticsLoading ? '…' : analytics?.pendingReports ?? '—'}
            </Text>
            <Text style={styles.analyticsLabel}>Pending Reports</Text>
          </View>
        </View>

        <View style={styles.chartWideCard}>
          <Text style={styles.chartTitle}>Activation Funnel (Last 7 Days)</Text>
          <Text style={styles.axisLabel}>Joined → Profile created → Challenge completion</Text>
          {(analytics?.activationFunnel7d || []).map((step) => (
            <View key={step.key} style={styles.funnelRow}>
              <View style={styles.funnelLabelWrap}>
                <Text style={styles.funnelLabel}>{step.label}</Text>
                <Text style={styles.funnelMeta}>{step.count} users · {step.rateFromStart}%</Text>
              </View>
              <View style={styles.funnelBarWrap}>
                <View style={[styles.funnelBar, { width: `${Math.max(4, Math.min(100, step.rateFromStart))}%` }]} />
              </View>
            </View>
          ))}
        </View>

        <View style={styles.chartsRow}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>New Users (14d)</Text>
            <Text style={styles.axisLabel}>Y: Count · X: Last 14 Days</Text>
            <View style={styles.barChartRow}>
              <View style={styles.yAxis}>
                <Text style={styles.yAxisTick}>{maxNewUsers14d}</Text>
                <Text style={styles.yAxisTick}>{Math.round(maxNewUsers14d / 2)}</Text>
                <Text style={styles.yAxisTick}>0</Text>
              </View>
              <View style={styles.barChart}>
                {newUsers14d.map((p) => (
                  <View
                    key={p.date}
                    style={[
                      styles.bar,
                      {
                        height: Math.max(3, Math.round((p.count / maxNewUsers14d) * 70)),
                        backgroundColor: colors.light.secondary,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Challenge Completions (14d)</Text>
            <Text style={styles.axisLabel}>Y: Count · X: Last 14 Days</Text>
            <View style={styles.barChartRow}>
              <View style={styles.yAxis}>
                <Text style={styles.yAxisTick}>{maxCompletions14d}</Text>
                <Text style={styles.yAxisTick}>{Math.round(maxCompletions14d / 2)}</Text>
                <Text style={styles.yAxisTick}>0</Text>
              </View>
              <View style={styles.barChart}>
                {completions14d.map((p) => (
                  <View
                    key={p.date}
                    style={[
                      styles.bar,
                      {
                        height: Math.max(3, Math.round((p.count / maxCompletions14d) * 70)),
                        backgroundColor: colors.light.primary,
                      },
                    ]}
                  />
                ))}
              </View>
            </View>
          </View>
        </View>

        <View style={styles.chartWideCard}>
          <Text style={styles.chartTitle}>Users by Total Challenges Completed</Text>
          <Text style={styles.axisLabel}>Y: Users · X: Total Completions</Text>
          <View style={styles.bucketRow}>
            {(analytics?.completionBuckets || []).map((b) => (
              <View key={b.label} style={styles.bucketItem}>
                <Text style={styles.bucketPercent}>{analyticsLoading ? '…' : b.count}</Text>
                <View style={styles.bucketBarWrap}>
                  <View
                    style={[
                      styles.bucketBar,
                      {
                        width: `${Math.min(100, Math.round((b.count / Math.max(...(analytics?.completionBuckets || []).map((x) => x.count), 1)) * 100))}%`,
                      },
                    ]}
                  />
                </View>
                <Text style={styles.bucketLabel}>{b.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.chartWideCard}>
          <Text style={styles.chartTitle}>Top Challenges (30d)</Text>
          <Text style={styles.axisLabel}>Ranked by unique completers</Text>
          {(analytics?.topChallenges30d || []).length === 0 ? (
            <Text style={styles.analyticsHint}>{analyticsLoading ? 'Loading…' : 'No challenge completion data yet.'}</Text>
          ) : (
            (analytics?.topChallenges30d || []).map((c, idx) => (
              <View key={c.challengeId} style={styles.topChallengeRow}>
                <Text style={styles.topChallengeRank}>#{idx + 1}</Text>
                <View style={styles.topChallengeInfo}>
                  <Text style={styles.topChallengeTitle} numberOfLines={1}>{c.challengeTitle}</Text>
                  <Text style={styles.topChallengeMeta}>
                    {c.uniqueCompleters} unique · {c.totalCompletions} completions · avg comfort {c.avgComfort ?? '—'}
                  </Text>
                </View>
              </View>
            ))
          )}
        </View>

        <Text style={styles.sectionTitle}>Create New Challenge</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter title"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          value={description}
          onChangeText={setDescription}
          placeholder="Enter description"
          multiline
        />

        <Text style={styles.label}>Italian Title</Text>
        <TextInput
          style={styles.input}
          value={titleIt}
          onChangeText={setTitleIt}
          placeholder="Enter Italian title"
        />

        <Text style={styles.label}>Italian Description</Text>
        <TextInput
          style={styles.input}
          value={descriptionIt}
          onChangeText={setDescriptionIt}
          placeholder="Enter Italian description"
          multiline
        />

        <View style={styles.dropdownContainer}>
          <Text style={styles.label}>Difficulty</Text>
          <DropDownPicker
            open={openDifficulty}
            value={difficulty}
            items={[
              { label: "Easy", value: "easy" },
              { label: "Medium", value: "medium" },
              { label: "Hard", value: "hard" },
            ]}
            setOpen={setOpenDifficulty}
            setValue={setDifficulty}
            placeholder="Select difficulty"
            style={styles.dropdown}
            zIndex={1000}
          />
        </View>

        <Text style={styles.label}>Challenge Image</Text>
        <TouchableOpacity style={styles.mediaUploadButton} onPress={handleMediaUpload}>
          {mediaPreview ? (
            <View style={styles.mediaPreviewContainer}>
              <Image source={{ uri: mediaPreview }} style={styles.mediaPreview} />
              <TouchableOpacity
                style={styles.removeButton}
                onPress={() => {
                  setMediaPreview(null);
                  setImageMediaId(null);
                }}
              >
                <MaterialIcons name="close" size={12} color="white" />
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <MaterialIcons name="image" size={24} color="#666" />
              <Text style={styles.uploadButtonText}>Tap to upload image</Text>
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.createChallengeButton} onPress={handleCreateChallenge}>
          <Text style={styles.buttonText}>Create Challenge</Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Send Notification</Text>

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={notifTitle}
          onChangeText={setNotifTitle}
          placeholder="Notification title"
        />

        <Text style={styles.label}>Body</Text>
        <TextInput
          style={[styles.input, { minHeight: 80 }]}
          value={notifBody}
          onChangeText={setNotifBody}
          placeholder="Notification message"
          multiline
        />

        <View style={styles.recipientToggle}>
          <TouchableOpacity
            style={[styles.toggleButton, sendToAll && styles.toggleButtonActive]}
            onPress={() => setSendToAll(true)}
          >
            <Text style={[styles.toggleButtonText, sendToAll && styles.toggleButtonTextActive]}>
              All Users
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !sendToAll && styles.toggleButtonActive]}
            onPress={() => setSendToAll(false)}
          >
            <Text style={[styles.toggleButtonText, !sendToAll && styles.toggleButtonTextActive]}>
              Select Users
            </Text>
          </TouchableOpacity>
        </View>

        {!sendToAll && (
          <View style={styles.userListContainer}>
            <TextInput
              style={styles.userSearchInput}
              value={userSearch}
              onChangeText={setUserSearch}
              placeholder="Search users..."
              autoCapitalize="none"
            />
            <View style={styles.userListHeader}>
              <Text style={styles.userListTitle}>
                {selectedUserIds.length} user{selectedUserIds.length !== 1 ? "s" : ""} selected
              </Text>
              <View style={styles.selectAllButtons}>
                <TouchableOpacity
                  onPress={() => {
                    const filteredIds = allUsers
                      .filter((u) => {
                        const search = userSearch.toLowerCase();
                        return (
                          u.username?.toLowerCase().includes(search) ||
                          u.name?.toLowerCase().includes(search)
                        );
                      })
                      .map((u) => u.id);
                    setSelectedUserIds((prev) => [...new Set([...prev, ...filteredIds])]);
                  }}
                  style={styles.selectAllButton}
                >
                  <Text style={styles.selectAllText}>Select All</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setSelectedUserIds([])}
                  style={styles.selectAllButton}
                >
                  <Text style={styles.selectAllText}>Clear</Text>
                </TouchableOpacity>
              </View>
            </View>
            <ScrollView style={styles.userList} nestedScrollEnabled>
              {allUsers
                .filter((u) => {
                  if (!userSearch) return true;
                  const search = userSearch.toLowerCase();
                  return (
                    u.username?.toLowerCase().includes(search) ||
                    u.name?.toLowerCase().includes(search)
                  );
                })
                .map((u) => (
                  <TouchableOpacity
                    key={u.id}
                    style={[
                      styles.userItem,
                      selectedUserIds.includes(u.id) && styles.userItemSelected,
                    ]}
                    onPress={() => toggleUserSelection(u.id)}
                  >
                    <MaterialIcons
                      name={selectedUserIds.includes(u.id) ? "check-box" : "check-box-outline-blank"}
                      size={20}
                      color={selectedUserIds.includes(u.id) ? colors.light.primary : "#666"}
                    />
                    <View style={styles.userItemTextContainer}>
                      <Text style={styles.userItemName}>{u.name || "Unknown"}</Text>
                      {u.username && <Text style={styles.userItemUsername}>@{u.username}</Text>}
                    </View>
                  </TouchableOpacity>
                ))}
            </ScrollView>
          </View>
        )}

        <TouchableOpacity
          style={[styles.sendNotificationButton, sendingNotification && styles.buttonDisabled]}
          onPress={handleSendCustomNotification}
          disabled={sendingNotification}
        >
          <Text style={styles.buttonText}>
            {sendingNotification ? "Sending..." : "Send Notification"}
          </Text>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Existing Challenges</Text>
        {challenges.map((challenge) => (
          <View key={challenge.id} style={styles.challengeCard}>
            {challenge.image_media_id && (
              <Image
                source={{
                  uri: `${
                    supabase.storage
                      .from("challenge-uploads")
                      .getPublicUrl(`image/${challenge.image_media_id}.jpg`).data.publicUrl
                  }`,
                }}
                style={styles.challengeImage}
              />
            )}
            <View style={styles.challengeInfo}>
              <Text style={styles.challengeTitle}>{challenge.title}</Text>
              <Text style={styles.challengeDifficulty}>Difficulty: {challenge.difficulty}</Text>
              <Text numberOfLines={2} style={styles.challengeDescription}>
                {challenge.description}
              </Text>
              <Text style={styles.challengeDate}>
                Created: {new Date(challenge.created_at).toLocaleDateString()}
              </Text>
              <View style={styles.challengeActions}>
                <TouchableOpacity
                  style={[styles.activateButton, challenge.is_active && styles.activeButton]}
                  onPress={() => handleActivateChallenge(challenge.id)}
                  disabled={challenge.is_active ?? false}
                >
                  <Text style={styles.buttonText}>
                    {challenge.is_active ? "Active" : "Activate"}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.notifyButton}
                  onPress={() => handleSendNotifications(challenge.id, challenge.title)}
                >
                  <Text style={styles.buttonText}>Notify All</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  activateButton: {
    backgroundColor: colors.light.secondary,
    borderRadius: 4,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  activeButton: {
    backgroundColor: colors.light.primary,
    opacity: 0.7,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  challengeActions: {
    flexDirection: "row",
    marginTop: 8,
  },
  challengeCard: {
    backgroundColor: "white",
    borderRadius: 8,
    elevation: 3,
    flexDirection: "row",
    marginBottom: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  challengeDate: {
    color: "#888",
    fontSize: 12,
  },
  challengeDescription: {
    color: "#444",
    fontSize: 14,
    marginBottom: 4,
  },
  challengeDifficulty: {
    color: "#666",
    fontSize: 14,
    marginBottom: 4,
  },
  challengeImage: {
    borderRadius: 8,
    height: 80,
    marginRight: 16,
    width: 80,
  },
  challengeInfo: {
    flex: 1,
  },
  challengeTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
  },
  createChallengeButton: {
    alignItems: "center",
    backgroundColor: colors.light.secondary,
    borderRadius: 8,
    elevation: 5,
    marginTop: 20,
    paddingVertical: 16,
    width: 160,
  },
  dropdown: {
    marginTop: 8,
  },
  dropdownContainer: {
    zIndex: 1000, // Ensure dropdown appears above other elements
    marginBottom: 60, // Add space for the dropdown options
  },
  input: {
    borderColor: "#ccc",
    borderRadius: 4,
    borderWidth: 1,
    marginTop: 8,
    padding: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
    marginTop: 16,
  },
  mediaPreview: {
    borderRadius: 8,
    height: "100%",
    resizeMode: "cover",
    width: "100%",
  },
  mediaPreviewContainer: {
    height: "100%",
    position: "relative",
    width: "100%",
  },
  mediaUploadButton: {
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
    height: 120,
    justifyContent: "center",
    marginTop: 8,
    padding: 16,
  },
  notifyButton: {
    backgroundColor: colors.light.primary,
    borderRadius: 4,
    marginRight: 8,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  removeButton: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 12,
    padding: 4,
    position: "absolute",
    right: 4,
    top: 4,
  },
  scrollView: {
    flex: 1,
    padding: 16,
  },
  sectionTitle: {
    color: colors.light.text,
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 16,
  },
  insightsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
    marginBottom: 12,
  },
  insightsTitle: {
    color: colors.light.text,
    fontSize: 14,
    fontWeight: '800',
    marginBottom: 8,
  },
  insightRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f4',
  },
  insightLabel: {
    color: '#666',
    fontSize: 12,
    flex: 1,
    marginRight: 8,
  },
  insightValue: {
    color: colors.light.text,
    fontSize: 12,
    fontWeight: '700',
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 8,
  },
  analyticsCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    width: '48%',
    borderWidth: 1,
    borderColor: '#eee',
  },
  analyticsValue: {
    fontSize: 24,
    fontWeight: '800',
    color: colors.light.text,
  },
  analyticsLabel: {
    marginTop: 4,
    color: '#666',
    fontSize: 12,
    fontWeight: '600',
  },
  analyticsHint: {
    marginTop: 4,
    color: '#888',
    fontSize: 11,
  },
  chartsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
    marginBottom: 8,
  },
  chartCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#eee',
  },
  chartTitle: {
    color: '#666',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 4,
  },
  axisLabel: {
    color: '#999',
    fontSize: 11,
    marginBottom: 8,
    fontWeight: '600',
  },
  chartWideCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 14,
    marginTop: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eee',
  },
  bucketRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
  },
  bucketItem: {
    flex: 1,
    alignItems: 'center',
  },
  bucketPercent: {
    fontSize: 12,
    fontWeight: '800',
    color: colors.light.text,
    marginBottom: 6,
  },
  bucketBarWrap: {
    width: '100%',
    height: 8,
    backgroundColor: '#eee',
    borderRadius: 4,
    overflow: 'hidden',
  },
  bucketBar: {
    height: '100%',
    backgroundColor: colors.light.primary,
    borderRadius: 4,
  },
  topChallengeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f4',
  },
  topChallengeRank: {
    color: colors.light.primary,
    fontSize: 12,
    fontWeight: '800',
    width: 28,
  },
  topChallengeInfo: {
    flex: 1,
  },
  topChallengeTitle: {
    color: colors.light.text,
    fontSize: 12,
    fontWeight: '700',
  },
  topChallengeMeta: {
    color: '#777',
    fontSize: 11,
    marginTop: 2,
  },
  funnelRow: {
    paddingVertical: 8,
    borderTopWidth: 1,
    borderTopColor: '#f4f4f4',
  },
  funnelLabelWrap: {
    marginBottom: 6,
  },
  funnelLabel: {
    color: colors.light.text,
    fontSize: 12,
    fontWeight: '700',
  },
  funnelMeta: {
    color: '#777',
    fontSize: 11,
    marginTop: 2,
  },
  funnelBarWrap: {
    width: '100%',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#eee',
    overflow: 'hidden',
  },
  funnelBar: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: colors.light.secondary,
  },
  bucketLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
  },
  barChartRow: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: 8,
  },
  yAxis: {
    width: 28,
    height: 72,
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  yAxisTick: {
    fontSize: 10,
    color: '#999',
    fontWeight: '700',
  },
  barChart: {
    flex: 1,
    height: 72,
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
  },
  bar: {
    flex: 1,
    borderRadius: 3,
    opacity: 0.9,
  },
  uploadButtonText: {
    color: "#666",
    marginTop: 8,
  },
  // Notification styles
  recipientToggle: {
    flexDirection: "row",
    marginTop: 16,
    gap: 8,
  },
  toggleButton: {
    borderColor: colors.light.primary,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
  },
  toggleButtonActive: {
    backgroundColor: colors.light.primary,
  },
  toggleButtonText: {
    color: colors.light.primary,
    fontWeight: "600",
  },
  toggleButtonTextActive: {
    color: "white",
  },
  userListContainer: {
    marginTop: 16,
    borderColor: "#ccc",
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: 350,
  },
  userSearchInput: {
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    padding: 12,
    fontSize: 14,
  },
  userListHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 12,
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
    backgroundColor: "#f9f9f9",
  },
  userListTitle: {
    fontWeight: "600",
    color: "#666",
  },
  selectAllButtons: {
    flexDirection: "row",
    gap: 12,
  },
  selectAllButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  selectAllText: {
    color: colors.light.primary,
    fontWeight: "600",
  },
  userList: {
    padding: 8,
    maxHeight: 200,
  },
  userItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 4,
    gap: 10,
  },
  userItemSelected: {
    backgroundColor: `${colors.light.primary}15`,
  },
  userItemTextContainer: {
    flex: 1,
  },
  userItemName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  userItemUsername: {
    fontSize: 12,
    color: "#888",
  },
  sendNotificationButton: {
    alignItems: "center",
    backgroundColor: colors.light.primary,
    borderRadius: 8,
    marginTop: 16,
    marginBottom: 8,
    paddingVertical: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});

export default ChallengeCreation;
