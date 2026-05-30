import { useState } from "react";
import { Linking, Platform } from "react-native";
import { AppAlert } from "../components/AppAlert";
import { useLanguage } from "../contexts/LanguageContext";
import { captureEvent } from "../lib/posthog";
import { POST_EVENTS } from "../constants/analyticsEvents";
import { MediaSelectionResult, selectMediaItemsForPreview } from "../utils/handleMediaUpload";

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : undefined;

export const useMediaSelection = (maxItems = 4) => {
  const { t } = useLanguage();
  const [selectedMediaItems, setSelectedMediaItems] = useState<MediaSelectionResult[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleMediaUpload = async () => {
    try {
      setIsUploading(true);
      const remainingSlots = Math.max(maxItems - selectedMediaItems.length, 0);
      if (remainingSlots === 0) return;

      const result = await selectMediaItemsForPreview({
        allowVideo: true,
        selectionLimit: remainingSlots,
      });

      if (result.length > 0) {
        setSelectedMediaItems((prev) => [...prev, ...result].slice(0, maxItems));
      }
    } catch (error: unknown) {
      console.error("Error selecting media:", error);
      const message = getErrorMessage(error);

      if (message?.includes("permissions not granted")) {
        captureEvent(POST_EVENTS.MEDIA_PERMISSION_DENIED);
        AppAlert.show(
          t("Photo Access Required"),
          t("Please enable photo library access in Settings to share photos and videos."),
          [
            { text: t("Cancel"), style: "cancel" },
            {
              text: t("Open Settings"),
              onPress: () => {
                if (Platform.OS === "ios") {
                  Linking.openURL("app-settings:");
                } else {
                  Linking.openSettings();
                }
              },
            },
          ]
        );
      } else {
        captureEvent(POST_EVENTS.MEDIA_PICK_FAILED, { message });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveMedia = (index?: number) => {
    if (index == null) {
      setSelectedMediaItems([]);
      return;
    }

    setSelectedMediaItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index));
  };

  return {
    selectedMediaItems,
    isUploading,
    handleMediaUpload,
    handleRemoveMedia,
    clearMedia: () => setSelectedMediaItems([]),
  };
};
