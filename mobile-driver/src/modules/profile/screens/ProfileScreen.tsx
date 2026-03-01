import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, SafeAreaView,
} from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAuthStore } from '../../../store/auth.store';
import { useDriverStore } from '../../../store/driver.store';
import { authService } from '../../../services/auth.service';

export default function ProfileScreen() {
    const user = useAuthStore(state => state.user);
    const clearAuth = useAuthStore(state => state.clearAuth);
    const resetDriver = useDriverStore(state => state.reset);
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    // Mock stats for premium feel
    const driverStats = [
        { label: 'Completed', value: '124', icon: '✅' },
        { label: 'Rating', value: '4.9', icon: '⭐' },
        { label: 'Experience', value: '2y', icon: '🏆' },
    ];

    const handleLogout = () => {
        Alert.alert('Logout', 'Are you sure you want to logout?', [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Logout',
                style: 'destructive',
                onPress: async () => {
                    setIsLoggingOut(true);
                    try {
                        await authService.logout();
                    } catch {
                        // Even if API call fails, clear local auth
                    } finally {
                        resetDriver();
                        await clearAuth();
                    }
                },
            },
        ]);
    };

    const MenuItem = ({ icon, label, value, onPress, showArrow = true, isDestructive = false }: any) => (
        <TouchableOpacity
            style={styles.menuItem}
            onPress={onPress}
            activeOpacity={0.7}
        >
            <View style={[styles.menuIconContainer, isDestructive && styles.destructiveIconBg]}>
                <Text style={styles.menuIconText}>{icon}</Text>
            </View>
            <View style={styles.menuLabelContainer}>
                <Text style={[styles.menuLabel, isDestructive && styles.destructiveText]}>{label}</Text>
            </View>
            {value && <Text style={styles.menuValue}>{value}</Text>}
            {showArrow && <Text style={styles.menuArrow}>›</Text>}
        </TouchableOpacity>
    );

    const SectionHeader = ({ title }: { title: string }) => (
        <Text style={styles.sectionTitle}>{title}</Text>
    );

    return (
        <SafeAreaView style={styles.container}>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
                {/* Modern Header */}
                <View style={styles.header}>
                    <View style={styles.avatarContainer}>
                        <View style={styles.avatar}>
                            <Text style={styles.avatarText}>
                                {user?.name?.charAt(0)?.toUpperCase() || 'D'}
                            </Text>
                        </View>
                        <TouchableOpacity style={styles.editAvatarBtn} activeOpacity={0.8}>
                            <Text style={styles.editAvatarIcon}>📸</Text>
                        </TouchableOpacity>
                    </View>

                    <Text style={styles.name}>{user?.name}</Text>
                    <Text style={styles.email}>{user?.email}</Text>

                    <View style={styles.badgeRow}>
                        <View style={styles.roleBadge}>
                            <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
                        </View>
                        <View style={styles.statusBadge}>
                            <View style={styles.statusDot} />
                            <Text style={styles.statusText}>VERIFIED</Text>
                        </View>
                    </View>
                </View>

                {/* Stats Bar */}
                <View style={styles.statsContainer}>
                    {driverStats.map((stat, index) => (
                        <View key={index} style={[styles.statItem, index !== driverStats.length - 1 && styles.statDivider]}>
                            <Text style={styles.statIcon}>{stat.icon}</Text>
                            <Text style={styles.statValue}>{stat.value}</Text>
                            <Text style={styles.statLabel}>{stat.label}</Text>
                        </View>
                    ))}
                </View>

                {/* Menu Sections */}
                <View style={styles.menuContainer}>
                    <SectionHeader title="Account Settings" />
                    <View style={styles.menuGroup}>
                        <MenuItem icon="👤" label="Personal Information" />
                        <MenuItem icon="🔒" label="Security & Password" />
                        <MenuItem icon="📄" label="Driver Documents" value="Updated" />
                    </View>

                    <SectionHeader title="Preferences" />
                    <View style={styles.menuGroup}>
                        <MenuItem icon="🌍" label="Language" value="English" />
                        <MenuItem icon="🔔" label="Notifications" />
                        <MenuItem icon="🌙" label="Appearance" value="Light" />
                    </View>

                    <SectionHeader title="Support & Legal" />
                    <View style={styles.menuGroup}>
                        <MenuItem icon="🎧" label="Help Center" />
                        <MenuItem icon="📜" label="Terms of Service" />
                        <MenuItem icon="🛡️" label="Privacy Policy" />
                    </View>

                    <View style={[styles.menuGroup, { marginTop: spacing.xl }]}>
                        <MenuItem
                            icon="🚪"
                            label="Logout"
                            onPress={handleLogout}
                            showArrow={false}
                            isDestructive={true}
                        />
                    </View>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.version}>TareeqK Driver App</Text>
                    <Text style={styles.versionNumber}>Version 1.0.0 (Build 342)</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    scrollContent: {
        paddingBottom: spacing.xxl,
    },
    header: {
        alignItems: 'center',
        paddingVertical: spacing.lg,
        backgroundColor: colors.white,
        borderBottomLeftRadius: 32,
        borderBottomRightRadius: 32,
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    avatarContainer: {
        position: 'relative',
        marginBottom: spacing.md,
    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 4,
        borderColor: '#F1F3F5',
    },
    avatarText: {
        fontSize: 40,
        fontWeight: '900',
        color: colors.white,
    },
    editAvatarBtn: {
        position: 'absolute',
        bottom: 0,
        right: 0,
        backgroundColor: colors.white,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
    },
    editAvatarIcon: {
        fontSize: 16,
    },
    name: {
        fontSize: 24,
        fontWeight: '900',
        color: colors.text,
        marginBottom: 4,
    },
    email: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
        marginBottom: spacing.md,
    },
    badgeRow: {
        flexDirection: 'row',
        gap: spacing.sm,
    },
    roleBadge: {
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 11,
        fontWeight: '800',
        color: colors.primary,
        letterSpacing: 0.5,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: colors.success + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    statusDot: {
        width: 6,
        height: 6,
        borderRadius: 3,
        backgroundColor: colors.success,
        marginRight: 6,
    },
    statusText: {
        fontSize: 11,
        fontWeight: '800',
        color: colors.success,
        letterSpacing: 0.5,
    },
    statsContainer: {
        flexDirection: 'row',
        backgroundColor: colors.white,
        marginHorizontal: spacing.lg,
        marginTop: -30,
        borderRadius: 24,
        padding: spacing.lg,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.1,
        shadowRadius: 16,
        zIndex: 10,
    },
    statItem: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        borderRightWidth: 1,
        borderRightColor: '#F1F3F5',
    },
    statIcon: {
        fontSize: 18,
        marginBottom: 4,
    },
    statValue: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.text,
    },
    statLabel: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
    },
    menuContainer: {
        paddingTop: spacing.xl,
        paddingHorizontal: spacing.lg,
    },
    sectionTitle: {
        fontSize: 13,
        fontWeight: '800',
        color: colors.textSecondary,
        marginBottom: spacing.sm,
        marginLeft: spacing.xs,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    menuGroup: {
        backgroundColor: colors.white,
        borderRadius: 24,
        overflow: 'hidden',
        marginBottom: spacing.xl,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: '#F8F9FA',
    },
    menuIconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F1F3F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    destructiveIconBg: {
        backgroundColor: colors.error + '10',
    },
    menuIconText: {
        fontSize: 18,
    },
    menuLabelContainer: {
        flex: 1,
    },
    menuLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: colors.text,
    },
    destructiveText: {
        color: colors.error,
    },
    menuValue: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
        marginRight: spacing.xs,
    },
    menuArrow: {
        fontSize: 20,
        color: '#DEE2E6',
        fontWeight: '300',
    },
    footer: {
        alignItems: 'center',
        marginTop: spacing.sm,
        marginBottom: spacing.xxl,
    },
    version: {
        fontSize: 14,
        fontWeight: '800',
        color: colors.textSecondary,
    },
    versionNumber: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
});
