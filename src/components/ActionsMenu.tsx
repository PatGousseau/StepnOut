import React from "react";
import { Alert, ViewStyle, TextStyle, View } from "react-native";
import { Menu, MenuTrigger, MenuOptions, MenuOption } from "react-native-popup-menu";
import { Text } from "./StyledText";
import { colors } from "../constants/Colors";
import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { postService } from "../services/postService";
import { MaterialIcons } from "@expo/vector-icons";

type ContentType = "post" | "comment";

interface MenuOptionItem {
  text: string;
  onSelect: () => void;
  isDestructive?: boolean;
  icon: keyof typeof MaterialIcons.glyphMap;
}

interface MenuProps {
  children: React.ReactNode;
  type: ContentType;
  contentId: number;
  contentUserId: string;
  onDelete?: () => void;
  menuOffset?: number;
}

interface ProfileActionsProps {
  children: React.ReactNode;
  onEdit: () => void;
  onSignOut: () => void;
  onDeleteAccount: () => void;
}

export const ActionsMenu: React.FC<MenuProps> = ({
  children,
  type,
  contentId,
  contentUserId,
  onDelete,
  menuOffset = 20,
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
          icon: "delete",
        },
      ];
    }

    return [
      {
        text: t(`Report ${type}`),
        onSelect: handleReport,
        icon: "report",
      },
      {
        text: t("Block user"),
        onSelect: handleBlock,
        icon: "block",
      },
    ];
  };

  return (
    <Menu style={menuContainer}>
      <MenuTrigger>{children}</MenuTrigger>
      <MenuOptions
        customStyles={{
          ...optionsStyles,
          optionsContainer: {
            ...optionsStyles.optionsContainer,
            marginTop: menuOffset,
          },
        }}
      >
        {getActions().map((action, index) => (
          <React.Fragment key={index}>
            <MenuOption onSelect={action.onSelect}>
              <View style={menuOptionContainer}>
                <MaterialIcons
                  name={action.icon}
                  size={20}
                  color={action.isDestructive ? "red" : colors.light.primary}
                />
                <Text style={[menuOptionText, action.isDestructive && { color: "red" }]}>
                  {action.text}
                </Text>
              </View>
            </MenuOption>
            {index < getActions().length - 1 && <View style={divider} />}
          </React.Fragment>
        ))}
      </MenuOptions>
    </Menu>
  );
};

export const ProfileActions: React.FC<ProfileActionsProps> = ({
  children,
  onEdit,
  onSignOut,
  onDeleteAccount,
}) => {
  const { t } = useLanguage();

  const actions: MenuOptionItem[] = [
    {
      text: t("Edit profile"),
      onSelect: onEdit,
      icon: "edit",
    },
    {
      text: t("Sign out"),
      onSelect: onSignOut,
      icon: "logout",
    },
    {
      text: t("Delete account"),
      onSelect: onDeleteAccount,
      isDestructive: true,
      icon: "delete-forever",
    },
  ];

  return (
    <Menu style={menuContainer}>
      <MenuTrigger>{children}</MenuTrigger>
      <MenuOptions customStyles={optionsStyles}>
        {actions.map((action, index) => (
          <React.Fragment key={index}>
            <MenuOption onSelect={action.onSelect}>
              <View style={menuOptionContainer}>
                <MaterialIcons
                  name={action.icon}
                  size={20}
                  color={action.isDestructive ? "red" : colors.light.primary}
                />
                <Text style={[menuOptionText, action.isDestructive && { color: "red" }]}>
                  {action.text}
                </Text>
              </View>
            </MenuOption>
            {index < actions.length - 1 && <View style={divider} />}
          </React.Fragment>
        ))}
      </MenuOptions>
    </Menu>
  );
};

const menuContainer: ViewStyle = {
  paddingHorizontal: 8,
  paddingVertical: 2,
};

const menuOptionContainer: ViewStyle = {
  flexDirection: "row",
  alignItems: "center",
  padding: 4,
};

const menuOptionText: TextStyle = {
  fontSize: 14,
  marginLeft: 10,
  color: colors.light.primary,
};

const optionsStyles = {
  optionsContainer: {
    borderRadius: 8,
    width: 200,
    backgroundColor: colors.neutral.grey2,
    shadowColor: "transparent",
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
    padding: 4,
  },
};

const divider: ViewStyle = {
  height: 1,
  backgroundColor: colors.neutral.grey3,
  opacity: 0.2,
  marginHorizontal: 10,
};
