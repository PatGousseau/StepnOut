import React, { useState, useRef } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Modal, TouchableWithoutFeedback } from "react-native";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import { colors } from "../constants/Colors";
import { FeedSort } from "../types";

type Props = {
  value: FeedSort;
  onChange: (next: FeedSort) => void;
  recentLabel: string;
  popularLabel: string;
};

export const FeedSortToggle = ({ value, onChange, recentLabel, popularLabel }: Props) => {
  const [open, setOpen] = useState(false);
  const [anchorY, setAnchorY] = useState(0);
  const [anchorX, setAnchorX] = useState(0);
  const triggerRef = useRef<View>(null);

  const label = value === "recent" ? recentLabel : popularLabel;
  const options: { value: FeedSort; label: string }[] = [
    { value: "recent", label: recentLabel },
    { value: "popular", label: popularLabel },
  ];

  const handleOpen = () => {
    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchorX(x);
      setAnchorY(y + height + 4);
      setOpen(true);
    });
  };

  const handleSelect = (sort: FeedSort) => {
    setOpen(false);
    if (sort !== value) onChange(sort);
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity ref={triggerRef} style={styles.trigger} onPress={handleOpen} activeOpacity={0.7}>
        <Text style={styles.triggerText}>{label}</Text>
        <MaterialIcons
          name={open ? "keyboard-arrow-up" : "keyboard-arrow-down"}
          size={18}
          color={colors.light.primary}
        />
      </TouchableOpacity>

      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <TouchableWithoutFeedback onPress={() => setOpen(false)}>
          <View style={styles.overlay}>
            <View style={[styles.dropdown, { top: anchorY, left: anchorX }]}>
              {options.map((opt) => (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.option, opt.value === value && styles.optionActive]}
                  onPress={() => handleSelect(opt.value)}
                >
                  <Text style={[styles.optionText, opt.value === value && styles.optionTextActive]}>
                    {opt.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignSelf: "flex-start",
    marginBottom: 12,
  },
  trigger: {
    flexDirection: "row",
    alignItems: "center",
    gap: 2,
  },
  triggerText: {
    fontSize: 13,
    fontWeight: "500",
    color: colors.light.primary,
  },
  overlay: {
    flex: 1,
  },
  dropdown: {
    position: "absolute",
    backgroundColor: colors.light.background,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.neutral.grey1 + "60",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    minWidth: 120,
  },
  option: {
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  optionActive: {
    backgroundColor: colors.light.primary + "14",
  },
  optionText: {
    fontSize: 14,
    color: colors.light.lightText,
  },
  optionTextActive: {
    color: colors.light.primary,
    fontWeight: "600",
  },
});

export default FeedSortToggle;
