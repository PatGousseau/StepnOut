import React from "react";
import { StyleSheet } from "react-native";
import { Menu, MenuTrigger, MenuOptions, MenuOption } from "react-native-popup-menu";
import { Text } from "./StyledText";
import { colors } from "../constants/Colors";

interface MenuProps {
  children: React.ReactNode;
  options: {
    text: string;
    onSelect: () => void;
    isDestructive?: boolean;
  }[];
}

export const OptionsMenu: React.FC<MenuProps> = ({ children, options }) => {
  return (
    <Menu style={menuContainer}>
      <MenuTrigger>{children}</MenuTrigger>
      <MenuOptions customStyles={optionsStyles}>
        {options.map((option, index) => (
          <MenuOption key={index} onSelect={option.onSelect}>
            <Text style={[menuOptionText, option.isDestructive && { color: "red" }]}>
              {option.text}
            </Text>
          </MenuOption>
        ))}
      </MenuOptions>
    </Menu>
  );
};

const menuContainer = {
  padding: 8,
};

const menuOptionText = {
  fontSize: 14,
  padding: 10,
};

const optionsStyles = {
  optionsContainer: {
    borderRadius: 8,
    width: 150,
    backgroundColor: colors.neutral.grey2,
    marginTop: 45,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    zIndex: 9999,
  },
};
