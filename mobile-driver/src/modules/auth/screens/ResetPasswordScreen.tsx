import React, { useState } from 'react';
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

type ResetPasswordNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'ResetPassword'>;
type ResetPasswordRouteProp = RouteProp<AuthStackParamList, 'ResetPassword'>;

export default function ResetPasswordScreen() {
    const navigation = useNavigation<ResetPasswordNavigationProp>();
    const route = useRoute<ResetPasswordRouteProp>();
    const { email, otp } = route.params;

    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    const handleResetPassword = async () => {
        setError('');
        setSuccessMessage('');
        setFieldErrors({});

        // Client-side validation
        if (!password || !confirmPassword) {
            setError('Please fill in both fields.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.resetPassword({
                email,
                otp,
                password,
                password_confirmation: confirmPassword,
            });

            setSuccessMessage(response.message || 'Password reset successfully!');

            // Navigate to Login after success
            setTimeout(() => {
                navigation.navigate('Login');
            }, 2000);
        } catch (err: any) {
            const status = err.response?.status;
            const data = err.response?.data;

            if (status === 422 && data?.errors) {
                setFieldErrors(data.errors);
                setError('Please fix the errors below.');
            } else if (status === 400) {
                // OTP expired or invalid
                setError(data?.message || 'Invalid or expired OTP. Please go back and request a new one.');
            } else {
                setError(data?.message || 'Password reset failed. Please try again.');
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
                    <Text style={styles.title}>Reset Password</Text>
                    <Text style={styles.subtitle}>
                        Enter a new password for your account ({email}).
                    </Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>New Password</Text>
                    <View style={[styles.passwordContainer, fieldErrors.password && styles.inputError]}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Enter new password (min. 8 characters)"
                            placeholderTextColor={colors.textSecondary}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={(text) => { setPassword(text); setError(''); }}
                            editable={!isLoading}
                        />
                        <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() => setShowPassword(!showPassword)}
                        >
                            <Text style={styles.eyeButtonText}>{showPassword ? '🙈' : '👁'}</Text>
                        </TouchableOpacity>
                    </View>
                    {fieldErrors.password?.map((msg, i) => (
                        <Text key={i} style={styles.fieldError}>{msg}</Text>
                    ))}

                    <Text style={styles.label}>Confirm Password</Text>
                    <View style={styles.passwordContainer}>
                        <TextInput
                            style={styles.passwordInput}
                            placeholder="Confirm new password"
                            placeholderTextColor={colors.textSecondary}
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={(text) => { setConfirmPassword(text); setError(''); }}
                            editable={!isLoading}
                        />
                        <TouchableOpacity
                            style={styles.eyeButton}
                            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                            <Text style={styles.eyeButtonText}>{showConfirmPassword ? '🙈' : '👁'}</Text>
                        </TouchableOpacity>
                    </View>

                    {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
                    {error ? <Text style={styles.errorText}>{error}</Text> : null}

                    <TouchableOpacity
                        style={[styles.primaryButton, isLoading && styles.disabledButton]}
                        onPress={handleResetPassword}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.primaryButtonText}>Update Password</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.surface,
        marginBottom: spacing.lg,
    },
    passwordInput: {
        flex: 1,
        padding: spacing.md,
        fontSize: 16,
        color: colors.text,
    },
    eyeButton: {
        paddingHorizontal: spacing.md,
        paddingVertical: spacing.sm,
    },
    eyeButtonText: {
        fontSize: 20,
    },
    inputError: {
        borderColor: colors.error,
    },
    fieldError: {
        color: colors.error,
        fontSize: 12,
        marginTop: -spacing.sm,
        marginBottom: spacing.sm,
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
