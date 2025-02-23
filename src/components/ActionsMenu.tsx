import React from "react";
import { Alert, ViewStyle, TextStyle } from "react-native";
import { Menu, MenuTrigger, MenuOptions, MenuOption } from "react-native-popup-menu";
import { Text } from "./StyledText";
import { colors } from "../constants/Colors";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { postService } from "../services/postService";

type ContentType = "post" | "comment";

interface MenuOptionItem {
  text: string;
  onSelect: () => void;
  isDestructive?: boolean;
}

interface MenuProps {
  children: React.ReactNode;
  type: ContentType;
  contentId: number;
  contentUserId: string;
  onDelete?: () => void;
}

export const ActionsMenu: React.FC<MenuProps> = ({
  children,
  type,
  contentId,
  contentUserId,
  onDelete,
}) => {
  const { t } = useLanguage();
  const { user } = useAuth();

  const handleDelete = () => {
    Alert.alert(t(`Delete ${type}`), t(`Are you sure you want to delete this ${type}?`), [
      {
        text: t("Cancel"),
        style: "cancel",
      },
      {
        text: t("Delete"),
        style: "destructive",
        onPress: async () => {
          const success =
            type === "post"
              ? await postService.deletePost(contentId)
              : await postService.deleteComment(contentId);

          if (success) {
            onDelete?.();
          }
        },
      },
    ]);
  };

  const handleReport = () => {
    if (!user?.id) return;

    Alert.alert(t(`Report ${type}`), t(`Are you sure you want to report this ${type}?`), [
      {
        text: t("Cancel"),
        style: "cancel",
      },
      {
        text: t("Report"),
        style: "destructive",
        onPress: async () => {
          const success =
            type === "post"
              ? await postService.reportPost(contentId, user.id, contentUserId)
              : await postService.reportComment(contentId, user.id, contentUserId);

          if (success) {
            Alert.alert(t("Report Submitted"), t("Thank you for your report."));
          }
        },
      },
    ]);
  };

  const handleBlock = () => {
    if (!user?.id) return;

    Alert.alert(t("Block user"), t("Are you sure you want to block this user?"), [
      {
        text: t("Cancel"),
        style: "cancel",
      },
      {
        text: t("Block"),
        style: "destructive",
        onPress: async () => {
          await postService.blockUser(user.id, contentUserId);
        },
      },
    ]);
  };

  const getActions = (): MenuOptionItem[] => {
    if (!user) return [];

    if (user.id === contentUserId) {
      return [
        {
          text: t(`Delete ${type}`),
          onSelect: handleDelete,
          isDestructive: true,
        },
      ];
    }

    return [
      {
        text: t(`Report ${type}`),
        onSelect: handleReport,
      },
      {
        text: t("Block user"),
        onSelect: handleBlock,
      },
    ];
  };

  return (
    <Menu style={menuContainer}>
      <MenuTrigger>{children}</MenuTrigger>
      <MenuOptions customStyles={optionsStyles}>
        {getActions().map((action, index) => (
          <MenuOption key={index} onSelect={action.onSelect}>
            <Text style={[menuOptionText, action.isDestructive && { color: "red" }]}>
              {action.text}
            </Text>
          </MenuOption>
        ))}
      </MenuOptions>
    </Menu>
  );
};

const menuContainer: ViewStyle = {
  padding: 8,
};
const menuOptionText: TextStyle = {
  fontSize: 14,
  padding: 10,
};

const optionsStyles = {
  optionsContainer: {
    borderRadius: 8,
    width: 200,
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
