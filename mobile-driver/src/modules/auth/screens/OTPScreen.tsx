import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
    SafeAreaView, Dimensions
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { authService } from '../../../services/auth.service';
import { FadeInView } from '../../../components/FadeInView';

const { width, height } = Dimensions.get('window');
const RESEND_COOLDOWN_SECONDS = 60;

type OTPNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'OTP'>;
type OTPRouteProp = RouteProp<AuthStackParamList, 'OTP'>;

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
                setSuccessMessage('Email verified successfully!');
                setTimeout(() => {
                    navigation.navigate('Login');
                }, 1500);
            } else {
                setSuccessMessage('OTP verified!');
                setTimeout(() => {
                    navigation.navigate('ResetPassword', { email, otp });
                }, 1000);
            }
        } catch (err: any) {
            const data = err.response?.data;
            setError(data?.message || 'Invalid or expired OTP.');
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
            setSuccessMessage('A new OTP has been sent.');
            setResendCooldown(RESEND_COOLDOWN_SECONDS);
        } catch (err: any) {
            const data = err.response?.data;
            setError(data?.message || 'Failed to resend OTP.');
        } finally {
            setIsResending(false);
        }
    }, [resendCooldown, isResending, email, purpose]);

    return (
        <View style={styles.container}>
            <View style={styles.gradientHeader} />

            <SafeAreaView style={styles.safeArea}>
                <KeyboardAvoidingView
                    style={{ flex: 1 }}
                    behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
                >
                    <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                        <FadeInView style={styles.header}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.backButtonText}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.title}>Verification</Text>
                            <Text style={styles.subtitle} numberOfLines={2}>
                                Code sent to {email}
                            </Text>
                        </FadeInView>

                        <FadeInView delay={200} style={styles.card}>
                            <View style={styles.form}>
                                <Text style={styles.label}>Enter 6-Digit OTP</Text>
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
                                    activeOpacity={0.8}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color={colors.white} />
                                    ) : (
                                        <Text style={styles.primaryButtonText}>Verify Now</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </FadeInView>

                        <FadeInView delay={400} style={styles.footer}>
                            <Text style={styles.footerText}>Didn't receive the code? </Text>
                            {isResending ? (
                                <ActivityIndicator size="small" color={colors.primary} />
                            ) : resendCooldown > 0 ? (
                                <Text style={styles.cooldownText}>{resendCooldown}s</Text>
                            ) : (
                                <TouchableOpacity onPress={handleResendOTP}>
                                    <Text style={styles.footerLink}>Resend</Text>
                                </TouchableOpacity>
                            )}
                        </FadeInView>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    gradientHeader: {
        position: 'absolute',
        top: 0,
        width: width,
        height: height * 0.35,
        backgroundColor: colors.primary,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
    },
    safeArea: {
        flex: 1,
    },
    scrollContainer: {
        flexGrow: 1,
        padding: spacing.xl,
    },
    header: {
        marginTop: 20,
        marginBottom: spacing.xl,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    backButtonText: {
        color: colors.white,
        fontSize: 24,
        fontWeight: 'bold',
    },
    title: {
        fontSize: 34,
        fontWeight: '900',
        color: colors.white,
    },
    subtitle: {
        fontSize: 16,
        color: colors.white,
        opacity: 0.9,
        fontWeight: '600',
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 24,
        padding: spacing.xl,
        elevation: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.1,
        shadowRadius: 20,
    },
    form: {
        width: '100%',
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.lg,
        textAlign: 'center',
    },
    input: {
        backgroundColor: '#F8F9FA',
        borderWidth: 1.5,
        borderColor: '#EDF2F7',
        borderRadius: 16,
        padding: spacing.md,
        fontSize: 32,
        color: colors.text,
        marginBottom: spacing.xl,
        textAlign: 'center',
        fontWeight: '800',
        letterSpacing: 10,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        elevation: 4,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    disabledButton: {
        opacity: 0.7,
    },
    primaryButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '800',
    },
    errorText: {
        color: colors.error,
        fontSize: 14,
        marginBottom: spacing.md,
        textAlign: 'center',
        fontWeight: '600',
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
        marginTop: spacing.xxl,
    },
    footerText: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    footerLink: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '800',
    },
    cooldownText: {
        fontSize: 16,
        color: colors.textSecondary,
        fontWeight: '700',
    },
});
