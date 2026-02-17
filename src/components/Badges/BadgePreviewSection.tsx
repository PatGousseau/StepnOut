import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { BadgeService } from '../../services/badgeService';
import { Badge, UserBadge } from '../../types/badges';
import { UserProfile } from '../../models/User';
import { BadgeIcon } from './BadgeIcon';
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

    useEffect(() => {
        const fetchBadges = async () => {
            if (!userId) return;
            try {
                setLoading(true);
                // We need profile data for some badges (profile completed)
                // If not passed, we might need to fetch it, but usually it's passed in ProfilePage.
                // For now, assuming userProfile is passed or we fetch basic stats without it if missing (might miss 'Open Book').

                const stats = await BadgeService.getUserStats(userId);
                const profileToUse = userProfile || { id: userId } as any; // Fallback if profile not loaded yet

                const earned = BadgeService.calculateBadges(stats, profileToUse);
                setEarnedBadges(earned);

                const allWithStatus = BadgeService.getAllBadgesWithStatus(stats, earned);
                // Sort: Unlocked first, then by category/priority?
                // Actually for preview we might want to show latest earned?
                // Let's show top 4 unlocked, or if none, top 4 to earn.

                allWithStatus.sort((a, b) => {
                    if (a.unlocked && !b.unlocked) return -1;
                    if (!a.unlocked && b.unlocked) return 1;
                    return 0; // Keep original order otherwise
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

    if (loading) return null; // Or skeleton

    const previewBadges = allBadges.slice(0, 3); // Reduced from 4 to 3 to fit + button

    const handleSeeAll = () => {
        router.push({
            pathname: '/badges',
            params: { userId }
        });
    };

    return (
        <View style={styles.container}>
            <Text style={styles.sectionTitle}>{t('Badges') || 'LocalBadges'}</Text>

            <View style={styles.listContainer}>
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

                <TouchableOpacity style={styles.seeAllButton} onPress={handleSeeAll}>
                    <Ionicons name="add" size={24} color={colors.light.primary} />
                </TouchableOpacity>
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
        gap: 16,
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
