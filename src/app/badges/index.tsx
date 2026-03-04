import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, Stack } from 'expo-router';
import { BadgeService } from '../../services/badgeService';
import { Badge } from '../../types/badges';
import { BadgeIcon } from '../../components/Badges/BadgeIcon';
import { BadgeModal } from '../../components/Badges/BadgeModal';
import { colors } from '../../constants/Colors';
import { Loader } from '../../components/Loader';
import { profileService } from '../../services/profileService';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserProfile } from '../../models/User';

const GRID_GAP = 16;
const MIN_GRID_CELL_WIDTH = 84;
const MIN_GRID_COLUMNS = 3;
const MAX_GRID_COLUMNS = 5;

export default function BadgesScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const { t } = useLanguage();

    const [allBadges, setAllBadges] = useState<(Badge & { unlocked: boolean, earnedDate?: string, currentProgress?: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBadge, setSelectedBadge] = useState<(Badge & { unlocked: boolean, earnedDate?: string, currentProgress?: number }) | null>(null);
    const [gridWidth, setGridWidth] = useState(0);

    useEffect(() => {
        const loadData = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }
            try {
                setLoading(true);
                // We fetch profile to get "complete profile" status accurately
                let profileData: UserProfile | null = await profileService.fetchProfileById(userId);

                // If fail, create a minimal profile object
                if (!profileData) {
                    profileData = { id: userId, username: 'Unknown', name: 'Unknown', profileImageUrl: null } as UserProfile;
                }

                const statsData = await BadgeService.getUserStats(userId);

                const earned = BadgeService.calculateBadges(statsData, profileData);
                const all = BadgeService.getAllBadgesWithStatus(statsData, earned);
                setAllBadges(all);

            } catch (error) {
                console.error("Error loading badges screen:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [userId]);

    if (loading) {
        return (
            <SafeAreaView style={styles.container} edges={['bottom']}>
                <Stack.Screen options={{ headerShown: false }} />
                <Loader />
            </SafeAreaView>
        );
    }

    // Group badges by category
    const categories: { [key: string]: typeof allBadges } = {
        onboarding: allBadges.filter(b => b.category === 'onboarding'),
        consistency: allBadges.filter(b => b.category === 'consistency'),
        community: allBadges.filter(b => b.category === 'community'),
    };

    const getCategoryTitle = (cat: string) => {
        switch (cat) {
            case 'onboarding': return t('Getting Started');
            case 'consistency': return t('Consistency');
            case 'community': return t('Community');
            default: return cat;
        }
    };

    const columnCount = gridWidth > 0
        ? Math.max(
            MIN_GRID_COLUMNS,
            Math.min(
                MAX_GRID_COLUMNS,
                Math.floor((gridWidth + GRID_GAP) / (MIN_GRID_CELL_WIDTH + GRID_GAP)),
            ),
        )
        : 4;
    const gridItemWidth = gridWidth > 0
        ? (gridWidth - GRID_GAP * (columnCount - 1)) / columnCount
        : undefined;

    return (
        <SafeAreaView style={styles.container} edges={['bottom']}>
            <Stack.Screen options={{ headerShown: false }} />

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {Object.entries(categories).map(([category, badges]) => (
                    <View key={category} style={styles.categorySection}>
                        <Text style={styles.categoryTitle}>{getCategoryTitle(category)}</Text>
                        <View
                            style={styles.grid}
                            onLayout={(event) => setGridWidth(event.nativeEvent.layout.width)}
                        >
                            {badges.map(badge => (
                                <TouchableOpacity
                                    key={badge.id}
                                    style={[
                                        styles.gridItem,
                                        gridItemWidth ? { width: gridItemWidth } : styles.gridItemFallback,
                                    ]}
                                    onPress={() => setSelectedBadge(badge)}
                                >
                                    <BadgeIcon
                                        badge={badge}
                                        unlocked={badge.unlocked}
                                        size="medium"
                                        showLevelColor={true}
                                    />
                                    <Text style={styles.badgeName} numberOfLines={2}>
                                        {badge.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                ))}
            </ScrollView>

            <BadgeModal
                visible={!!selectedBadge}
                onClose={() => setSelectedBadge(null)}
                badge={selectedBadge}
                unlocked={selectedBadge?.unlocked || false}
                currentProgress={selectedBadge?.currentProgress}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.light.background,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    categorySection: {
        marginBottom: 32,
    },
    categoryTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 16,
        color: '#333',
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        columnGap: GRID_GAP,
        rowGap: GRID_GAP,
    },
    gridItem: {
        alignItems: 'center',
        gap: 8,
    },
    gridItemFallback: {
        width: '25%',
    },
    badgeName: {
        fontSize: 11,
        textAlign: 'center',
        maxWidth: 72,
        color: '#666',
        fontWeight: '500',
    },
});
