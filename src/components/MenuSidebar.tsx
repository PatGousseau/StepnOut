import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Platform,
  Animated,
  TouchableOpacity,
  Switch,
  Linking,
  PanResponder,
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

const SIDEBAR_WIDTH = Dimensions.get('window').width * 0.5;
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
      console.log('onStartShouldSetPanResponder', { isOpen, enableSwiping });
      return isOpen || enableSwiping;
    },
    onMoveShouldSetPanResponder: (_, gestureState) => {
      console.log('onMoveShouldSetPanResponder', { 
        isOpen, 
        enableSwiping, 
        dx: gestureState.dx 
      });
      
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
            </View>
          </View>
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    flex: 1,
  },
  sidebar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: SIDEBAR_WIDTH + HANDLE_WIDTH,
    backgroundColor: 'transparent',
  },
  sidebarContent: {
    width: SIDEBAR_WIDTH,
    height: '100%',
    backgroundColor: colors.light.background,
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
    flex: 1,
    justifyContent: 'flex-start',
  },
  languageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: colors.light.background,
    borderWidth: 1,
    borderColor: colors.light.primary,
  },
  activeLanguage: {
    backgroundColor: colors.light.primary,
  },
  languageText: {
    fontSize: 14,
    color: colors.light.primary,
    fontWeight: '500',
  },
  activeLanguageText: {
    color: colors.light.background,
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
  handle: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: HANDLE_WIDTH,
    backgroundColor: 'transparent',
  },
});

export default MenuSidebar;