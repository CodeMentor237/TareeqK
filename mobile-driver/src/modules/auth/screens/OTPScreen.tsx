import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

type OTPNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'OTP'>;

export default function OTPScreen() {
    const navigation = useNavigation<OTPNavigationProp>();
    const [otp, setOtp] = useState('');

    const handleVerifyOtp = () => {
        // TODO: Implement actual OTP verification logic
        console.log('OTP Verify pressed with:', otp);
        navigation.navigate('Login');
    };

    return (
        <KeyboardAvoidingView
            style={styles.container}
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView contentContainerStyle={styles.scrollContainer} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Text style={styles.title}>Verification</Text>
                    <Text style={styles.subtitle}>Enter the OTP sent to your email or phone.</Text>
                </View>

                <View style={styles.form}>
                    <Text style={styles.label}>OTP Code</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter code"
                        keyboardType="number-pad"
                        value={otp}
                        onChangeText={setOtp}
                        maxLength={6}
                    />

                    <TouchableOpacity style={styles.primaryButton} onPress={handleVerifyOtp}>
                        <Text style={styles.primaryButtonText}>Verify Code</Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Didn't receive the code? </Text>
                    <TouchableOpacity onPress={() => console.log('Resend OTP')}>
                        <Text style={styles.footerLink}>Resend</Text>
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
        textAlign: 'center',
        letterSpacing: 4,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    primaryButtonText: {
        color: colors.white,
        fontSize: 18,
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
});
