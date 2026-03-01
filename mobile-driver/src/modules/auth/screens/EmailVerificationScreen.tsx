import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { authService } from '../../../services/auth.service';

type EmailVerificationNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'EmailVerification'>;
type EmailVerificationRouteProp = RouteProp<AuthStackParamList, 'EmailVerification'>;

export default function EmailVerificationScreen() {
    const navigation = useNavigation<EmailVerificationNavigationProp>();
    const route = useRoute<EmailVerificationRouteProp>();
    const { email } = route.params;

    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleResendOTP = async () => {
        setError('');
        setSuccessMessage('');
        setIsResending(true);

        try {
            const response = await authService.sendOTP(email);
            setSuccessMessage(response.message || 'A new OTP has been sent to your email.');
        } catch (err: any) {
            const data = err.response?.data;
            setError(data?.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Email Verification</Text>
                <Text style={styles.subtitle}>
                    We have sent a verification OTP to{'\n'}
                    <Text style={styles.emailHighlight}>{email}</Text>.
                    {'\n\n'}Please check your inbox and enter the OTP code to verify your account.
                </Text>
            </View>

            {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
            {error ? <Text style={styles.errorText}>{error}</Text> : null}

            <View style={styles.actions}>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => navigation.navigate('OTP', { email, purpose: 'email_verification' })}
                >
                    <Text style={styles.primaryButtonText}>Enter OTP Code</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.secondaryButton, isResending && styles.disabledButton]}
                    onPress={handleResendOTP}
                    disabled={isResending}
                >
                    {isResending ? (
                        <ActivityIndicator color={colors.primary} />
                    ) : (
                        <Text style={styles.secondaryButtonText}>Resend OTP</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.tertiaryButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <Text style={styles.tertiaryButtonText}>Back to Login</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: colors.background,
        padding: spacing.xl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    emailHighlight: {
        color: colors.primary,
        fontWeight: '600',
    },
    actions: {
        marginTop: spacing.lg,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    primaryButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: colors.surface,
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    secondaryButtonText: {
        color: colors.primary,
        fontSize: 18,
        fontWeight: '600',
    },
    tertiaryButton: {
        paddingVertical: spacing.sm,
        alignItems: 'center',
    },
    tertiaryButtonText: {
        color: colors.textSecondary,
        fontSize: 16,
        fontWeight: '600',
    },
    disabledButton: {
        opacity: 0.7,
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    successText: {
        color: colors.primary,
        fontSize: 14,
        marginBottom: spacing.md,
        textAlign: 'center',
        fontWeight: '600',
    },
});
