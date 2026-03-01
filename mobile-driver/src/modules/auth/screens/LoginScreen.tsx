import React, { useState } from 'react';
import {
    View, Text, TextInput, StyleSheet, TouchableOpacity,
    KeyboardAvoidingView, Platform, ScrollView, ActivityIndicator, Alert,
    SafeAreaView, Dimensions
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { authService } from '../../../services/auth.service';
import { useAuthStore } from '../../../store/auth.store';
import { FadeInView } from '../../../components/FadeInView';

const { width, height } = Dimensions.get('window');

type LoginScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
    const navigation = useNavigation<LoginScreenNavigationProp>();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
    const setAuth = useAuthStore(state => state.setAuth);

    const handleLogin = async () => {
        setError('');
        setFieldErrors({});

        if (!email.trim() || !password) {
            setError('Please enter both email and password.');
            return;
        }

        setIsLoading(true);

        try {
            const response = await authService.login(email.trim(), password);

            if (response.data?.access_token) {
                const { access_token, refresh_token, ...userData } = response.data;
                await setAuth(
                    { id: userData.id, name: userData.name, email: userData.email, role: userData.role },
                    access_token,
                    refresh_token,
                );
            }
        } catch (err: any) {
            const status = err.response?.status;
            const data = err.response?.data;
            const message = data?.message || 'Login failed. Please check your credentials.';

            if (status === 422 && data?.errors) {
                setFieldErrors(data.errors);
                setError('Please fix the errors below.');
            } else if (status === 403) {
                if (message.includes('drivers only')) {
                    Alert.alert(
                        'Access Restricted',
                        'This app is for drivers only.',
                        [{ text: 'OK' }],
                    );
                } else if (message.includes('Email not verified')) {
                    navigation.navigate('EmailVerification', { email: email.trim() });
                } else {
                    setError(message);
                }
            } else {
                setError(message);
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
                            <Text style={styles.title}>Login</Text>
                            <Text style={styles.subtitle}>Welcome back to TareeqK</Text>
                        </FadeInView>

                        <FadeInView delay={200} style={styles.card}>
                            <View style={styles.form}>
                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Email Address</Text>
                                    <View style={[styles.inputContainer, fieldErrors.email && styles.inputError]}>
                                        <Text style={styles.inputIcon}>📧</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your email"
                                            placeholderTextColor={colors.textSecondary}
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            value={email}
                                            onChangeText={(text) => { setEmail(text); setFieldErrors(prev => ({ ...prev, email: [] })); }}
                                            editable={!isLoading}
                                        />
                                    </View>
                                    {fieldErrors.email?.map((msg, i) => (
                                        <Text key={i} style={styles.fieldError}>{msg}</Text>
                                    ))}
                                </View>

                                <View style={styles.inputGroup}>
                                    <Text style={styles.label}>Password</Text>
                                    <View style={[styles.inputContainer, fieldErrors.password && styles.inputError]}>
                                        <Text style={styles.inputIcon}>🔒</Text>
                                        <TextInput
                                            style={styles.input}
                                            placeholder="Enter your password"
                                            placeholderTextColor={colors.textSecondary}
                                            secureTextEntry={!showPassword}
                                            value={password}
                                            onChangeText={(text) => { setPassword(text); setFieldErrors(prev => ({ ...prev, password: [] })); }}
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
                                </View>

                                <TouchableOpacity
                                    style={styles.forgotPassword}
                                    onPress={() => navigation.navigate('ForgotPassword')}
                                    disabled={isLoading}
                                >
                                    <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                                </TouchableOpacity>

                                {error ? <Text style={styles.errorText}>{error}</Text> : null}

                                <TouchableOpacity
                                    style={[styles.primaryButton, isLoading && styles.disabledButton]}
                                    onPress={handleLogin}
                                    disabled={isLoading}
                                    activeOpacity={0.8}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color={colors.white} />
                                    ) : (
                                        <Text style={styles.primaryButtonText}>Login</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </FadeInView>

                        <FadeInView delay={400} style={styles.footer}>
                            <Text style={styles.footerText}>Don't have an account? </Text>
                            <TouchableOpacity onPress={() => navigation.navigate('Register')} disabled={isLoading}>
                                <Text style={styles.footerLink}>Register Here</Text>
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
    eyeButton: {
        padding: spacing.sm,
    },
    eyeButtonText: {
        fontSize: 20,
    },
    inputError: {
        borderColor: colors.error,
        backgroundColor: colors.error + '05',
    },
    fieldError: {
        color: colors.error,
        fontSize: 12,
        fontWeight: '600',
        marginTop: 4,
        marginLeft: 4,
    },
    forgotPassword: {
        alignSelf: 'flex-end',
        marginBottom: spacing.xl,
    },
    forgotPasswordText: {
        color: colors.primary,
        fontSize: 14,
        fontWeight: '700',
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
});


