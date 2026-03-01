import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { authService } from '../../../services/auth.service';

type OTPNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'OTP'>;
type OTPRouteProp = RouteProp<AuthStackParamList, 'OTP'>;

const RESEND_COOLDOWN_SECONDS = 60;

export default function OTPScreen() {
    const navigation = useNavigation<OTPNavigationProp>();
    const route = useRoute<OTPRouteProp>();
    const { email, purpose } = route.params;

    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isResending, setIsResending] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [resendCooldown, setResendCooldown] = useState(0);

    // Countdown timer for resend cooldown
    useEffect(() => {
        if (resendCooldown <= 0) return;

        const timer = setInterval(() => {
            setResendCooldown(prev => prev - 1);
        }, 1000);

        return () => clearInterval(timer);
    }, [resendCooldown]);

    const handleVerifyOTP = async () => {
        setError('');
        setSuccessMessage('');

        if (!otp || otp.length !== 6) {
            setError('Please enter the 6-digit OTP code.');
            return;
        }

        setIsLoading(true);

        try {
            if (purpose === 'email_verification') {
                await authService.verifyOTP(email, otp);
                setSuccessMessage('Email verified successfully! Redirecting to login...');
                setTimeout(() => {
                    navigation.navigate('Login');
                }, 1500);
            } else {
                // password_reset: we already have the OTP validated client-side by entering it
                // Navigate to ResetPassword with email + otp for the actual reset call
                setSuccessMessage('OTP verified! Redirecting...');
                setTimeout(() => {
                    navigation.navigate('ResetPassword', { email, otp });
                }, 1000);
            }
        } catch (err: any) {
            const data = err.response?.data;
            setError(data?.message || 'Invalid or expired OTP. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResendOTP = useCallback(async () => {
        if (resendCooldown > 0 || isResending) return;

        setError('');
        setSuccessMessage('');
        setIsResending(true);

        try {
            if (purpose === 'password_reset') {
                await authService.forgotPassword(email);
            } else {
                await authService.sendOTP(email);
            }
            setSuccessMessage('A new OTP has been sent to your email.');
            setResendCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (err: any) {
            const data = err.response?.data;
            setError(data?.message || 'Failed to resend OTP. Please try again.');
        } finally {
            setIsResending(false);
        }
    }, [resendCooldown, isResending, email, purpose]);

    const purposeLabel = purpose === 'email_verification' ? 'Email Verification' : 'Password Reset';

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Verification</Text>
                    <Text style={styles.subtitle}>
                        Enter the 6-digit OTP sent to{'\n'}
                        <Text style={styles.emailHighlight}>{email}</Text>
                        {'\n'}for {purposeLabel.toLowerCase()}.
                    </Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>OTP Code</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="000000"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="number-pad"
                        value={otp}
                        onChangeText={(text) => { setOtp(text); setError(''); }}
                        maxLength={6}
                        editable={!isLoading}
                    />

                    {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity
                        style={[styles.primaryButton, isLoading && styles.disabledButton]}
                        onPress={handleVerifyOTP}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.primaryButtonText}>Verify Code</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Didn't receive the code? </Text>
                    {isResending ? (
                        <ActivityIndicator size="small" color={colors.primary} />
                    ) : resendCooldown > 0 ? (
                        <Text style={styles.cooldownText}>Resend in {resendCooldown}s</Text>
                    ) : (
                        <TouchableOpacity onPress={handleResendOTP}>
                            <Text style={styles.footerLink}>Resend</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </ScrollView>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: spacing.xl,
        justifyContent: 'center',
    },
    header: {
        marginBottom: spacing.xl,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        lineHeight: 24,
    },
    emailHighlight: {
        color: colors.primary,
        fontWeight: '600',
    },
    form: {
        marginBottom: spacing.xl,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    input: {
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        padding: spacing.md,
        fontSize: 24,
        color: colors.text,
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
        textAlign: 'center',
        letterSpacing: 8,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    disabledButton: {
        opacity: 0.7,
    },
    primaryButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
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
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    footerText: {
        fontSize: 16,
        color: colors.textSecondary,
    },
    footerLink: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: 'bold',
    },
    cooldownText: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '600',
    },
});
