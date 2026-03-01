import React, { useState } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator,
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
            setSuccessMessage(response.message || 'OTP resent successfully!');
        } catch (err: any) {
            const data = err.response?.data;
            setError(data?.message || 'Failed to resend OTP.');
        } finally {
            setIsResending(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.gradientHeader} />

            <SafeAreaView style={styles.safeArea}>
                <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                    <FadeInView style={styles.header}>
                        <View style={styles.iconContainer}>
                            <Text style={styles.iconEmoji}>📨</Text>
                        </View>
                        <Text style={styles.title}>Check Email</Text>
                        <Text style={styles.subtitle}>
                            Verification code sent to {'\n'}
                            <Text style={styles.emailHighlight}>{email}</Text>
                        </Text>
                    </FadeInView>

                    <FadeInView delay={200} style={styles.card}>
                        <View style={styles.content}>
                            <Text style={styles.description}>
                                We've sent a 6-digit confirmation code to your inbox. Please enter it to verify your account and start driving.
                            </Text>

                            {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
                            {error ? <Text style={styles.errorText}>{error}</Text> : null}

                            <TouchableOpacity
                                style={styles.primaryButton}
                                onPress={() => navigation.navigate('OTP', { email, purpose: 'email_verification' })}
                                activeOpacity={0.8}
                            >
                                <Text style={styles.primaryButtonText}>Enter Code</Text>
                            </TouchableOpacity>

                            <TouchableOpacity
                                style={[styles.secondaryButton, isResending && styles.disabledButton]}
                                onPress={handleResendOTP}
                                disabled={isResending}
                            >
                                {isResending ? (
                                    <ActivityIndicator color={colors.primary} />
                                ) : (
                                    <Text style={styles.secondaryButtonText}>Resend Email</Text>
                                )}
                            </TouchableOpacity>
                        </View>
                    </FadeInView>

                    <FadeInView delay={400} style={styles.footer}>
                        <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                            <Text style={styles.footerLink}>Back to Login</Text>
                        </TouchableOpacity>
                    </FadeInView>
                </ScrollView>
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
        height: height * 0.45,
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
        alignItems: 'center',
        marginTop: 40,
        marginBottom: spacing.xl,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 25,
        backgroundColor: colors.white,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
        elevation: 10,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 5 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    iconEmoji: {
        fontSize: 40,
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
        textAlign: 'center',
        marginTop: 5,
        lineHeight: 24,
    },
    emailHighlight: {
        color: colors.white,
        fontWeight: '800',
        textDecorationLine: 'underline',
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
    content: {
        alignItems: 'center',
    },
    description: {
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 22,
        marginBottom: spacing.xl,
        fontWeight: '500',
    },
    primaryButton: {
        backgroundColor: colors.primary,
        width: '100%',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: spacing.md,
        elevation: 4,
        shadowColor: colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    primaryButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '800',
    },
    secondaryButton: {
        backgroundColor: '#F8F9FA',
        width: '100%',
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#EDF2F7',
    },
    secondaryButtonText: {
        color: colors.primary,
        fontSize: 16,
        fontWeight: '700',
    },
    disabledButton: {
        opacity: 0.7,
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
        marginVertical: spacing.xxl,
        alignItems: 'center',
    },
    footerLink: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '800',
    },
});
