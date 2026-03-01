import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { AuthStackParamList } from '../../../navigation/AuthStack';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { FadeInView } from '../../../components/FadeInView';

const { width } = Dimensions.get('window');

type WelcomeScreenNavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Welcome'>;

export default function WelcomeScreen() {
    const navigation = useNavigation<WelcomeScreenNavigationProp>();

    return (
        <View style={styles.container}>
            {/* Background Gradient Mockups */}
            <View style={styles.gradientTop} />
            <View style={styles.curvedDivider} />
            <View style={styles.gradientBottom} />

            <SafeAreaView style={styles.safeArea}>
                <View style={styles.content}>
                    <FadeInView style={styles.header}>
                        <View style={styles.logoContainer}>
                            <Text style={styles.logoEmoji}>🚛</Text>
                        </View>
                        <Text style={styles.title}>TareeqK</Text>
                        <Text style={styles.subtitle}>Driver Edition</Text>
                    </FadeInView>

                    <FadeInView delay={300} style={styles.descriptionBox}>
                        <Text style={styles.descriptionText}>
                            Empowering drivers to earn reliably while keeping the roads moving.
                        </Text>
                    </FadeInView>

                    <FadeInView delay={600} style={styles.footer}>
                        <TouchableOpacity
                            style={styles.primaryButton}
                            onPress={() => navigation.navigate('Login')}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.primaryButtonText}>Sign In</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.secondaryButton}
                            onPress={() => navigation.navigate('Register')}
                            activeOpacity={0.7}
                        >
                            <Text style={styles.secondaryButtonText}>Create Account</Text>
                        </TouchableOpacity>

                        <Text style={styles.versionText}>v1.0.0</Text>
                    </FadeInView>
                </View>
            </SafeAreaView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.primary,
    },
    gradientTop: {
        position: 'absolute',
        top: 0,
        width: width,
        height: '60%',
        backgroundColor: colors.primary,
        opacity: 0.9,
    },
    gradientBottom: {
        position: 'absolute',
        bottom: 0,
        width: width,
        height: '45%',
        backgroundColor: colors.secondary,
        opacity: 0.8,
    },
    curvedDivider: {
        position: 'absolute',
        bottom: '40%',
        width: width * 1.5,
        height: 150,
        backgroundColor: colors.secondary,
        borderRadius: 1000,
        left: -width * 0.25,
        opacity: 0.8,
        transform: [{ scaleX: 1.2 }],
    },
    safeArea: {
        flex: 1,
    },
    content: {
        flex: 1,
        padding: spacing.xl,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    header: {
        alignItems: 'center',
        marginTop: 60,
    },
    logoContainer: {
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
    logoEmoji: {
        fontSize: 40,
    },
    title: {
        fontSize: 42,
        fontWeight: '900',
        color: colors.white,
        letterSpacing: 1,
    },
    subtitle: {
        fontSize: 18,
        color: colors.white,
        opacity: 0.9,
        fontWeight: '600',
        marginTop: -5,
        textTransform: 'uppercase',
        letterSpacing: 2,
    },
    descriptionBox: {
        width: '100%',
        paddingHorizontal: spacing.xl,
    },
    descriptionText: {
        fontSize: 18,
        color: colors.white,
        textAlign: 'center',
        lineHeight: 28,
        opacity: 0.9,
        fontWeight: '500',
    },
    footer: {
        width: '100%',
        paddingBottom: spacing.lg,
    },
    primaryButton: {
        backgroundColor: colors.white,
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        marginBottom: spacing.md,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
    },
    primaryButtonText: {
        color: colors.primary,
        fontSize: 18,
        fontWeight: '800',
    },
    secondaryButton: {
        backgroundColor: 'rgba(255, 255, 255, 0.15)',
        paddingVertical: 18,
        borderRadius: 16,
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: 'rgba(255, 255, 255, 0.3)',
    },
    secondaryButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '700',
    },
    versionText: {
        color: colors.white,
        textAlign: 'center',
        marginTop: spacing.xl,
        fontSize: 12,
        opacity: 0.5,
    },
});
