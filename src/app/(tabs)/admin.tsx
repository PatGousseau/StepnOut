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

type AdminAnalytics = {
  userCount: number;
  newUsers7d: number;

  weeklyActiveUsers7d: number;
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
  comments7d: number;
  feedback7d: number;
  pendingReports: number;
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
      const { data, error } = await supabase
        .from("profiles")
        .select("id, username, name")
        .order("username", { ascending: true });

      if (error) throw error;
      setAllUsers(data || []);
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const fetchAnalytics = async () => {
    setAnalyticsLoading(true);
    try {
      const since7dDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const since14dDate = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
      const since30dDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

      const since7d = since7dDate.toISOString();
      const since14d = since14dDate.toISOString();
      const since30d = since30dDate.toISOString();

      const [
        usersRes,
        newUsersRes,
        completers7dRes,
        completersBefore7dRes,
        activeChallengeRes,
        completions14dRes,
        newUsers14dRes,
        profiles30dRes,
        completions30dRes,
        completionPostsRes,
        posts7dRes,
        comments7dRes,
        feedback7dRes,
        pendingReportsRes,
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('profiles').select('id', { count: 'exact', head: true }).gte('created_at', since7d),

        // note: challenge completions are represented by posts with a challenge_id
        supabase
          .from('post')
          .select('user_id')
          .not('challenge_id', 'is', null)
          .gte('created_at', since7d),
        supabase
          .from('post')
          .select('user_id')
          .not('challenge_id', 'is', null)
          .lt('created_at', since7d),

        supabase.from('challenges').select('id, title').eq('is_active', true).limit(1).maybeSingle(),

        supabase
          .from('post')
          .select('created_at')
          .not('challenge_id', 'is', null)
          .gte('created_at', since14d),
        supabase.from('profiles').select('created_at').gte('created_at', since14d),

        supabase.from('profiles').select('id, created_at').gte('created_at', since30d),
        supabase
          .from('post')
          .select('user_id, created_at')
          .not('challenge_id', 'is', null)
          .gte('created_at', since30d),

        // for completion distribution: fetch all completion posts (user_id only)
        supabase
          .from('post')
          .select('user_id')
          .not('challenge_id', 'is', null)
          .order('id', { ascending: true })
          .range(0, 999),

        supabase
          .from('post')
          .select('id', { count: 'exact', head: true })
          .gte('created_at', since7d)
          .eq('is_welcome', false),
        supabase.from('comments').select('id', { count: 'exact', head: true }).gte('created_at', since7d),
        supabase.from('feedback').select('id', { count: 'exact', head: true }).gte('created_at', since7d),
        supabase.from('reports').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
      ]);

      if (usersRes.error) throw usersRes.error;
      if (newUsersRes.error) throw newUsersRes.error;
      if (completers7dRes.error) throw completers7dRes.error;
      if (completersBefore7dRes.error) throw completersBefore7dRes.error;
      if (activeChallengeRes.error) throw activeChallengeRes.error;
      if (completions14dRes.error) throw completions14dRes.error;
      if (newUsers14dRes.error) throw newUsers14dRes.error;
      if (profiles30dRes.error) throw profiles30dRes.error;
      if (completions30dRes.error) throw completions30dRes.error;
      if (completionPostsRes.error) throw completionPostsRes.error;
      if (posts7dRes.error) throw posts7dRes.error;
      if (comments7dRes.error) throw comments7dRes.error;
      if (feedback7dRes.error) throw feedback7dRes.error;
      if (pendingReportsRes.error) throw pendingReportsRes.error;

      const completers7d = new Set((completers7dRes.data || []).map((r) => r.user_id));
      const completersBefore7d = new Set((completersBefore7dRes.data || []).map((r) => r.user_id));

      let returningCompleters7d = 0;
      let newCompleters7d = 0;
      completers7d.forEach((uid) => {
        if (completersBefore7d.has(uid)) returningCompleters7d += 1;
        else newCompleters7d += 1;
      });

      const weeklyActiveUsers7d = completers7d.size;

      const toDayKey = (iso: string) => {
        const d = new Date(iso);
        return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${String(d.getUTCDate()).padStart(2, '0')}`;
      };

      const buildEmptySeries = (days: number) => {
        const series: AdminTimeseriesPoint[] = [];
        for (let i = days - 1; i >= 0; i -= 1) {
          const d = new Date();
          d.setUTCHours(0, 0, 0, 0);
          d.setUTCDate(d.getUTCDate() - i);
          series.push({ date: toDayKey(d.toISOString()), count: 0 });
        }
        return series;
      };

      const completions14d = buildEmptySeries(14);
      const newUsers14d = buildEmptySeries(14);

      const completionsByDay = new Map<string, number>();
      (completions14dRes.data || []).forEach((r) => {
        const k = toDayKey(r.created_at);
        completionsByDay.set(k, (completionsByDay.get(k) || 0) + 1);
      });
      completions14d.forEach((p) => {
        p.count = completionsByDay.get(p.date) || 0;
      });

      const newUsersByDay = new Map<string, number>();
      (newUsers14dRes.data || []).forEach((r) => {
        const k = toDayKey(r.created_at);
        newUsersByDay.set(k, (newUsersByDay.get(k) || 0) + 1);
      });
      newUsers14d.forEach((p) => {
        p.count = newUsersByDay.get(p.date) || 0;
      });

      const fetchAllCompletionPostUserIds = async () => {
        const pageSize = 1000;
        const userIds: string[] = [];

        let from = 0;
        // start with the first page we already fetched
        userIds.push(...((completionPostsRes.data || []).map((r) => r.user_id) as string[]));

        let lastPageLen = (completionPostsRes.data || []).length;

        while (lastPageLen === pageSize) {
          from += pageSize;
          const { data, error } = await supabase
            .from('post')
            .select('user_id')
            .not('challenge_id', 'is', null)
            .order('id', { ascending: true })
            .range(from, from + pageSize - 1);

          if (error) throw error;
          if (!data || data.length === 0) break;

          userIds.push(...(data.map((r) => r.user_id) as string[]));
          lastPageLen = data.length;
          if (data.length < pageSize) break;
        }

        return userIds;
      };

      const completionBuckets = await (async () => {
        const totalUsers = usersRes.count || 0;
        const userIds = await fetchAllCompletionPostUserIds();

        const completionsPerUser = new Map<string, number>();
        userIds.forEach((uid) => {
          completionsPerUser.set(uid, (completionsPerUser.get(uid) || 0) + 1);
        });

        const bucketCounts = new Map<string, number>([
          ['0', Math.max(0, totalUsers - completionsPerUser.size)],
          ['1', 0],
          ['2', 0],
          ['3', 0],
          ['4', 0],
          ['5+', 0],
        ]);

        completionsPerUser.forEach((count) => {
          const b =
            count === 1
              ? '1'
              : count === 2
                ? '2'
                : count === 3
                  ? '3'
                  : count === 4
                    ? '4'
                    : '5+';
          bucketCounts.set(b, (bucketCounts.get(b) || 0) + 1);
        });

        const order = ['1', '2', '3', '4', '5+'] as const;
        return order.map((b) => {
          const c = bucketCounts.get(b) || 0;
          const percent = totalUsers ? Math.round((c / totalUsers) * 1000) / 10 : 0;
          return { label: b, count: c, percent };
        });
      })();

      // median time to first completion for users created in last 30d (rough but useful)
      const profileCreatedAt = new Map<string, string>();
      (profiles30dRes.data || []).forEach((p) => {
        profileCreatedAt.set(p.id, p.created_at);
      });

      const firstCompletionAt = new Map<string, string>();
      (completions30dRes.data || []).forEach((c) => {
        const prev = firstCompletionAt.get(c.user_id);
        if (!prev || new Date(c.created_at).getTime() < new Date(prev).getTime()) {
          firstCompletionAt.set(c.user_id, c.created_at);
        }
      });

      const deltas: number[] = [];
      firstCompletionAt.forEach((completedAt, uid) => {
        const createdAt = profileCreatedAt.get(uid);
        if (!createdAt) return;
        const deltaDays = (new Date(completedAt).getTime() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24);
        if (Number.isFinite(deltaDays) && deltaDays >= 0) deltas.push(deltaDays);
      });
      deltas.sort((a, b) => a - b);
      const medianDaysToFirstCompletion30d = deltas.length
        ? Math.round(deltas[Math.floor(deltas.length / 2)] * 10) / 10
        : null;

      let activeChallengeUniqueCompletions = 0;
      let activeChallengeTotalCompletions = 0;
      const activeChallenge = activeChallengeRes.data ?? null;

      if (activeChallenge) {
        const [uniqueRes, totalRes] = await Promise.all([
          supabase.from('post').select('user_id').eq('challenge_id', activeChallenge.id),
          supabase.from('post').select('id', { count: 'exact', head: true }).eq('challenge_id', activeChallenge.id),
        ]);

        if (uniqueRes.error) throw uniqueRes.error;
        if (totalRes.error) throw totalRes.error;

        activeChallengeUniqueCompletions = new Set((uniqueRes.data || []).map((r) => r.user_id)).size;
        activeChallengeTotalCompletions = totalRes.count || 0;
      }

      setAnalytics({
        userCount: usersRes.count || 0,
        newUsers7d: newUsersRes.count || 0,

        weeklyActiveUsers7d,
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
        comments7d: comments7dRes.count || 0,
        feedback7d: feedback7dRes.count || 0,
        pendingReports: pendingReportsRes.count || 0,
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
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
        "Success",
        `Notifications sent: ${result.sent} successful, ${result.failed} failed`
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

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <Text style={styles.sectionTitle}>Analytics</Text>

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

        <View style={styles.chartsRow}>
          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>New Users (14d)</Text>
            <Text style={styles.axisLabel}>Y: Count · X: Last 14 Days</Text>
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

          <View style={styles.chartCard}>
            <Text style={styles.chartTitle}>Challenge Completions (14d)</Text>
            <Text style={styles.axisLabel}>Y: Count · X: Last 14 Days</Text>
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
  bucketLabel: {
    marginTop: 6,
    fontSize: 11,
    fontWeight: '700',
    color: '#666',
  },
  barChart: {
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
