import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { authService } from '../../../services/auth.service';

type ForgotPasswordNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;

export default function ForgotPasswordScreen() {
    const navigation = useNavigation<ForgotPasswordNavigationProp>();
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');

    const handleSendResetOTP = async () => {
        setError('');
        setSuccessMessage('');

        if (!email.trim()) {
            setError('Please enter your email address.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.forgotPassword(email.trim());

            setSuccessMessage(response.message || 'OTP sent to your email.');

            // Navigate to OTP screen for password reset after a brief delay
            setTimeout(() => {
                navigation.navigate('OTP', { email: email.trim(), purpose: 'password_reset' });
            }, 1500);
        } catch (err: any) {
            const data = err.response?.data;
            const status = err.response?.status;

            if (status === 422 && data?.errors) {
                // Validation errors (e.g., email doesn't exist)
                const firstError = Object.values(data.errors).flat()[0] as string;
                setError(firstError || 'Please check your email address.');
            } else {
                setError(data?.message || 'Failed to send OTP. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Forgot Password</Text>
                    <Text style={styles.subtitle}>
                        Enter your email address and we'll send you an OTP to reset your password.
                    </Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter your email"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={(text) => { setEmail(text); setError(''); }}
                        editable={!isLoading}
                    />

                    {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity
                        style={[styles.primaryButton, isLoading && styles.disabledButton]}
                        onPress={handleSendResetOTP}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.primaryButtonText}>Send OTP</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => navigation.goBack()} disabled={isLoading}>
                        <Text style={styles.footerLink}>Back to Login</Text>
                    </TouchableOpacity>
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
        fontSize: 16,
        color: colors.text,
        marginBottom: spacing.lg,
        backgroundColor: colors.surface,
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
        alignItems: 'center',
        marginTop: spacing.xl,
    },
    footerLink: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: 'bold',
    },
});
