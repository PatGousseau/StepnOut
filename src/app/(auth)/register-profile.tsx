import React, { useState, useEffect } from "react";
import {
  View,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Alert,
  Keyboard,
  Pressable,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { colors } from "../../constants/Colors";
import { useAuth } from "../../contexts/AuthContext";
import * as ImagePicker from "expo-image-picker";
import { supabase } from "../../lib/supabase";
import { Text } from "../../components/StyledText";
import { useLanguage } from "@/src/contexts/LanguageContext";
import { Loader } from "@/src/components/Loader";
import { EULA_IT, EULA } from "../../constants/EULA";
import { isInstagramUsernameValidProfile } from "../../utils/validation";

export default function RegisterProfileScreen() {
  const { isSocialUser, isIncompleteProfile } = useLocalSearchParams<{
    isSocialUser?: string;
    isIncompleteProfile?: string;
  }>();
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { signUp } = useAuth();
  const [profileMediaId, setProfileMediaId] = useState<number | null>(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [instagram, setInstagram] = useState('');
  const [error, setError] = useState<string | null>(null);
  const { t, language } = useLanguage();

  const isSocialSignUp = isSocialUser === 'true';
  const isProfileCompletion = isIncompleteProfile === 'true';

  useEffect(() => {
    if (!isProfileCompletion) return;
    const fetchExistingProfile = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      const { data: profile } = await supabase
        .from('profiles')
        .select('username, name, instagram, profile_media_id, profile_media:media!profiles_profile_media_id_fkey(file_path)')
        .eq('id', user.id)
        .single();
      if (!profile) return;
      if (profile.username) setUsername(profile.username);
      if (profile.name) setDisplayName(profile.name);
      if (profile.instagram) setInstagram(profile.instagram);
      if (profile.profile_media_id) {
        setProfileMediaId(profile.profile_media_id);
        const filePath = (profile.profile_media as any)?.file_path;
        if (filePath) {
          const { data } = supabase.storage.from('challenge-uploads').getPublicUrl(filePath);
          setProfileImage(data.publicUrl);
        }
      }
    };
    fetchExistingProfile();
  }, [isProfileCompletion]);

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      try {
        setImageUploading(true);
        const file = result.assets[0];
        const fileName = `profile/${Date.now()}.jpg`;

        // Create form data for upload
        const formData = new FormData();
        formData.append("file", {
          uri: file.uri,
          name: fileName,
          type: "image/jpeg",
        } as any);

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("challenge-uploads")
          .upload(fileName, formData, {
            contentType: "multipart/form-data",
          });

        if (uploadError) throw uploadError;

        // Insert into media table
        const { data: mediaData, error: dbError } = await supabase
          .from("media")
          .insert([{ file_path: fileName }])
          .select("id")
          .single();

        if (dbError) throw dbError;

        setProfileMediaId(mediaData.id);
        setProfileImage(file.uri);
      } catch (error) {
        console.error("Error uploading profile image:", error);
        Alert.alert(t("Error"), t("Failed to upload profile image"));
      } finally {
        setImageUploading(false);
      }
    }
  };

  const handleRegister = async () => {
    setError(null);

    if (!username || !displayName) {
      setError(t("Please fill in all required fields"));
      return;
    }

    try {
      setLoading(true);

      if (instagram) {
        const instagramRegex = /^[a-zA-Z0-9._]+$/;
        if (!instagramRegex.test(instagram)) {
          setError(t("Instagram usernames can only use letters, numbers, underscores and periods."));
          setLoading(false);
          return;
        }

        try {
          const isValid = await isInstagramUsernameValidProfile(instagram);
          if (!isValid) {
            setError(t("Instagram profile not found. Check your username"));
            setLoading(false);
            return;
          }
        } catch (err) {
          console.log('Error checking instagram:', err);
          // If fetch fails (e.g. network or calls restrictions), we typically let it pass or show a warning.
          // For now, proceeding as we only want to block if we explicitly know it's invalid.
        }
      }

      setLoading(true); // Ensure loading is still true if we passed the check

      // Complete profile setup
      const userId = await signUp({
        username,
        displayName,
        profileMediaId,
        instagram: instagram,
        isSocialUser: isSocialSignUp,
      });

      if (isProfileCompletion) {
        router.replace('/(tabs)');
      } else {
        // Show EULA then go to onboarding
        Alert.alert(t('End User License Agreement'), language === 'it' ? EULA_IT : EULA, [
          {
            text: t('Accept'), onPress: async () => {
              await supabase
                .from('profiles')
                .update({ eula_accepted: true })
                .eq('id', userId);
              router.replace('/(auth)/onboarding');
            }
          },
          {
            text: t('Decline'),
            onPress: async () => {
              await supabase.auth.signOut();
              router.replace('/(auth)/login');
            }
          }
        ]);
      }
    } catch (error) {
      setError(t((error as Error).message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Pressable style={[styles.form, !isProfileCompletion && styles.formCentered]} onPress={Keyboard.dismiss}>
        {isProfileCompletion && (
          <Text style={styles.infoBannerText}>
            {t("It looks like your profile is missing some details. Please fill in the fields below to continue.")}
          </Text>
        )}

        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.stepnOut}>{t("Stepn Out")}</Text>
          {(isSocialSignUp || isProfileCompletion) && (
            <Text style={styles.subtitle}>{t("Complete your profile")}</Text>
          )}
        </View>

        <View style={styles.profileSection}>
          <TouchableOpacity
            style={styles.imageContainer}
            onPress={pickImage}
            disabled={imageUploading}
          >
            {imageUploading ? (
              <View style={styles.placeholderImage}>
                <Loader />
              </View>
            ) : profileImage ? (
              <Image
                source={{ uri: profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Text style={styles.placeholderText}>{t("Add Photo")}</Text>
              </View>
            )}
          </TouchableOpacity>

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder={t("Username*")}
              placeholderTextColor="#666"
              value={username}
              onChangeText={(text) => setUsername(text.replace(/\s/g, ''))}
              autoCapitalize="none"
            />
            <TextInput
              style={styles.input}
              placeholder={t("Display Name*")}
              placeholderTextColor="#666"
              value={displayName}
              onChangeText={setDisplayName}
            />
            <TextInput
              placeholder={t("Instagram (Optional)")}
              placeholderTextColor="#666"
              value={instagram}
              onChangeText={(text) => setInstagram(text.replace(/[@\s]+/g, ''))}
              style={styles.input}
              autoCapitalize="none"
            />
          </View>
        </View>

        {error && (
          <Text style={styles.errorText}>{error}</Text>
        )}

        <TouchableOpacity
          style={[
            styles.button,
            (loading || imageUploading) && styles.buttonDisabled,
          ]}
          onPress={handleRegister}
          disabled={loading || imageUploading}
        >
          <Text style={styles.buttonText}>
            {loading
              ? t("Saving...")
              : isProfileCompletion
                ? t("Complete Profile")
                : isSocialSignUp
                  ? t("Complete Setup")
                  : t("Complete Registration")}
          </Text>
        </TouchableOpacity>
      </Pressable>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: "center",
    backgroundColor: colors.light.primary,
    borderRadius: 5,
    padding: 15,
  },
  buttonDisabled: {
    opacity: 0.7,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  container: {
    backgroundColor: colors.light.background,
    flex: 1,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    marginBottom: 12,
    textAlign: "center",
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  formCentered: {
    justifyContent: 'center',
    paddingTop: 0,
  },
  infoBannerText: {
    color: colors.light.primary,
    fontSize: 20,
    fontWeight: '500',
    marginBottom: 48,
    marginTop: 24,
    textAlign: 'center',
  },
  imageContainer: {
    justifyContent: "center",
    marginBottom: 10,
    marginRight: 5,
  },
  input: {
    borderColor: "#ddd",
    borderRadius: 5,
    borderWidth: 1,
    marginBottom: 12,
    padding: 12,
  },
  inputContainer: {
    flex: 1,
    justifyContent: "center",
  },
  logo: {
    height: 60,
    marginBottom: 10,
    width: 60,
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 40,
  },
  placeholderImage: {
    alignItems: "center",
    backgroundColor: "#e1e1e1",
    borderColor: "#ddd",
    borderRadius: 60,
    borderWidth: 1,
    height: 120,
    justifyContent: "center",
    width: 120,
  },
  placeholderText: {
    color: "#666",
    fontSize: 14,
  },
  profileImage: {
    borderRadius: 60,
    height: 120,
    width: 120,
  },
  profileSection: {
    alignItems: "center",
    flexDirection: "row",
    gap: 15,
    marginBottom: 20,
  },
  stepnOut: {
    color: colors.light.primary,
    fontFamily: "PingFangSC-Medium",
    fontSize: 24,
  },
  subtitle: {
    color: colors.light.lightText,
    fontSize: 14,
    marginTop: 8,
  },
});
