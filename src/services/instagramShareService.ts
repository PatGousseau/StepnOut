import { Linking, Platform, Share as RNShare } from "react-native";

const APP_STORE_URL = "https://apps.apple.com/app/stepnout/id6670766555";
const PLAY_STORE_URL = "https://play.google.com/store/apps/details?id=com.patrickgousseau.stepnout";
// Facebook App ID for Instagram Stories sharing (required by Instagram)
const FACEBOOK_APP_ID = "1021997516334314";

// Lazy load react-native-share to avoid crashes in Expo Go
let ShareModule: typeof import("react-native-share").default | null = null;
let Social: typeof import("react-native-share").Social | null = null;

async function getShareModule() {
  if (ShareModule === null) {
    try {
      const module = await import("react-native-share");
      ShareModule = module.default;
      Social = module.Social;
    } catch {
      // Module not available (e.g., in Expo Go)
      ShareModule = null;
      Social = null;
    }
  }
  return { Share: ShareModule, Social };
}

export const instagramShareService = {
  /**
   * Check if Instagram is installed on the device
   */
  async isInstagramInstalled(): Promise<boolean> {
    try {
      // Check instagram-stories scheme specifically for Stories sharing
      const canOpenStories = await Linking.canOpenURL("instagram-stories://share");
      console.log("[Instagram Share] canOpenURL instagram-stories://share:", canOpenStories);
      if (canOpenStories) return true;

      // Fallback to basic instagram scheme
      const canOpenInstagram = await Linking.canOpenURL("instagram://app");
      console.log("[Instagram Share] canOpenURL instagram://app:", canOpenInstagram);
      return canOpenInstagram;
    } catch (e) {
      console.log("[Instagram Share] canOpenURL error:", e);
      return false;
    }
  },

  /**
   * Get the app download URL based on platform
   */
  getAttributionUrl(): string {
    return Platform.OS === "ios" ? APP_STORE_URL : PLAY_STORE_URL;
  },

  /**
   * Share to Instagram Stories
   * @param imageUri - The local file URI (file://) or base64 data URL of the image to share
   * @returns true if shared successfully, false if failed
   */
  async shareToInstagramStories(imageUri: string): Promise<boolean> {
    try {
      const { Share, Social: SocialEnum } = await getShareModule();

      console.log("[Instagram Share] Module loaded:", { Share: !!Share, Social: !!SocialEnum });

      if (!Share || !SocialEnum) {
        console.log("[Instagram Share] Module not available, falling back to native share");
        return this.shareNative(imageUri);
      }

      console.log("[Instagram Share] Attempting to share to Instagram Stories...");
      console.log("[Instagram Share] Image URI:", imageUri.substring(0, 80));

      await Share.shareSingle({
        stickerImage: imageUri,
        social: SocialEnum.InstagramStories,
        backgroundBottomColor: "#000000",
        backgroundTopColor: "#000000",
        appId: FACEBOOK_APP_ID,
      });

      console.log("[Instagram Share] Share completed successfully");
      return true;
    } catch (error: unknown) {
      console.log("[Instagram Share] Error:", error);
      // User cancelled or Instagram not available
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("User did not share") || errorMessage.includes("cancel")) {
        return false;
      }
      throw error;
    }
  },

  /**
   * Fallback share using the native share sheet
   * @param imageUri - The local file URI of the image to share
   * @param message - Optional message to include
   */
  async shareNative(imageUri: string, message?: string): Promise<boolean> {
    try {
      const { Share } = await getShareModule();

      if (Share) {
        // Ensure the URI has file:// prefix for react-native-share
        let url = imageUri;
        if (!imageUri.startsWith("file://") && !imageUri.startsWith("data:") && imageUri.startsWith("/")) {
          url = `file://${imageUri}`;
        }

        await Share.open({
          url,
          message: message || "Join me on StepnOut!",
          type: "image/png",
        });
      } else {
        // Fallback to React Native's built-in Share (works in Expo Go)
        await RNShare.share({
          message: message || "Join me on StepnOut! " + this.getAttributionUrl(),
        });
      }
      return true;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      if (errorMessage.includes("User did not share") || errorMessage.includes("cancel") || errorMessage.includes("dismissed")) {
        return false;
      }
      throw error;
    }
  },
};
