import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Badge } from '../../types/badges';
import { colors } from '../../constants/Colors';

interface BadgeIconProps {
    badge: Badge;
    unlocked: boolean;
    size?: 'small' | 'medium' | 'large';
    onPress?: () => void;
    showLevelColor?: boolean;
}

export const BadgeIcon: React.FC<BadgeIconProps> = ({
    badge,
    unlocked,
    size = 'medium',
    onPress,
    showLevelColor = true
}) => {
    const getIconSize = () => {
        switch (size) {
            case 'small': return 24;
            case 'large': return 64;
            default: return 40;
        }
    };

    const getContainerSize = () => {
        switch (size) {
            case 'small': return 36;
            case 'large': return 100;
            default: return 60;
        }
    };

    const getBackgroundColor = () => {
        if (!unlocked) return '#f0f0f0';
        if (!showLevelColor) return colors.light.primary + '20'; // Light opacity primary

        switch (badge.level) {
            case 'bronze': return '#CD7F3220';
            case 'silver': return '#C0C0C020';
            case 'gold': return '#FFD70020';
            case 'platinum': return '#E5E4E220';
            default: return colors.light.primary + '20';
        }
    };

    const getIconColor = () => {
        if (!unlocked) return '#ccc';

        switch (badge.level) {
            case 'bronze': return '#CD7F32';
            case 'silver': return '#C0C0C0';
            case 'gold': return '#FFD700';
            case 'platinum': return '#E5E4E2';
            default: return colors.light.primary;
        }
    };

    const containerSize = getContainerSize();
    const iconSize = getIconSize();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress}
            style={[
                styles.container,
                {
                    width: containerSize,
                    height: containerSize,
                    borderRadius: containerSize / 2,
                    backgroundColor: getBackgroundColor(),
                    borderWidth: unlocked ? 1 : 0,
                    borderColor: getIconColor() + '40',
                }
            ]}
        >
            <Ionicons
                name={badge.icon as any}
                size={iconSize}
                color={getIconColor()}
            />
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});
