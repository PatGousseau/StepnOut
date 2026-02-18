import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  Animated,
  TouchableOpacity,
  Linking,
  PanResponder,
  Image,
} from 'react-native';
import { Text } from './StyledText';
import { colors } from '../constants/Colors';
import { useLanguage } from '../contexts/LanguageContext';
import { Ionicons } from '@expo/vector-icons';

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
            <View style={StyleSheet.absoluteFill}>
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
                      <TouchableOpacity 
                        style={[
                          styles.languageButton, 
                          language === 'en' && styles.activeLanguage
                        ]}
                        onPress={() => language === 'it' && toggleLanguage()}
                      >
                        <Text style={[
                          styles.languageText,
                          language === 'en' && styles.activeLanguageText
                        ]}>
                          ENG
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[
                          styles.languageButton, 
                          language === 'it' && styles.activeLanguage
                        ]}
                        onPress={() => language === 'en' && toggleLanguage()}
                      >
                        <Text style={[
                          styles.languageText,
                          language === 'it' && styles.activeLanguageText
                        ]}>
                          ITA
                        </Text>
                      </TouchableOpacity>
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
              <View style={styles.coffeeSection}>
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
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  activeLanguage: {
    backgroundColor: colors.light.primary,
  },
  activeLanguageText: {
    color: colors.light.background,
  },
  container: {
    bottom: 0,
    left: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    zIndex: 1000,
  },
  handle: {
    backgroundColor: 'transparent',
    bottom: 0,
    position: 'absolute',
    right: 0,
    top: 0,
    width: HANDLE_WIDTH,
  },
  languageButton: {
    backgroundColor: colors.light.background,
    borderColor: colors.light.primary,
    borderRadius: 16,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  languageText: {
    color: colors.light.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  languageToggle: {
    alignItems: 'center',
    flexDirection: 'row',
    flex: 1,
    gap: 8,
    justifyContent: 'flex-start',
  },
  menuItem: {
    padding: 16,
    width: '100%',
  },
  menuItemContent: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 12,
  },
  menuText: {
    color: colors.light.primary,
    flex: 1,
    fontSize: 16,
  },
  overlay: {
    flex: 1,
  },
  safeArea: {
    alignItems: 'center',
    flex: 1,
    paddingTop: Platform.OS === 'android' ? 16 : 0,
  },
  sidebar: {
    backgroundColor: 'transparent',
    bottom: 0,
    left: 0,
    position: 'absolute',
    top: 0,
    width: SIDEBAR_WIDTH + HANDLE_WIDTH,
  },
  sidebarContent: {
    backgroundColor: colors.light.background,
    borderBottomRightRadius: 16,
    borderTopRightRadius: 16,
    height: '100%',
    width: SIDEBAR_WIDTH,
  },
  coffeeSection: {
    paddingHorizontal: 16,
    position: 'absolute',
    bottom: 40,
    width: '100%',
    alignItems: 'flex-start',
    gap: 10,
  },
  coffeeText: {
    color: colors.light.primary,
    fontSize: 12,
    lineHeight: 16,
    opacity: 0.7,
  },
  coffeeButton: {
    height: 40,
    width: 150,
    borderRadius: 8,
  },
  title: {
    alignSelf: 'flex-start',
    color: colors.light.primary,
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 16,
    marginLeft: 16,
    marginTop: 16,
  },
});

export default MenuSidebar;