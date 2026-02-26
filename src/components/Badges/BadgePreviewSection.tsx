import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { BadgeService } from '../../services/badgeService';
import { Badge, UserBadge } from '../../types/badges';
import { UserProfile } from '../../models/User';
import { BadgeIcon, SIZES } from './BadgeIcon';
import { BadgeModal } from './BadgeModal';
import { colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../../contexts/LanguageContext';

interface BadgePreviewSectionProps {
    userId: string;
    userProfile?: UserProfile | null; // Optional, can be fetched if needed, but better passed
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
            if (!userId) return;
            try {
                setLoading(true);
                const stats = await BadgeService.getUserStats(userId);
                const profileToUse = userProfile || { id: userId } as any;

                const earned = BadgeService.calculateBadges(stats, profileToUse);
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

            let currentPreviewCount = 0;
            let totalItemsForGap = 0;

            if (allBadges.length > n) {
                // More badges than capacity, show n-1 badges + plus button
                currentPreviewCount = Math.max(0, n - 1);
                totalItemsForGap = currentPreviewCount + 1;
            } else {
                // All badges fit
                currentPreviewCount = allBadges.length;
                totalItemsForGap = currentPreviewCount;
            }

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
    const hasMore = allBadges.length > previewCount;

    const handleSeeAll = () => {
        router.push({
            pathname: '/badges',
            params: { userId }
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{t('Badges') || 'LocalBadges'}</Text>

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

                {hasMore && (
                    <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAll}>
                        <Ionicons name="add" size={24} color={colors.light.primary} />
                    </TouchableOpacity>
                )}
            </View>

            <BadgeModal
                visible={!!selectedBadge}
                onClose={() => setSelectedBadge(null)}
                badge={selectedBadge}
                unlocked={selectedBadge?.unlocked || false}
                earnedDate={selectedBadge?.earnedDate}
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
        marginBottom: 12,
    },
    listContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    badgeWrapper: {
        alignItems: 'center',
    },
    seeAllButton: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: '#F0F0F0',
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E0E0E0',
        borderStyle: 'dashed',
    }
});
