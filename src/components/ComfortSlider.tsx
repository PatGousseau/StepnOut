import React, { useRef, useMemo, useCallback } from "react";
import {
  View,
  Animated,
  PanResponder,
  StyleSheet,
  LayoutChangeEvent,
} from "react-native";

interface ComfortSliderProps {
  value: number;
  onValueChange: (value: number) => void;
  minimumValue?: number;
  maximumValue?: number;
  minimumTrackTintColor?: string;
  maximumTrackTintColor?: string;
  thumbTintColor?: string;
  thumbSize?: number;
}

const TRACK_HEIGHT = 4;

export const ComfortSlider: React.FC<ComfortSliderProps> = ({
  value,
  onValueChange,
  minimumValue = 1,
  maximumValue = 10,
  minimumTrackTintColor = "#007AFF",
  maximumTrackTintColor = "#E0E0E0",
  thumbTintColor = "#007AFF",
  thumbSize = 20,
}) => {
  const trackWidth = useRef(0);
  const animatedPosition = useRef(new Animated.Value(0)).current;
  const latestValue = useRef(value);
  const startPosition = useRef(0);
  const range = maximumValue - minimumValue;
  const steps = range; // one tick per integer value
  const ticks = Array.from({ length: steps + 1 }, (_, i) => i);

  const getPosition = useCallback(
    (val: number) => {
      if (trackWidth.current === 0) return 0;
      return ((val - minimumValue) / range) * trackWidth.current;
    },
    [minimumValue, range]
  );

  const getValue = useCallback(
    (position: number) => {
      if (trackWidth.current === 0) return minimumValue;
      const raw = (position / trackWidth.current) * range + minimumValue;
      return Math.round(Math.min(maximumValue, Math.max(minimumValue, raw)));
    },
    [minimumValue, maximumValue, range]
  );

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (evt) => {
          const touchX = evt.nativeEvent.locationX;
          const clampedX = Math.max(
            0,
            Math.min(trackWidth.current, touchX)
          );
          startPosition.current = clampedX;
          animatedPosition.setValue(clampedX);
          const newValue = getValue(clampedX);
          latestValue.current = newValue;
          onValueChange(newValue);
        },
        onPanResponderMove: (_evt, gestureState) => {
          const newPos = Math.max(
            0,
            Math.min(trackWidth.current, startPosition.current + gestureState.dx)
          );
          animatedPosition.setValue(newPos);
          const newValue = getValue(newPos);
          if (newValue !== latestValue.current) {
            latestValue.current = newValue;
            onValueChange(newValue);
          }
        },
        onPanResponderRelease: () => {
          const snappedPos = getPosition(latestValue.current);
          Animated.spring(animatedPosition, {
            toValue: snappedPos,
            useNativeDriver: false,
            bounciness: 0,
            speed: 20,
          }).start();
        },
      }),
    [getValue, getPosition, onValueChange, animatedPosition]
  );

  const onLayout = useCallback(
    (e: LayoutChangeEvent) => {
      trackWidth.current = e.nativeEvent.layout.width;
      animatedPosition.setValue(getPosition(latestValue.current));
    },
    [getPosition, animatedPosition]
  );

  return (
    <View
      style={[styles.container, { height: thumbSize + 16 }]}
      onLayout={onLayout}
      {...panResponder.panHandlers}
    >
      <View
        style={[
          styles.track,
          { backgroundColor: maximumTrackTintColor, height: TRACK_HEIGHT },
        ]}
        pointerEvents="none"
      />
      {/* Tick marks */}
      <View style={styles.tickContainer} pointerEvents="none">
        {ticks.map((i) => (
          <View
            key={i}
            style={[
              styles.tick,
              {
                backgroundColor:
                  i + minimumValue < value
                    ? minimumTrackTintColor
                    : maximumTrackTintColor,
              },
            ]}
          />
        ))}
      </View>
      <Animated.View
        style={[
          styles.filledTrack,
          {
            backgroundColor: minimumTrackTintColor,
            height: TRACK_HEIGHT,
            width: animatedPosition,
          },
        ]}
        pointerEvents="none"
      />
      <Animated.View
        style={[
          styles.thumb,
          {
            backgroundColor: thumbTintColor,
            width: thumbSize,
            height: thumbSize,
            borderRadius: thumbSize / 2,
            marginLeft: -thumbSize / 2,
            transform: [{ translateX: animatedPosition }],
          },
        ]}
        pointerEvents="none"
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: "center",
    width: "100%",
  },
  filledTrack: {
    borderRadius: 2,
    left: 0,
    position: "absolute",
  },
  tick: {
    borderRadius: 1,
    height: 8,
    width: 2,
  },
  tickContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    left: 0,
    position: "absolute",
    right: 0,
  },
  thumb: {
    elevation: 3,
    position: "absolute",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
  },
  track: {
    borderRadius: 2,
    position: "absolute",
    width: "100%",
  },
});
