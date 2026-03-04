import React, { useEffect, useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { BadgeService } from '../../services/badgeService';
import { Badge } from '../../types/badges';
import { UserProfile } from '../../models/User';
import { BadgeIcon, SIZES } from './BadgeIcon';
import { BadgeModal } from './BadgeModal';
import { colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface BadgePreviewSectionProps {
    userId: string;
    userProfile?: UserProfile;
}

const CHEVRON_SLOT_WIDTH = 28;
const BADGE_GAP = 4;

export const BadgePreviewSection: React.FC<BadgePreviewSectionProps> = ({ userId, userProfile }) => {
    const router = useRouter();
    const [allBadges, setAllBadges] = useState<(Badge & { unlocked: boolean })[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBadge, setSelectedBadge] = useState<(Badge & { unlocked: boolean, earnedDate?: string, currentProgress?: number }) | null>(null);
    const [containerWidth, setContainerWidth] = useState(0);
    const [previewCount, setPreviewCount] = useState(3);

    useEffect(() => {
        const fetchBadges = async () => {
            if (!userId || !userProfile) return;
            try {
                setLoading(true);
                const stats = await BadgeService.getUserStats(userId);
                const earned = BadgeService.calculateBadges(stats, userProfile);

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

    const ITEM_SIZE = SIZES.small.total;

    useEffect(() => {
        if (containerWidth > 0) {
            const availableWidth = Math.max(
                0,
                containerWidth - CHEVRON_SLOT_WIDTH,
            );
            const n = Math.floor((availableWidth + BADGE_GAP) / (ITEM_SIZE + BADGE_GAP));
            setPreviewCount(Math.min(allBadges.length, Math.max(0, n)));
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
            <View style={styles.stripRow} onLayout={(e) => setContainerWidth(e.nativeEvent.layout.width)}>
                <View style={styles.listContainer}>
                    {previewBadges.map(badge => (
                        <View key={badge.id} style={styles.badgeWrapper}>
                            <BadgeIcon
                                badge={badge}
                                unlocked={badge.unlocked}
                                size="small"
                                onPress={() => setSelectedBadge(badge)}
                            />
                        </View>
                    ))}
                </View>

                <TouchableOpacity style={styles.chevronButton} onPress={handleSeeAll}>
                    <Ionicons name="chevron-forward" size={18} color={colors.light.primary} />
                </TouchableOpacity>
            </View>

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
        marginTop: 4,
        marginBottom: 4,
        paddingVertical: 10,
    },
    stripRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingLeft: 0,
        paddingRight: 0,
    },
    listContainer: {
        alignItems: 'center',
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'flex-start',
        gap: BADGE_GAP,
    },
    badgeWrapper: {
        alignItems: 'center',
    },
    chevronButton: {
        alignItems: 'center',
        height: 28,
        flexDirection: 'row',
        justifyContent: 'center',
        marginLeft: 0,
        width: CHEVRON_SLOT_WIDTH,
    },
});
