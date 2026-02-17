import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { BadgeIcon } from './BadgeIcon';
import { Badge } from '../../types/badges';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../../constants/Colors';

interface BadgeModalProps {
    visible: boolean;
    onClose: () => void;
    badge: Badge | null;
    unlocked: boolean;
    earnedDate?: string;
    currentProgress?: number;
}

export const BadgeModal: React.FC<BadgeModalProps> = ({
    visible,
    onClose,
    badge,
    unlocked,
    earnedDate,
    currentProgress
}) => {
    if (!badge) return null;

    return (
        <Modal
            visible={visible}
            transparent={true}
            animationType="fade"
            onRequestClose={onClose}
        >
            <TouchableOpacity
                style={styles.overlay}
                activeOpacity={1}
                onPress={onClose}
            >
                <TouchableOpacity
                    activeOpacity={1}
                    style={styles.modalContent}
                    onPress={e => e.stopPropagation()} // Prevent closing when clicking content
                >
                    <View style={styles.header}>
                        <TouchableOpacity onPress={onClose} style={styles.closeButton}>
                            <Ionicons name="close" size={24} color="#666" />
                        </TouchableOpacity>
                    </View>

                    <View style={styles.content}>
                        <View style={styles.iconWrapper}>
                            <BadgeIcon
                                badge={badge}
                                unlocked={unlocked}
                                size="large"
                            />
                        </View>

                        <Text style={styles.title}>{badge.name}</Text>

                        <View style={[styles.statusBadge, unlocked ? styles.statusUnlocked : styles.statusLocked]}>
                            <Ionicons
                                name={unlocked ? "checkmark-circle" : "lock-closed"}
                                size={16}
                                color={unlocked ? "#4CAF50" : "#666"}
                            />
                            <Text style={[styles.statusText, { color: unlocked ? "#4CAF50" : "#666" }]}>
                                {unlocked ? "Obtained" : "Locked"}
                            </Text>
                        </View>

                        <Text style={styles.description}>{badge.description}</Text>

                        {/* Show progress bar if it's a numeric badge (has threshold) */}
                        {badge.threshold && currentProgress !== undefined && (
                            <View style={styles.detailsContainer}>
                                <View style={styles.progressContainer}>
                                    <View style={styles.progressBarBg}>
                                        <View
                                            style={[
                                                styles.progressBarFill,
                                                { width: `${Math.min(100, (currentProgress / badge.threshold) * 100)}%` }
                                            ]}
                                        />
                                        <Text style={styles.progressTextInside}>
                                            {currentProgress <= badge.threshold ? currentProgress : badge.threshold} / {badge.threshold}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        )}
                    </View>
                </TouchableOpacity>
            </TouchableOpacity>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 20,
        width: '100%',
        maxWidth: 340,
        padding: 24,
        alignItems: 'center',
        shadowColor: "#000",
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
        elevation: 5,
    },
    header: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: -10, // Pull close button up a bit
    },
    closeButton: {
        padding: 8,
    },
    content: {
        alignItems: 'center',
        width: '100%',
    },
    iconWrapper: {
        marginBottom: 20,
    },
    title: {
        fontSize: 22,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
        textAlign: 'center',
    },
    description: {
        fontSize: 16,
        color: '#666',
        textAlign: 'center',
        marginBottom: 24,
        lineHeight: 22,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 16,
        marginBottom: 16,
        gap: 6,
    },
    statusUnlocked: {
        backgroundColor: '#E8F5E9',
    },
    statusLocked: {
        backgroundColor: '#F5F5F5',
    },
    statusText: {
        fontWeight: '600',
        fontSize: 14,
    },
    detailsContainer: {
        width: '100%',
        backgroundColor: '#FAFAFA',
        borderRadius: 12,
        padding: 16,
    },
    detailItem: {
        width: '100%',
    },
    detailLabel: {
        fontSize: 12,
        color: '#999',
        textTransform: 'uppercase',
        marginBottom: 4,
        fontWeight: '600',
    },
    detailValue: {
        fontSize: 16,
        color: '#333',
        fontWeight: '500',
    },
    progressContainer: {
        marginTop: 0,
        width: '100%',
    },
    progressBarBg: {
        height: 24, // Increased height to fit text
        backgroundColor: '#E0E0E0',
        borderRadius: 12,
        width: '100%',
        justifyContent: 'center',
        overflow: 'hidden',
    },
    progressBarFill: {
        position: 'absolute',
        height: '100%',
        backgroundColor: colors.light.primary,
        borderRadius: 12,
    },
    progressTextInside: {
        fontSize: 12,
        color: '#333',
        fontWeight: 'bold',
        textAlign: 'center',
        zIndex: 1,
    },
});
