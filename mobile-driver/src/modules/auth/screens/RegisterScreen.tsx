import React, { useState, useRef } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator,
    SafeAreaView, Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { authService } from '../../../services/auth.service';
import { FadeInView } from '../../../components/FadeInView';

const { width, height } = Dimensions.get('window');

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

        if (!name.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
            setError('Please fill in all fields.');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match.');
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
            setTimeout(() => {
                navigation.navigate('EmailVerification', { email: email.trim() });
            }, 1000);
        } catch (err: any) {
            const status = err.response?.status;
            const data = err.response?.data;

            if (status === 422 && data?.errors) {
                setFieldErrors(data.errors);
                setError('Please fix the errors below.');
            } else {
                setError(data?.message || 'Registration failed.');
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
                    <ScrollView
                        contentContainerStyle={styles.scrollContainer}
                        showsVerticalScrollIndicator={false}
                        keyboardShouldPersistTaps="handled"
                    >
                        <FadeInView style={styles.header}>
                            <TouchableOpacity
                                style={styles.backButton}
                                onPress={() => navigation.goBack()}
                            >
                                <Text style={styles.backButtonText}>←</Text>
                            </TouchableOpacity>
                            <Text style={styles.title}>Register</Text>
                            <Text style={styles.subtitle}>Join our driver network</Text>
                        </FadeInView>

                        <FadeInView delay={200} style={styles.card}>
                            <View style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Full Name</Text>
                                    <View style={[styles.inputContainer, fieldErrors.name && styles.inputError]}>
                                        <Text style={styles.inputIcon}>👤</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your name"
                                            placeholderTextColor={colors.textSecondary}
                                            value={name}
                                            onChangeText={(text) => { setName(text); clearFieldError('name'); }}
                                            editable={!isLoading}
                                            returnKeyType="next"
                                            onSubmitEditing={() => emailRef.current?.focus()}
                                        />
                                    </View>
                                    {fieldErrors.name?.map((msg, i) => (
                                        <Text key={i} style={styles.fieldError}>{msg}</Text>
                                    ))}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={[styles.inputContainer, fieldErrors.email && styles.inputError]}>
                                        <Text style={styles.inputIcon}>📧</Text>
                                        <TextInput
                                            ref={emailRef}
                                            style={styles.input}
                                            placeholder="Enter your email"
                                            placeholderTextColor={colors.textSecondary}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            value={email}
                                            onChangeText={(text) => { setEmail(text); clearFieldError('email'); }}
                                            editable={!isLoading}
                                            returnKeyType="next"
                                            onSubmitEditing={() => phoneRef.current?.focus()}
                                        />
                                    </View>
                                    {fieldErrors.email?.map((msg, i) => (
                                        <Text key={i} style={styles.fieldError}>{msg}</Text>
                                    ))}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Phone Number</Text>
                                    <View style={[styles.inputContainer, fieldErrors.phone && styles.inputError]}>
                                        <Text style={styles.inputIcon}>📞</Text>
                                        <TextInput
                                            ref={phoneRef}
                                            style={styles.input}
                                            placeholder="Enter phone number"
                                            placeholderTextColor={colors.textSecondary}
                                            keyboardType="phone-pad"
                                            value={phone}
                                            onChangeText={(text) => { setPhone(text); clearFieldError('phone'); }}
                                            editable={!isLoading}
                                            returnKeyType="next"
                                            onSubmitEditing={() => passwordRef.current?.focus()}
                                        />
                                    </View>
                                    {fieldErrors.phone?.map((msg, i) => (
                                        <Text key={i} style={styles.fieldError}>{msg}</Text>
                                    ))}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={[styles.inputContainer, fieldErrors.password && styles.inputError]}>
                                        <Text style={styles.inputIcon}>🔒</Text>
                                        <TextInput
                                            ref={passwordRef}
                                            style={styles.input}
                                            placeholder="min. 8 characters"
                                            placeholderTextColor={colors.textSecondary}
                                            secureTextEntry={!showPassword}
                                            value={password}
                                            onChangeText={(text) => { setPassword(text); clearFieldError('password'); }}
                                            editable={!isLoading}
                                            returnKeyType="next"
                                            onSubmitEditing={() => confirmPasswordRef.current?.focus()}
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁'}</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Confirm Password</Text>
                                    <View style={styles.inputContainer}>
                                        <Text style={styles.inputIcon}>🛡️</Text>
                                        <TextInput
                                            ref={confirmPasswordRef}
                                            style={styles.input}
                                            placeholder="Repeat password"
                                            placeholderTextColor={colors.textSecondary}
                                            secureTextEntry={!showConfirmPassword}
                                            value={confirmPassword}
                                            onChangeText={setConfirmPassword}
                                            editable={!isLoading}
                                            returnKeyType="done"
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
                                    onPress={handleRegister}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color={colors.white} />
                                    ) : (
                                        <Text style={styles.primaryButtonText}>Register</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </FadeInView>

                        <FadeInView delay={400} style={styles.footer}>
                            <Text style={styles.footerText}>Already have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Login')} disabled={isLoading}>
                                <Text style={styles.footerLink}>Login</Text>
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
        height: height * 0.3,
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
        paddingBottom: spacing.xxl,
    },
    header: {
        marginTop: 10,
        marginBottom: spacing.xl,
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(255, 255, 255, 0.2)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.md,
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
        marginBottom: spacing.md,
    },
    label: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 6,
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
        fontSize: 16,
        marginRight: spacing.sm,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 15,
        color: colors.text,
        fontWeight: '500',
    },
    eyeIcon: {
        fontSize: 18,
        padding: 4,
    },
    inputError: {
        borderColor: colors.error,
    },
    fieldError: {
        color: colors.error,
        fontSize: 11,
        fontWeight: '600',
        marginTop: 2,
        marginLeft: 4,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: 16,
        borderRadius: 16,
        alignItems: 'center',
        marginTop: spacing.lg,
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
        marginTop: spacing.sm,
        textAlign: 'center',
        fontWeight: '600',
    },
    successText: {
        color: colors.primary,
        fontSize: 14,
        marginTop: spacing.sm,
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
        fontSize: 15,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    footerLink: {
        fontSize: 15,
        color: colors.primary,
        fontWeight: '800',
    },
});
