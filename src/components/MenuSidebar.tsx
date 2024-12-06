import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Modal,
  StyleSheet,
  TouchableWithoutFeedback,
  Dimensions,
  SafeAreaView,
  Platform,
  Animated,
  TouchableOpacity,
  Switch,
} from 'react-native';
import { Text } from './StyledText';
import { colors } from '../constants/Colors';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

interface MenuSidebarProps {
  visible: boolean;
  onClose: () => void;
}

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.5;

const MenuSidebar: React.FC<MenuSidebarProps> = ({ visible, onClose }) => {
  const { t, language, toggleLanguage } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      setModalVisible(true);
      translateX.setValue(-SIDEBAR_WIDTH);
      opacity.setValue(0);
      Animated.parallel([
        Animated.timing(translateX, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(translateX, {
        toValue: -SIDEBAR_WIDTH,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setModalVisible(false);
      onClose();
    });
  };

  const handlePrivacyPress = () => {
    handleClose();
    router.push('/privacy-policy');
  };

  const handleFeedbackPress = () => {
    handleClose();
    router.push('/feedback');
  };

  return (
    <Modal
      visible={modalVisible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <TouchableWithoutFeedback onPress={handleClose}>
        <Animated.View style={[styles.overlay, { opacity }]}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <Animated.View 
              style={[styles.sidebar, { transform: [{ translateX }] }]}
            >
              <SafeAreaView style={styles.safeArea}>
                <Text style={styles.title}>{t('Menu')}</Text>
                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={toggleLanguage}
                >
                  <View style={styles.menuItemContent}>
                    <Ionicons 
                      name="globe-outline" 
                      size={24} 
                      color={colors.light.primary} 
                    />
                    <View style={styles.languageToggle}>
                      <Text style={styles.languageText} numberOfLines={1}>
                        <Text >
                          {language === 'it' ? 'Ita' : 'Eng'}
                        </Text>
                      </Text>
                      <Switch
                        value={language === 'it'}
                        onValueChange={toggleLanguage}
                        trackColor={{ false: colors.light.primary, true: colors.light.primary }}
                        thumbColor={colors.light.background}
                      />
                    </View>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handlePrivacyPress}
                >
                  <View style={styles.menuItemContent}>
                    <Ionicons 
                      name="lock-closed-outline" 
                      size={24} 
                      color={colors.light.primary} 
                    />
                    <Text style={styles.menuText}>{t('Privacy Policy')}</Text>
                  </View>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={styles.menuItem}
                  onPress={handleFeedbackPress}
                >
                  <View style={styles.menuItemContent}>
                    <Ionicons 
                      name="mail-outline" 
                      size={24} 
                      color={colors.light.primary} 
                    />
                    <Text style={styles.menuText}>{t('Contact Us')}</Text>
                  </View>
                </TouchableOpacity>
              </SafeAreaView>
            </Animated.View>
          </TouchableWithoutFeedback>
        </Animated.View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH,
    backgroundColor: colors.light.background,
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 5,
    borderTopRightRadius: 16,
    borderBottomRightRadius: 16,
  },
  safeArea: {
    flex: 1,
    alignItems: 'center',
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  menuItem: {
    padding: 16,
    width: '100%',
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  menuText: {
    fontSize: 16,
    color: colors.light.primary,
    flex: 1,
  },
  languageToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  languageText: {
    width: 40,
    fontSize: 16,
    color: colors.light.primary,
    textAlign: 'left',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.light.primary,
    alignSelf: 'flex-start',
    marginLeft: 16,
    marginBottom: 16,
    marginTop: 16,
  },
});

export default MenuSidebar;