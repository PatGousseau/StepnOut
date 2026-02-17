import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, SafeAreaView, TouchableOpacity } from 'react-native';
import { useLocalSearchParams, Stack, useRouter } from 'expo-router';
import { BadgeService } from '../../services/badgeService';
import { Badge, UserBadge } from '../../types/badges';
import { BadgeIcon } from '../../components/Badges/BadgeIcon';
import { BadgeModal } from '../../components/Badges/BadgeModal';
import { colors } from '../../constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { Loader } from '../../components/Loader';
import { profileService } from '../../services/profileService';
import { useLanguage } from '../../contexts/LanguageContext';
import { UserProfile } from '../../models/User';

export default function BadgesScreen() {
    const { userId } = useLocalSearchParams<{ userId: string }>();
    const router = useRouter();
    const { t } = useLanguage();

    const [allBadges, setAllBadges] = useState<(Badge & { unlocked: boolean, earnedDate?: string, currentProgress?: number })[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedBadge, setSelectedBadge] = useState<(Badge & { unlocked: boolean, earnedDate?: string, currentProgress?: number }) | null>(null);

    useEffect(() => {
        const loadData = async () => {
            if (!userId) return;
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
            <SafeAreaView style={styles.container}>
                <Stack.Screen options={{ headerShown: false }} />
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                        <Ionicons name="arrow-back" size={24} color="#000" />
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>{t('Badges')}</Text>
                    <View style={{ width: 24 }} />
                </View>
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

    return (
        <SafeAreaView style={styles.container}>
            <Stack.Screen options={{ headerShown: false }} />

            <View style={styles.header}>
                <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
                    <Ionicons name="arrow-back" size={24} color="#000" />
                </TouchableOpacity>
                <Text style={styles.headerTitle}>{t('Badges')}</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>

                {/* Summary Card */}
                <View style={styles.summaryCard}>
                    <Text style={styles.summaryValue}>
                        {allBadges.filter(b => b.unlocked).length} / {allBadges.length}
                    </Text>
                    <Text style={styles.summaryLabel}>{t('Unlocked')}</Text>
                </View>

                {Object.entries(categories).map(([category, badges]) => (
                    <View key={category} style={styles.categorySection}>
                        <Text style={styles.categoryTitle}>{getCategoryTitle(category)}</Text>
                        <View style={styles.grid}>
                            {badges.map(badge => (
                                <TouchableOpacity
                                    key={badge.id}
                                    style={styles.gridItem}
                                    onPress={() => setSelectedBadge(badge)}
                                >
                                    <BadgeIcon
                                        badge={badge}
                                        unlocked={badge.unlocked}
                                        size="large"
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
                earnedDate={selectedBadge?.earnedDate}
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
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingVertical: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backButton: {
        padding: 4,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 40,
    },
    summaryCard: {
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        marginBottom: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
        elevation: 2,
    },
    summaryValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.light.primary,
    },
    summaryLabel: {
        marginTop: 4,
        fontSize: 14,
        color: '#666',
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
        columnGap: 16, // Requires newer RN, fallback to margin if issues
        rowGap: 16,
    },
    gridItem: {
        width: '30%', // roughly 3 columns. Adjust based on screen width/padding
        alignItems: 'center',
        marginBottom: 0,
    },
    badgeName: {
        fontSize: 11,
        textAlign: 'center',
        marginTop: 8,
        color: '#666',
        fontWeight: '500',
    },
});
