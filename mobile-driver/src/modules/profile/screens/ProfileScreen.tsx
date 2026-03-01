import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert,
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

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.avatar}>
                    <Text style={styles.avatarText}>
                        {user?.name?.charAt(0)?.toUpperCase() || 'D'}
                    </Text>
                </View>
                <Text style={styles.name}>{user?.name}</Text>
                <Text style={styles.email}>{user?.email}</Text>
                <View style={styles.roleBadge}>
                    <Text style={styles.roleText}>{user?.role?.toUpperCase()}</Text>
                </View>
            </View>

            {/* Menu Items */}
            <View style={styles.menuSection}>
                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuIcon}>✏️</Text>
                    <Text style={styles.menuLabel}>Edit Profile</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuIcon}>🔒</Text>
                    <Text style={styles.menuLabel}>Change Password</Text>
                    <Text style={styles.menuArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.menuItem}>
                    <Text style={styles.menuIcon}>🌍</Text>
                    <Text style={styles.menuLabel}>Language</Text>
                    <Text style={styles.menuValue}>English</Text>
                </TouchableOpacity>
            </View>

            {/* Logout */}
            <TouchableOpacity
                style={[styles.logoutButton, isLoggingOut && styles.disabledButton]}
                onPress={handleLogout}
                disabled={isLoggingOut}
            >
                {isLoggingOut ? (
                    <ActivityIndicator color={colors.white} />
                ) : (
                    <Text style={styles.logoutButtonText}>Logout</Text>
                )}
            </TouchableOpacity>

            <Text style={styles.version}>TareeqK Driver v1.0.0</Text>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        paddingBottom: spacing.xxl,
    },
    header: {
        alignItems: 'center',
        paddingTop: spacing.xxl + spacing.lg,
        paddingBottom: spacing.xl,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    avatarText: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.white,
    },
    name: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    email: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: spacing.sm,
    },
    roleBadge: {
        backgroundColor: colors.primary + '20',
        paddingHorizontal: spacing.md,
        paddingVertical: 4,
        borderRadius: 12,
    },
    roleText: {
        fontSize: 12,
        fontWeight: '700',
        color: colors.primary,
    },
    menuSection: {
        backgroundColor: colors.white,
        marginTop: spacing.lg,
        borderTopWidth: 1,
        borderBottomWidth: 1,
        borderColor: colors.border,
    },
    menuItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: colors.surface,
    },
    menuIcon: {
        fontSize: 20,
        marginRight: spacing.md,
    },
    menuLabel: {
        flex: 1,
        fontSize: 16,
        color: colors.text,
    },
    menuArrow: {
        fontSize: 24,
        color: colors.textSecondary,
    },
    menuValue: {
        fontSize: 14,
        color: colors.textSecondary,
    },
    logoutButton: {
        backgroundColor: colors.error,
        marginHorizontal: spacing.lg,
        marginTop: spacing.xl,
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    logoutButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
    version: {
        textAlign: 'center',
        color: colors.textSecondary,
        fontSize: 12,
        marginTop: spacing.lg,
    },
});
