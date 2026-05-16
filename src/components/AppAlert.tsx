import React, { useEffect, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
} from 'react-native';
import { colors } from '../constants/Colors';
import { useLanguage } from '../contexts/LanguageContext';

export type AppAlertButtonStyle = 'default' | 'cancel' | 'destructive';

export interface AppAlertButton {
  text: string;
  onPress?: () => void;
  style?: AppAlertButtonStyle;
}

interface AppAlertState {
  visible: boolean;
  title: string;
  message?: string;
  buttons?: AppAlertButton[];
}

type Listener = (state: AppAlertState) => void;

let currentState: AppAlertState = { visible: false, title: '' };
const listeners = new Set<Listener>();
const emit = () => {
  for (const l of listeners) l(currentState);
};

export const AppAlert = {
  show(title: string, message?: string, buttons?: AppAlertButton[]) {
    currentState = { visible: true, title, message, buttons };
    emit();
  },
  hide() {
    currentState = { ...currentState, visible: false };
    emit();
  },
};

export const AppAlertHost: React.FC = () => {
  const [state, setLocal] = useState<AppAlertState>(currentState);
  const fade = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(0.94)).current;
  const { t } = useLanguage();

  useEffect(() => {
    const l: Listener = (s) => setLocal(s);
    listeners.add(l);
    return () => {
      listeners.delete(l);
    };
  }, []);

  useEffect(() => {
    if (state.visible) {
      fade.setValue(0);
      scale.setValue(0.94);
      Animated.parallel([
        Animated.timing(fade, {
          toValue: 1,
          duration: 160,
          useNativeDriver: true,
          easing: Easing.out(Easing.quad),
        }),
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          friction: 8,
          tension: 90,
        }),
      ]).start();
    }
  }, [state.visible, fade, scale]);

  const buttons: AppAlertButton[] =
    state.buttons && state.buttons.length > 0
      ? state.buttons
      : [{ text: t('OK'), style: 'default' }];

  const handlePress = (btn: AppAlertButton) => {
    AppAlert.hide();
    if (btn.onPress) setTimeout(btn.onPress, 0);
  };

  const handleBackdrop = () => {
    const cancel = buttons.find((b) => b.style === 'cancel');
    if (cancel) handlePress(cancel);
  };

  const stacked = buttons.length > 2;

  return (
    <Modal
      visible={state.visible}
      transparent
      animationType="none"
      statusBarTranslucent
      onRequestClose={handleBackdrop}
    >
      <TouchableOpacity
        activeOpacity={1}
        style={styles.overlay}
        onPress={handleBackdrop}
      >
        <Animated.View
          style={[styles.card, { opacity: fade, transform: [{ scale }] }]}
          onStartShouldSetResponder={() => true}
          onTouchEnd={(e) => e.stopPropagation()}
        >
          <Text style={styles.title}>{state.title}</Text>
          {state.message ? (
            <Text style={styles.message}>{state.message}</Text>
          ) : null}
          <View
            style={[styles.buttonsRow, stacked && styles.buttonsStacked]}
          >
            {buttons.map((btn, i) => {
              const isDestructive = btn.style === 'destructive';
              const isCancel = btn.style === 'cancel';
              return (
                <TouchableOpacity
                  key={`${btn.text}-${i}`}
                  style={[
                    styles.button,
                    stacked && styles.buttonStacked,
                    isDestructive && styles.buttonDestructive,
                    isCancel && styles.buttonCancel,
                  ]}
                  onPress={() => handlePress(btn)}
                  activeOpacity={0.7}
                >
                  <Text
                    style={[
                      styles.buttonText,
                      isCancel && styles.buttonTextCancel,
                    ]}
                  >
                    {btn.text}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </Animated.View>
      </TouchableOpacity>
    </Modal>
  );
};

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    backgroundColor: colors.light.primary,
    borderRadius: 10,
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 12,
  },
  buttonCancel: {
    backgroundColor: colors.neutral.grey2,
  },
  buttonDestructive: {
    backgroundColor: colors.light.alertRed,
  },
  buttonStacked: {
    flex: 0,
  },
  buttonText: {
    color: colors.neutral.white,
    fontSize: 15,
    fontWeight: '600',
  },
  buttonTextCancel: {
    color: colors.light.text,
  },
  buttonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 20,
  },
  buttonsStacked: {
    flexDirection: 'column',
  },
  card: {
    backgroundColor: colors.light.background,
    borderRadius: 18,
    elevation: 12,
    maxWidth: 360,
    paddingBottom: 18,
    paddingHorizontal: 22,
    paddingTop: 22,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    width: '100%',
  },
  message: {
    color: colors.light.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
    textAlign: 'center',
  },
  overlay: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: colors.light.primary,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default AppAlert;
