import React from "react";
import { Text } from "../components/StyledText";
import { colors } from "../constants/Colors";
import { TouchableOpacity, Image } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import { useState, useRef, useEffect } from "react";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { supabase, supabaseStorageUrl } from "../lib/supabase";
import { Challenge } from "../types";
import CompletionCelebrationModal from "../components/CompletionCelebrationModal";
import { View, StyleSheet } from "react-native";
import { PATRIZIO_ID } from "../constants/Patrizio";
import { useLanguage } from "../contexts/LanguageContext";
import { isVideo as isVideoUtil } from "../utils/utils";
import { router } from "expo-router";
import { imageService } from "../services/imageService";
import { captureEvent, setUserProperties } from "../lib/posthog";
import { CHALLENGE_EVENTS, USER_PROPERTIES } from "../constants/analyticsEvents";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { getChallengeDifficultyColor } from "../utils/challengeDifficulty";
import { CompletionPostComposer } from "./CompletionPostComposer";

interface ChallengeCardProps {
  challenge: Challenge;
}

export const ChallengeCard: React.FC<ChallengeCardProps> = ({ challenge }) => {
  const { t } = useLanguage();

  return (
    <>
      <Image
        source={{ uri: `${supabaseStorageUrl}/${challenge.media.file_path}` }}
        style={challengeStyles.challengeImage}
      />

      <View style={challengeStyles.card}>
        <View style={challengeStyles.challengeHeader}>
          <Text style={challengeStyles.challengeName} numberOfLines={3}>
            {challenge.title}{" "}
            <View
              style={[
                challengeStyles.difficultyBadgeContainer,
                { backgroundColor: getChallengeDifficultyColor(challenge.difficulty) },
              ]}
            >
              <Text style={challengeStyles.difficultyBadgeText}>
                {t(challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1))}
              </Text>
            </View>
          </Text>
        </View>

        <Text style={challengeStyles.description}>{challenge.description}</Text>
      </View>
    </>
  );
};

interface PatrizioExampleProps {
  challenge: Challenge;
}

type PatrizioSubmission = {
  id: number;
  media: {
    file_path: string;
    thumbnail_path?: string | null;
  };
} | null;

