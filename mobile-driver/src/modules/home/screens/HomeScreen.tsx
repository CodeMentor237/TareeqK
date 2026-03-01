import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { useAuthStore } from '../../../store/auth.store';
import { authService } from '../../../services/auth.service';

export default function HomeScreen() {
    const user = useAuthStore(state => state.user);
    const clearAuth = useAuthStore(state => state.clearAuth);
    const [isLoggingOut, setIsLoggingOut] = React.useState(false);

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await authService.logout();
        } catch {
            // Even if API call fails, clear local auth
        } finally {
            await clearAuth();
        }
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Welcome, {user?.name}!</Text>
            <Text style={styles.subtitle}>You are logged in as a {user?.role}.</Text>
            <Text style={styles.email}>{user?.email}</Text>

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
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        padding: spacing.xl,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        marginBottom: spacing.xs,
    },
    email: {
        fontSize: 14,
        color: colors.textSecondary,
        marginBottom: spacing.xxl,
    },
    logoutButton: {
        backgroundColor: colors.error,
        paddingVertical: spacing.md,
        paddingHorizontal: spacing.xxl,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    logoutButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
});
