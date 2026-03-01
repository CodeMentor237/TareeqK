import React, { useState } from 'react';
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
            await authService.resetPassword({
                email,
                otp,
                password,
                password_confirmation: confirmPassword,
            });

            setSuccessMessage('Password updated successfully!');
            setTimeout(() => {
                navigation.navigate('Login');
            }, 2000);
        } catch (err: any) {
            const status = err.response?.status;
            const data = err.response?.data;

            if (status === 422 && data?.errors) {
                setFieldErrors(data.errors);
                setError('Please fix the errors below.');
            } else {
                setError(data?.message || 'Password reset failed.');
            }
        } finally {
            setIsLoading(false);
        }
    };

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
                            <Text style={styles.title}>New Password</Text>
                            <Text style={styles.subtitle}>Secure your account</Text>
                        </FadeInView>

                        <FadeInView delay={200} style={styles.card}>
                            <View style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Create Password</Text>
                                    <View style={[styles.inputContainer, fieldErrors.password && styles.inputError]}>
                                        <Text style={styles.inputIcon}>🔒</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="min. 8 characters"
                                            placeholderTextColor={colors.textSecondary}
                                            secureTextEntry={!showPassword}
                                            value={password}
                                            onChangeText={(text) => { setPassword(text); setError(''); }}
                                            editable={!isLoading}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                    {fieldErrors.password?.map((msg, i) => (
                                        <Text key={i} style={styles.fieldError}>{msg}</Text>
                                    ))}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Confirm New Password</Text>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputIcon}>🛡️</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Repeat new password"
                                            placeholderTextColor={colors.textSecondary}
                                            secureTextEntry={!showConfirmPassword}
                                            value={confirmPassword}
                                            onChangeText={(text) => { setConfirmPassword(text); setError(''); }}
                                            editable={!isLoading}
                                        />
                                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            <Text style={styles.eyeIcon}>{showConfirmPassword ? '🙈' : '👁'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                {successMessage ? <Text style={styles.successText}>{successMessage}</Text> : null}
                                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                                <TouchableOpacity
                                    style={[styles.primaryButton, isLoading && styles.disabledButton]}
                                    onPress={handleResetPassword}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color={colors.white} />
                                    ) : (
                                        <Text style={styles.primaryButtonText}>Update Password</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </FadeInView>

                        <FadeInView delay={400} style={styles.footer}>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
                                <Text style={styles.footerLink}>Cancel and Login</Text>
                            </TouchableOpacity>
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
    inputGroup: {
        marginBottom: spacing.lg,
    },
    label: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.xs,
        marginLeft: 4,
    },
    inputContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
        borderWidth: 1.5,
        borderColor: '#EDF2F7',
        borderRadius: 16,
        paddingHorizontal: spacing.md,
    },
    inputIcon: {
        fontSize: 18,
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: 14,
        fontSize: 16,
        color: colors.text,
        fontWeight: '500',
    },
    eyeIcon: {
        fontSize: 20,
        padding: 4,
    },
    inputError: {
        borderColor: colors.error,
    },
    fieldError: {
        color: colors.error,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
        marginLeft: 4,
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
        marginTop: spacing.xxl,
        alignItems: 'center',
    },
    footerLink: {
        fontSize: 16,
        color: colors.primary,
        fontWeight: '800',
    },
});
