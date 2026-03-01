import React, { useState, useRef } from 'react';
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

type RegisterScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

export default function RegisterScreen() {
    const navigation = useNavigation<RegisterScreenNavigationProp>();
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

    // Refs for focusing next input
    const emailRef = useRef<TextInput>(null);
    const phoneRef = useRef<TextInput>(null);
    const passwordRef = useRef<TextInput>(null);
    const confirmPasswordRef = useRef<TextInput>(null);

    const clearFieldError = (field: string) => {
        setFieldErrors(prev => {
            const updated = { ...prev };
            delete updated[field];
            return updated;
        });
    };

    const handleRegister = async () => {
        setError('');
        setSuccessMessage('');
        setFieldErrors({});

        // Client-side validation
        if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
            return;
        }

        if (password.length < 8) {
            setError('Password must be at least 8 characters.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.register({
                name: name.trim(),
                email: email.trim(),
                phone: phone.trim(),
                password,
                password_confirmation: confirmPassword,
                role: 'driver',
            });

            setSuccessMessage(response.message || 'Registration successful!');

            // Navigate to email verification after a brief delay to show success
            const registeredEmail = response.data?.email || email.trim();
            setTimeout(() => {
                navigation.navigate('EmailVerification', { email: registeredEmail });
            }, 1000);
        } catch (err: any) {
            const status = err.response?.status;
            const data = err.response?.data;

            if (status === 422 && data?.errors) {
                setFieldErrors(data.errors);
                setError('Please fix the errors below.');
            } else {
                setError(data?.message || 'Registration failed. Please try again.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
        >
            <ScrollView
                contentContainerStyle={styles.scrollContainer}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
            >
                <View style={styles.header}>
                    <Text style={styles.title}>Register</Text>
                    <Text style={styles.subtitle}>Join TareeqK as a Driver today</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>Full Name</Text>
                    <TextInput
                        style={[styles.input, fieldErrors.name && styles.inputError]}
                        placeholder="Enter your full name"
                        placeholderTextColor={colors.textSecondary}
                        value={name}
                        onChangeText={(text) => { setName(text); clearFieldError('name'); }}
                        editable={!isLoading}
                        returnKeyType="next"
                        onSubmitEditing={() => emailRef.current?.focus()}
                        blurOnSubmit={false}
                    />
                    {fieldErrors.name?.map((msg, i) => (
                        <Text key={i} style={styles.fieldError}>{msg}</Text>
                    ))}

                    <Text style={styles.label}>Email Address</Text>
                    <TextInput
                        ref={emailRef}
                        style={[styles.input, fieldErrors.email && styles.inputError]}
                        placeholder="Enter your email"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={email}
                        onChangeText={(text) => { setEmail(text); clearFieldError('email'); }}
                        editable={!isLoading}
                        returnKeyType="next"
                        onSubmitEditing={() => phoneRef.current?.focus()}
                        blurOnSubmit={false}
                    />
                    {fieldErrors.email?.map((msg, i) => (
                        <Text key={i} style={styles.fieldError}>{msg}</Text>
                    ))}

                    <Text style={styles.label}>Phone Number</Text>
                    <TextInput
                        ref={phoneRef}
                        style={[styles.input, fieldErrors.phone && styles.inputError]}
                        placeholder="Enter your phone number"
                        placeholderTextColor={colors.textSecondary}
                        keyboardType="phone-pad"
                        value={phone}
                        onChangeText={(text) => { setPhone(text); clearFieldError('phone'); }}
                        editable={!isLoading}
                        returnKeyType="next"
                        onSubmitEditing={() => passwordRef.current?.focus()}
                        blurOnSubmit={false}
                    />
                    {fieldErrors.phone?.map((msg, i) => (
                        <Text key={i} style={styles.fieldError}>{msg}</Text>
                    ))}

                    <Text style={styles.label}>Password</Text>
                    <View style={[styles.passwordContainer, fieldErrors.password && styles.inputError]}>
                        <TextInput
                            ref={passwordRef}
                            style={styles.passwordInput}
                            placeholder="Create a password (min. 8 characters)"
                            placeholderTextColor={colors.textSecondary}
                            secureTextEntry={!showPassword}
                            value={password}
                            onChangeText={(text) => { setPassword(text); clearFieldError('password'); }}
                            editable={!isLoading}
                            returnKeyType="next"
                            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                            blurOnSubmit={false}
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
                            ref={confirmPasswordRef}
                            style={styles.passwordInput}
                            placeholder="Confirm your password"
                            placeholderTextColor={colors.textSecondary}
                            secureTextEntry={!showConfirmPassword}
                            value={confirmPassword}
                            onChangeText={setConfirmPassword}
                            editable={!isLoading}
                            returnKeyType="done"
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
                        onPress={handleRegister}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.primaryButtonText}>Register</Text>
                        )}
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Already have an account? </Text>
                    <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
                        <Text style={styles.footerLink}>Login</Text>
                    </TouchableOpacity>
                </View>

                {/* Extra padding at the bottom so keyboard doesn't cover last fields */}
                <View style={styles.keyboardSpacer} />
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
        paddingBottom: spacing.xxl,
    },
    header: {
        marginBottom: spacing.lg,
        marginTop: spacing.xl,
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
    },
    form: {
        marginBottom: spacing.lg,
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
        marginBottom: spacing.md,
        backgroundColor: colors.surface,
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
    passwordContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 8,
        backgroundColor: colors.surface,
        marginBottom: spacing.md,
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
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
        marginTop: spacing.md,
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
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
        textAlign: 'center',
    },
    successText: {
        color: colors.primary,
        fontSize: 14,
        marginTop: spacing.sm,
        marginBottom: spacing.xs,
        textAlign: 'center',
        fontWeight: '600',
    },
    footer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: spacing.lg,
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
    keyboardSpacer: {
        height: 40,
    },
});
