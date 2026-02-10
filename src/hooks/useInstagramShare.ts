import { useState, useRef, useCallback, useEffect } from "react";
import { View } from "react-native";
import { captureRef } from "react-native-view-shot";
import { Image } from "expo-image";
import { instagramShareService } from "../services/instagramShareService";
import { captureEvent } from "../lib/posthog";
import { POST_EVENTS } from "../constants/analyticsEvents";
import { supabase } from "../lib/supabase";

interface UseInstagramShareOptions {
  postId: number;
  isChallengePost: boolean;
  challengeId?: number;
  mediaUrl?: string;
}

interface UseInstagramShareReturn {
  storyCardRef: React.RefObject<View | null>;
  isSharing: boolean;
  imageLoaded: boolean;
  onImageLoad: () => void;
  completionCount: number;
  shareToInstagram: () => Promise<void>;
}

export function useInstagramShare({
  postId,
  isChallengePost,
  challengeId,
  mediaUrl,
}: UseInstagramShareOptions): UseInstagramShareReturn {
  const storyCardRef = useRef<View>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(!mediaUrl);
  const [completionCount, setCompletionCount] = useState(0);

  useEffect(() => {
    if (!challengeId) return;
    supabase
      .from("post")
      .select("id", { count: "exact", head: true })
      .eq("challenge_id", challengeId)
      .then(({ count }) => setCompletionCount(count || 0));
  }, [challengeId]);

  const onImageLoad = useCallback(() => {
    setImageLoaded(true);
  }, []);

  const shareToInstagram = useCallback(async () => {
    if (isSharing || !storyCardRef.current) return;

    setIsSharing(true);

    try {
      // Prefetch the media image to ensure it's cached before capture
      if (mediaUrl) {
        console.log("[Instagram Share] Prefetching image:", mediaUrl.substring(0, 80));
        await Image.prefetch(mediaUrl);
        // Wait for a render cycle so the Image component updates with cached data
        await new Promise((resolve) => requestAnimationFrame(resolve));
        // Extra safety: wait another frame
        await new Promise((resolve) => requestAnimationFrame(resolve));
      }

      // Capture the story card as a temp file (more memory efficient than base64)
      console.log("[Instagram Share] Capturing story card...");
      const fileUri = await captureRef(storyCardRef, {
        format: "png",
        quality: 1,
        result: "tmpfile",
      });

      console.log("[Instagram Share] Captured to:", fileUri);

      // Check if Instagram is installed
      const instagramInstalled = await instagramShareService.isInstagramInstalled();
      console.log("[Instagram Share] Instagram installed:", instagramInstalled);

      let shared = false;

      if (instagramInstalled) {
        // Try to share to Instagram Stories
        try {
          shared = await instagramShareService.shareToInstagramStories(fileUri);
        } catch (e) {
          // If Instagram share fails, fall back to native share
          console.log("[Instagram Share] Failed, falling back to native:", e);
          shared = await instagramShareService.shareNative(fileUri);
        }
      } else {
        // Instagram not installed, use native share
        console.log("[Instagram Share] Instagram not installed, using native share");
        shared = await instagramShareService.shareNative(fileUri);
      }

      if (shared) {
        captureEvent(POST_EVENTS.SHARED_TO_INSTAGRAM, {
          post_id: postId,
          is_challenge_post: isChallengePost,
          share_method: instagramInstalled ? "instagram_stories" : "native",
        });
      }
    } catch (error) {
      console.error("Error sharing to Instagram:", error);
      captureEvent("share_error", {
        post_id: postId,
        error: error instanceof Error ? error.message : String(error),
      });
    } finally {
      setIsSharing(false);
    }
  }, [isSharing, postId, isChallengePost, mediaUrl]);

  return {
    storyCardRef,
    isSharing,
    imageLoaded,
    onImageLoad,
    completionCount,
    shareToInstagram,
  };
}
