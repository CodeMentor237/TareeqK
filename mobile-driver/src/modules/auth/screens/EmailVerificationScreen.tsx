import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';

type EmailVerificationNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'EmailVerification'>;

export default function EmailVerificationScreen() {
    const navigation = useNavigation<EmailVerificationNavigationProp>();

    return (
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
            <View style={styles.header}>
                <Text style={styles.title}>Email Verification</Text>
                <Text style={styles.subtitle}>
                    We have sent an email with a verification link. Please check your inbox and click the link to verify your account.
                </Text>
            </View>

            <View style={styles.actions}>
                <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('OTP')}>
                    <Text style={styles.primaryButtonText}>I have an OTP Code instead</Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Login')}>
                    <Text style={styles.secondaryButtonText}>Back to Login</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        backgroundColor: colors.background,
        padding: spacing.xl,
        justifyContent: 'center',
    },
    header: {
        alignItems: 'center',
        marginBottom: spacing.xxl,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.md,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 16,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 24,
    },
    actions: {
        marginTop: spacing.xl,
    },
    primaryButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
        marginBottom: spacing.md,
    },
    primaryButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '600',
    },
    secondaryButton: {
        backgroundColor: colors.surface,
        paddingVertical: spacing.md,
        borderRadius: 8,
        alignItems: 'center',
    },
    secondaryButtonText: {
        color: colors.primary,
        fontSize: 18,
        fontWeight: '600',
    },
});
