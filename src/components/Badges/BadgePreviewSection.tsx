import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BadgeService } from '../../services/badgeService';
import { Badge, UserBadge } from '../../types/badges';
import { UserProfile } from '../../models/User';
import { BadgeIcon, SIZES } from './BadgeIcon';
import { BadgeModal } from './BadgeModal';
import { colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';
import { Text } from '../StyledText';

interface BadgePreviewSectionProps {
    userId: string;
    userProfile?: UserProfile;
}

export const BadgePreviewSection: React.FC<BadgePreviewSectionProps> = ({ userId, userProfile }) => {
    const router = useRouter();
    const { t } = useLanguage();
    const [earnedBadges, setEarnedBadges] = useState<UserBadge[]>([]);
    const [allBadges, setAllBadges] = useState<(Badge & { unlocked: boolean })[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBadge, setSelectedBadge] = useState<(Badge & { unlocked: boolean, earnedDate?: string, currentProgress?: number }) | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [previewCount, setPreviewCount] = useState(3);
    const [dynamicGap, setDynamicGap] = useState(16);

    useEffect(() => {
        const fetchBadges = async () => {
            if (!userId || !userProfile) return;
            try {
                setLoading(true);
                const stats = await BadgeService.getUserStats(userId);
                const earned = BadgeService.calculateBadges(stats, userProfile);
                setEarnedBadges(earned);

                const allWithStatus = BadgeService.getAllBadgesWithStatus(stats, earned);
                allWithStatus.sort((a, b) => {
                    if (a.unlocked && !b.unlocked) return -1;
                    if (!a.unlocked && b.unlocked) return 1;
                    return 0;
                });

                setAllBadges(allWithStatus);
            } catch (error) {
                console.error("Error loading badges:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchBadges();
    }, [userId, userProfile]);

    const G_MIN = 10;
    const ITEM_SIZE = SIZES.medium.total;

    useEffect(() => {
        if (containerWidth > 0) {
            const n = Math.floor((containerWidth + G_MIN) / (ITEM_SIZE + G_MIN));
            const currentPreviewCount = Math.min(allBadges.length, Math.max(0, n));
            const totalItemsForGap = currentPreviewCount;

            setPreviewCount(currentPreviewCount);

            if (totalItemsForGap > 1) {
                const gap = (containerWidth - (totalItemsForGap * ITEM_SIZE)) / (totalItemsForGap - 1);
                setDynamicGap(gap);
            } else {
                setDynamicGap(0);
            }
        }
    }, [containerWidth, allBadges.length]);

    if (loading) return null;

    const previewBadges = allBadges.slice(0, previewCount);

    const handleSeeAll = () => {
        router.push({
            pathname: '/badges',
            params: { userId }
        });
    };

    return (
        <View style={styles.container}>
            <View style={styles.headerRow}>
                <Text style={styles.sectionTitle}>{t('Badges') || 'LocalBadges'}</Text>
                <Text style={styles.badgeCount}>{earnedBadges.length}</Text>
            </View>

            <View
                style={[styles.listContainer, { gap: dynamicGap }]}
                onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}
            >
                {previewBadges.map(badge => (
                    <View key={badge.id} style={styles.badgeWrapper}>
                        <BadgeIcon
                            badge={badge}
                            unlocked={badge.unlocked}
                            size="medium"
                            onPress={() => setSelectedBadge(badge)}
                        />
                    </View>
                ))}
            </View>

            <TouchableOpacity style={styles.viewAllRow} onPress={handleSeeAll}>
                <Text style={styles.viewAllText}>{t('All badges')}</Text>
                <Ionicons name="chevron-forward" size={18} color={colors.light.primary} />
            </TouchableOpacity>

            <BadgeModal
                visible={!!selectedBadge}
                onClose={() => setSelectedBadge(null)}
                badge={selectedBadge}
                unlocked={selectedBadge?.unlocked || false}
                currentProgress={selectedBadge?.currentProgress}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        marginVertical: 16,
        padding: 16,
    },
    sectionTitle: {
        color: '#0D1B1E',
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 12,
    },
    badgeCount: {
        color: '#0D1B1E',
        fontSize: 20,
        fontWeight: '400',
    },
    listContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    badgeWrapper: {
        alignItems: 'center',
    },
    viewAllRow: {
        alignItems: 'center',
        borderTopColor: '#E8EDF2',
        borderTopWidth: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 16,
        paddingTop: 14,
        width: '100%',
    },
    viewAllText: {
        color: colors.light.primary,
        fontSize: 14,
        fontWeight: '600',
    },
});
