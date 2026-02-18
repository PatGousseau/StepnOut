import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  Animated,
  TouchableOpacity,
  Pressable,
  Linking,
  PanResponder,
  Image,
  Share,
} from 'react-native';
import { Text } from './StyledText';
import { colors } from '../constants/Colors';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';
import { appConfigService } from '../services/appConfigService';

interface MenuSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  enableSwiping?: boolean; // Add new prop
}

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.65;
const HANDLE_WIDTH = 10;

const MenuSidebar: React.FC<MenuSidebarProps> = ({
  isOpen: propIsOpen, 
  onClose,
  enableSwiping = true
}) => {
  const { t, language, toggleLanguage } = useLanguage();
  const translateX = useRef(new Animated.Value(-SIDEBAR_WIDTH)).current;
  const [isOpen, setIsOpen] = useState(propIsOpen);

  React.useEffect(() => {
    setIsOpen(propIsOpen);
    Animated.spring(translateX, {
      toValue: propIsOpen ? 0 : -SIDEBAR_WIDTH,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  }, [propIsOpen]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => {
      return isOpen || enableSwiping;
    },
    onMoveShouldSetPanResponder: (_, gestureState) => {
      
      if (!isOpen) {
        return enableSwiping && Math.abs(gestureState.dx) > 5;
      }
      return Math.abs(gestureState.dx) > 5;
    },
    onPanResponderMove: (_, gestureState) => {
      
      // calculate new position
      const newX = isOpen 
        ? Math.min(0, Math.max(-SIDEBAR_WIDTH, gestureState.dx))
        : Math.min(0, Math.max(-SIDEBAR_WIDTH, -SIDEBAR_WIDTH + gestureState.dx));
      translateX.setValue(newX);
    },
    onPanResponderRelease: (_, gestureState) => {
      const velocity = gestureState.vx;
      const shouldClose = isOpen 
        ? (gestureState.dx < -SIDEBAR_WIDTH / 2 || velocity < -0.5)
        : (gestureState.dx < SIDEBAR_WIDTH / 2 && velocity <= 0);
      
      if (shouldClose) {
        setIsOpen(false);
        onClose();
        Animated.spring(translateX, {
          toValue: -SIDEBAR_WIDTH,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }).start();
      } else {
        Animated.spring(translateX, {
          toValue: 0,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }).start(() => {
          setIsOpen(true);
        });
      }
    },
  });

  const handlePrivacyPress = async () => {
    try {
      await Linking.openURL('https://stepnout.framer.website/privacy-policy');
    } catch (error) {
      console.error('Failed to open privacy policy:', error);
    }
  };

  const handleFeedbackPress = async () => {
    try {
      await Linking.openURL('mailto:pcgousseau@gmail.com');
    } catch (error) {
      console.error('Failed to open email client:', error);
    }
  };

  const handleSharePress = async () => {
    try {
      const shareLink = await appConfigService.getShareLink();
      await Share.share({ message: shareLink });
    } catch (error) {
      console.error('Failed to share:', error);
    }
  };

  const handleInstagramPress = async () => {
    try {
      await Linking.openURL('https://www.instagram.com/stepnoutofficial/');
    } catch (error) {
      console.error('Failed to open Instagram:', error);
    }
  };

  const handleCoffeePress = async () => {
    try {
      await Linking.openURL('https://www.buymeacoffee.com/stepnout');
    } catch (error) {
      console.error('Failed to open Buy Me a Coffee:', error);
    }
  };

  const backgroundOpacity = translateX.interpolate({
    inputRange: [-SIDEBAR_WIDTH, 0],
    outputRange: [0, 0.5],
    extrapolate: 'clamp',
  });

  const handleOverlayPress = () => {
    setIsOpen(false);
    onClose();
    Animated.spring(translateX, {
      toValue: -SIDEBAR_WIDTH,
      useNativeDriver: true,
      tension: 65,
      friction: 11,
    }).start();
  };

  return (
    <View
      style={[styles.container, { pointerEvents: isOpen ? 'auto' : 'box-none' }]}
    >
      <Animated.View
        style={[
          StyleSheet.absoluteFill,
          {
            backgroundColor: 'black',
            opacity: backgroundOpacity,
          }
        ]}
        pointerEvents={isOpen ? 'auto' : 'none'}
        onTouchEnd={handleOverlayPress}
      />
      <View style={styles.overlay}>
        <Animated.View
          {...panResponder.panHandlers}
          style={[
            styles.sidebar,
            { transform: [{ translateX }] },
          ]}
        >
          <View style={styles.handle} />
          <View style={styles.sidebarContent}>
            <SafeAreaView style={styles.safeArea}>
              <View style={styles.header}>
                <Text style={styles.title}>{t('Menu')}</Text>
                <Text style={styles.languageLabel}>{t('Language')}</Text>
                <View style={styles.segmentedControl}>
                  <Pressable
                    style={[
                      styles.segment,
                      language === 'it' && styles.activeSegment
                    ]}
                    onPress={() => language === 'en' && toggleLanguage()}
                  >
                    <Text style={[
                      styles.segmentText,
                      language === 'it' && styles.activeSegmentText
                    ]}>
                      IT
                    </Text>
                  </Pressable>
                  <Pressable
                    style={[
                      styles.segment,
                      language === 'en' && styles.activeSegment
                    ]}
                    onPress={() => language === 'it' && toggleLanguage()}
                  >
                    <Text style={[
                      styles.segmentText,
                      language === 'en' && styles.activeSegmentText
                    ]}>
                      EN
                    </Text>
                  </Pressable>
                </View>

                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleFeedbackPress}
                >
                  <Ionicons
                    name="mail-outline"
                    size={20}
                    color={colors.light.primary}
                  />
                  <Text style={styles.menuText}>{t('Contact Us')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleSharePress}
                >
                  <Ionicons
                    name="share-outline"
                    size={20}
                    color={colors.light.primary}
                  />
                  <Text style={styles.menuText}>{t('Share with friends')}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handleInstagramPress}
                >
                  <Ionicons
                    name="logo-instagram"
                    size={20}
                    color={colors.light.primary}
                  />
                  <Text style={styles.menuText}>{t('Follow us on Instagram')}</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.bottomSection}>
                <View style={styles.divider} />

                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={handlePrivacyPress}
                >
                  <Ionicons
                    name="lock-closed-outline"
                    size={20}
                    color={colors.light.primary}
                  />
                  <Text style={styles.menuText}>{t('Privacy Policy')}</Text>
                </TouchableOpacity>

                <View style={styles.divider} />

                <Text style={styles.coffeeText}>
                  {t('StepnOut is built by independent developers with no ads or monetization. Your support helps us keep the app running!')}
                </Text>
                <TouchableOpacity onPress={handleCoffeePress}>
                  <Image
                    source={{ uri: 'https://cdn.buymeacoffee.com/buttons/v2/default-blue.png' }}
                    style={styles.coffeeButton}
                  />
                </TouchableOpacity>
              </View>
            </SafeAreaView>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
  },
  sidebar: {
    backgroundColor: 'transparent',
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: SIDEBAR_WIDTH + HANDLE_WIDTH,
  },
  handle: {
    backgroundColor: 'transparent',
    bottom: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: HANDLE_WIDTH,
  },
  sidebarContent: {
    backgroundColor: colors.light.background,
    borderBottomRightRadius: 20,
    borderTopRightRadius: 20,
    height: '100%',
    width: SIDEBAR_WIDTH,
  },
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
    justifyContent: 'space-between',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 8,
  },
  title: {
    color: colors.light.primary,
    fontSize: 22,
    fontWeight: 'bold',
  },
  bottomSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    gap: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 5,
    paddingHorizontal: 4,
  },
  menuText: {
    color: colors.light.text,
    fontSize: 13,
  },
  divider: {
    height: 1,
    backgroundColor: colors.light.secondary,
    marginVertical: 18,
  },
  languageLabel: {
    color: colors.light.primary,
    fontSize: 13,
    fontWeight: '600',
    marginTop: 16,
    marginBottom: 8,
  },
  segmentedControl: {
    flexDirection: 'row',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: colors.light.primary,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    width: '50%',
  },
  segment: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 7,
  },
  activeSegment: {
    backgroundColor: colors.light.primary,
  },
  segmentText: {
    color: colors.light.primary,
    fontSize: 13,
    fontWeight: '600',
  },
  activeSegmentText: {
    color: colors.neutral.white,
  },
  coffeeText: {
    color: colors.light.lightText,
    fontSize: 12,
    lineHeight: 17,
  },
  coffeeButton: {
    height: 40,
    width: 150,
    borderRadius: 8,
    marginTop: 8,
  },
});

export default MenuSidebar;