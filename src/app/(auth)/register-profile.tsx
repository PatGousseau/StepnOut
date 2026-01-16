import React, { useState } from "react";
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

export default function RegisterProfileScreen() {
  const { isSocialUser } = useLocalSearchParams<{
    isSocialUser?: string;
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

      // Complete profile setup
      const userId = await signUp({
        username,
        displayName,
        profileMediaId,
        instagram: instagram.replace(/@/g, ''),
        isSocialUser: isSocialSignUp,
      });

      // Show EULA then go to onboarding
      Alert.alert(t('End User License Agreement'), language === 'it' ? EULA_IT : EULA, [
        { text: t('Accept'), onPress: async () => {
          await supabase
            .from('profiles')
            .update({ eula_accepted: true })
            .eq('id', userId);
          router.replace('/(auth)/onboarding');
        }},
        {
          text: t('Decline'),
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/(auth)/login');
          }
        }
      ]);
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
      <Pressable style={styles.form} onPress={Keyboard.dismiss}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/images/logo.png")}
            style={styles.logo}
          />
          <Text style={styles.stepnOut}>{t("Stepn Out")}</Text>
          {isSocialSignUp && (
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
              onChangeText={(text) => setInstagram(text.replace(/@/g, ''))}
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
              ? t("Creating Account...") 
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
    justifyContent: "center",
    padding: 20,
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
