import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, View } from "react-native";
import { colors } from "../../constants/Colors";
import { Text } from "../StyledText";

type IntakeReadbackProps = {
  lines: string[];
};

const LINE_STAGGER_MS = 550;

/**
 * The emotional payoff of the intake, so it gets the whole screen and lands one
 * line at a time rather than appearing as a block of summary text.
 */
export const IntakeReadback: React.FC<IntakeReadbackProps> = ({ lines }) => {
  const opacities = useRef(lines.map(() => new Animated.Value(0))).current;
  const offsets = useRef(lines.map(() => new Animated.Value(12))).current;

  useEffect(() => {
    const animations = lines.map((_, index) =>
      Animated.parallel([
        Animated.timing(opacities[index], {
          toValue: 1,
          duration: 500,
          delay: index * LINE_STAGGER_MS,
          useNativeDriver: true,
        }),
        Animated.timing(offsets[index], {
          toValue: 0,
          duration: 500,
          delay: index * LINE_STAGGER_MS,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.stagger(0, animations).start();
  }, [lines, opacities, offsets]);

  return (
    <View style={styles.container}>
      {lines.map((line, index) => (
        <Animated.View
          key={`${index}-${line}`}
          style={{
            opacity: opacities[index],
            transform: [{ translateY: offsets[index] }],
          }}
        >
          <Text style={styles.line}>{line}</Text>
        </Animated.View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    gap: 28,
    justifyContent: "center",
    paddingVertical: 24,
  },
  line: {
    color: colors.light.text,
    fontSize: 24,
    fontWeight: "600",
    lineHeight: 34,
  },
});