export const PatrizioExample: React.FC<PatrizioExampleProps> = ({ challenge }) => {
  const { t } = useLanguage();
  const [patrizioSubmission, setPatrizioSubmission] = useState<PatrizioSubmission>(null);
  const [loading, setLoading] = useState(true);
  const [imageUrls, setImageUrls] = useState<{ previewUrl: string; fullUrl: string }>({
    previewUrl: "",
    fullUrl: "",
  });
  const [isVideoSubmission, setIsVideoSubmission] = useState(false);

  useEffect(() => {
    const fetchPatrizioSubmission = async () => {
      try {
        const { data, error } = await supabase
          .from("post")
          .select(
            `
              *,
              media:media_id (
                file_path,
                thumbnail_path
              )
            `
          )
          .eq("challenge_id", challenge.id)
          .eq("user_id", PATRIZIO_ID)
          .single();

        if (error && error.code !== "PGRST116") throw error;
        setPatrizioSubmission(data);

        if (data) {
          const isVideoFile = isVideoUtil(data.media.file_path);
          setIsVideoSubmission(isVideoFile);

          const filePath =
            isVideoFile && data.media.thumbnail_path
              ? data.media.thumbnail_path
              : data.media.file_path;

          const urls = await imageService.getPostImageUrl(filePath, "medium");
          setImageUrls(urls);
        }
      } catch (error) {
        console.error("Error fetching Patrizio's submission:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPatrizioSubmission();
  }, [challenge.id]);

  const handlePress = () => {
    if (patrizioSubmission) {
      router.push(`/post/${patrizioSubmission.id}`);
      captureEvent(CHALLENGE_EVENTS.PATRIZIO_EXAMPLE_CLICKED, {
        challenge_id: challenge.id,
        post_id: patrizioSubmission.id,
      });
    }
  };

  if (loading || !patrizioSubmission) {
    return null;
  }

  return (
    <TouchableOpacity style={patrizioStyles.card} onPress={handlePress}>
      <View style={patrizioStyles.mediaContainer}>
        <Image source={{ uri: imageUrls.previewUrl }} style={patrizioStyles.mediaPreview} />
        {isVideoSubmission && (
          <View style={patrizioStyles.playIconOverlay}>
            <MaterialIcons name="play-circle-filled" size={24} color="white" />
          </View>
        )}
      </View>
      <View style={patrizioStyles.textContainer}>
        <Text style={patrizioStyles.title}>{t("Patrizio's submission")}</Text>
        <Text style={patrizioStyles.subtitle}>
          {t("Check out how Patrizio tackled this challenge!")}
        </Text>
      </View>
      <Text style={patrizioStyles.chevron}>›</Text>
    </TouchableOpacity>
  );
};

interface ShareExperienceProps {
  challenge: Challenge;
}

export const ShareExperience: React.FC<ShareExperienceProps> = ({ challenge }) => {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showShareModal, setShowShareModal] = useState(false);
  const submittedTextRef = useRef("");
  const [submittedMediaPreview, setSubmittedMediaPreview] = useState<string | null>(null);

  // Use React Query to check if user has completed the challenge
  const { data: hasCompleted = false, isLoading: checkingCompletion } = useQuery({
    queryKey: ["challenge-completion", challenge.id, user?.id],
    queryFn: async () => {
      if (!user) return false;

      const { data, error } = await supabase
        .from("post")
        .select("id")
        .eq("challenge_id", challenge.id)
        .eq("user_id", user.id)
        .limit(1);

      return !error && data && data.length > 0;
    },
    enabled: !!user,
    staleTime: 30000,
  });

  return (
    <>
      <CompletionPostComposer
        variant="challenge"
        completed={hasCompleted}
        checkingCompletion={checkingCompletion}
        buildSubmitData={({ userId, comfortRating }) => ({
          user_id: userId,
          challenge_id: challenge.id,
          comfort_zone_rating: comfortRating,
        })}
        onCompleted={({ selectedMediaItems, submittedText, comfortRating }) => {
          const firstSelectedMedia = selectedMediaItems[0] || null;
          submittedTextRef.current = submittedText;
          setSubmittedMediaPreview(firstSelectedMedia?.previewUrl || null);
          queryClient.setQueryData(["challenge-completion", challenge.id, user?.id], true);
          queryClient.invalidateQueries({ queryKey: ["home-posts"] });
          captureEvent(CHALLENGE_EVENTS.COMPLETED, {
            challenge_id: challenge.id,
            challenge_title: challenge.title,
            challenge_difficulty: challenge.difficulty,
            has_media: selectedMediaItems.length > 0,
            is_video: firstSelectedMedia?.isVideo || false,
            media_count: selectedMediaItems.length,
            comfort_zone_rating: comfortRating,
          });
          setUserProperties({
            [USER_PROPERTIES.LAST_ACTIVE]: new Date().toISOString(),
          });
          setTimeout(() => {
            setShowShareModal(true);
            captureEvent(CHALLENGE_EVENTS.SHARE_MODAL_OPENED, {
              challenge_id: challenge.id,
            });
          }, 100);
        }}
      />

      <CompletionCelebrationModal
        isVisible={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={challenge.title}
        variant="challenge"
        variantId={challenge.id}
        mediaPreview={submittedMediaPreview}
        postText={submittedTextRef.current || t("Just completed this week's challenge!")}
      />
    </>
  );
};

const challengeStyles = StyleSheet.create({
  card: {
    width: "80%",
    alignSelf: "center",
  },
  challengeHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
  },
  challengeImage: {
    alignSelf: "center",
    aspectRatio: 1,
    borderRadius: 16,
    marginBottom: 16,
    width: "80%",
  },
  challengeName: {
    color: colors.light.primary,
    flex: 1,
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
    textAlign: "left",
  },
  description: {
    color: colors.light.text,
    fontSize: 14,
    textAlign: "left",
  },
  difficultyBadgeContainer: {
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  difficultyBadgeText: {
    color: colors.light.text,
    fontSize: 12,
  },
});

const patrizioStyles = StyleSheet.create({
  card: {
    alignItems: "center",
    backgroundColor: colors.light.background,
    borderRadius: 12,
    flexDirection: "row",
    marginBottom: 10,
    padding: 15,
    width: "100%",
  },
  chevron: {
    color: colors.light.primary,
    fontSize: 24,
  },
  mediaContainer: {
    height: 50,
    marginRight: 15,
    position: "relative",
    width: 50,
  },
  mediaPreview: {
    borderRadius: 8,
    height: 50,
    marginRight: 15,
    width: 50,
  },
  playIconOverlay: {
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
    borderRadius: 8,
    bottom: 0,
    justifyContent: "center",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0,
  },
  subtitle: {
    color: colors.light.lightText,
    fontSize: 13,
  },
  textContainer: {
    flex: 1,
  },
  title: {
    color: colors.light.primary,
    fontSize: 16,
    fontWeight: "bold",
  },
});
