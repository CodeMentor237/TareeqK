import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, Linking, SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { driverService, TowingRequest } from '../../../services/driver.service';
import { useDriverStore } from '../../../store/driver.store';

type OngoingNavigationProp = NativeStackNavigationProp<RootStackParamList, 'OngoingRequest'>;
type OngoingRouteProp = RouteProp<RootStackParamList, 'OngoingRequest'>;

export default function OngoingRequestScreen() {
    const navigation = useNavigation<OngoingNavigationProp>();
    const route = useRoute<OngoingRouteProp>();
    const { trackingId } = route.params;

    const currentRequest = useDriverStore(state => state.currentRequest);
    const setCurrentRequest = useDriverStore(state => state.setCurrentRequest);
    const setAvailable = useDriverStore(state => state.setAvailable);

    const [request, setRequest] = useState<TowingRequest | null>(currentRequest);
    const [isLoading, setIsLoading] = useState(!currentRequest);
    const [isCompleting, setIsCompleting] = useState(false);

    useEffect(() => {
        loadRequest();
    }, []);

    const loadRequest = async () => {
        setIsLoading(true);
        try {
            const response = await driverService.getCurrentRequest();
            if (response.data) {
                setRequest(response.data);
                setCurrentRequest(response.data);
            }
        } catch {
            Alert.alert('Error', 'Failed to load request details.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleComplete = async () => {
        Alert.alert(
            'Complete Request',
            'Are you sure you want to mark this towing as completed?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Complete',
                    style: 'default',
                    onPress: async () => {
                        setIsCompleting(true);
                        try {
                            await driverService.updateRequestStatus(trackingId, 'completed');
                            setCurrentRequest(null);
                            setAvailable(true);
                            Alert.alert('Success', 'Request completed! You are now available for new requests.', [
                                { text: 'OK', onPress: () => navigation.popToTop() },
                            ]);
                        } catch (err: any) {
                            Alert.alert('Error', err.response?.data?.message || 'Failed to complete request.');
                        } finally {
                            setIsCompleting(false);
                        }
                    },
                },
            ],
        );
    };

    const openInGoogleMaps = (lat: number, lng: number) => {
        const url = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=driving`;
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open Google Maps.'));
    };

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    if (!request) {
        return (
            <View style={styles.loadingContainer}>
                <Text style={styles.errorText}>Request not found.</Text>
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={styles.linkText}>Go Back</Text>
                </TouchableOpacity>
            </View>
        );
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <View style={styles.headerTitleWrapper}>
                    <Text style={styles.headerTitle}>Active Journey</Text>
                    <Text style={styles.headerSubtitle}>#{request.id.slice(0, 8).toUpperCase()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: colors.success + '15' }]}>
                    <Text style={[styles.statusBadgeText, { color: colors.success }]}>
                        IN PROGRESS
                    </Text>
                </View>
            </View>

            <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
                <View style={styles.banner}>
                    <Text style={styles.bannerEmoji}>🚛</Text>
                    <Text style={styles.bannerTitle}>Towing to Destination</Text>
                    <Text style={styles.bannerSubtitle}>Please follow the route in Google Maps</Text>
                </View>

                {/* Destination Card */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Destination Details</Text>
                    <View style={styles.addressWrapper}>
                        <View style={styles.addressItem}>
                            <View style={[styles.marker, { backgroundColor: colors.primary }]} />
                            <View style={styles.addressInfo}>
                                <Text style={styles.addressLabel}>Drop-off Location</Text>
                                <Text style={styles.addressText}>{request.destination.address || 'Selected Location'}</Text>
                                <TouchableOpacity
                                    style={styles.mapBtn}
                                    onPress={() => openInGoogleMaps(request.destination.lat, request.destination.lng)}
                                >
                                    <Text style={styles.mapBtnText}>🛰️ Start Live Navigation</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Customer Contact */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Contact Customer</Text>
                    <View style={styles.contactRow}>
                        <View style={styles.avatarMini}>
                            <Text style={styles.avatarMiniText}>{request.customer_name.charAt(0)}</Text>
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={styles.customerName}>{request.customer_name}</Text>
                            <Text style={styles.vehicleType}>{request.vehicle_type}</Text>
                        </View>
                        <TouchableOpacity
                            style={styles.callBtn}
                            onPress={() => Linking.openURL(`tel:${request.customer_phone}`)}
                        >
                            <Text style={styles.callBtnText}>📞 Call</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* Action Footer */}
                <View style={styles.footer}>
                    <TouchableOpacity
                        style={[styles.completeBtn, isCompleting && styles.disabledButton]}
                        onPress={handleComplete}
                        disabled={isCompleting}
                    >
                        {isCompleting ? (
                            <ActivityIndicator color={colors.white} />
                        ) : (
                            <Text style={styles.completeBtnText}>FINISH & COMPLETE JOB</Text>
                        )}
                    </TouchableOpacity>
                    <Text style={styles.footerHint}>Only mark as completed once the vehicle is delivered and unloaded.</Text>
                </View>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    flex: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
        paddingVertical: spacing.lg,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
    },
    backButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#F1F3F5',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    backButtonText: {
        fontSize: 24,
        color: colors.text,
        fontWeight: 'bold',
    },
    headerTitleWrapper: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 18,
        fontWeight: '900',
        color: colors.text,
    },
    headerSubtitle: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 8,
    },
    statusBadgeText: {
        fontSize: 10,
        fontWeight: '900',
    },
    scrollContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
    },
    banner: {
        alignItems: 'center',
        marginBottom: spacing.xl,
        marginTop: spacing.sm,
    },
    bannerEmoji: {
        fontSize: 50,
        marginBottom: spacing.md,
    },
    bannerTitle: {
        fontSize: 22,
        fontWeight: '900',
        color: colors.text,
        textAlign: 'center',
    },
    bannerSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: 4,
        fontWeight: '500',
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: spacing.xl,
        marginBottom: spacing.lg,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardTitle: {
        fontSize: 14,
        fontWeight: '900',
        color: colors.textSecondary,
        marginBottom: spacing.lg,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    addressWrapper: {
        position: 'relative',
    },
    marker: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 15,
        marginTop: 5,
    },
    addressItem: {
        flexDirection: 'row',
        alignItems: 'flex-start',
    },
    addressInfo: {
        flex: 1,
    },
    addressLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textSecondary,
        textTransform: 'uppercase',
    },
    addressText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
        marginTop: 4,
    },
    mapBtn: {
        marginTop: spacing.lg,
        backgroundColor: colors.primary,
        paddingVertical: 12,
        borderRadius: 12,
        alignItems: 'center',
    },
    mapBtnText: {
        fontSize: 14,
        color: colors.white,
        fontWeight: '800',
    },
    contactRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: spacing.md,
    },
    avatarMini: {
        width: 44,
        height: 44,
        borderRadius: 22,
        backgroundColor: '#F1F3F5',
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarMiniText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: colors.text,
    },
    customerName: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.text,
    },
    vehicleType: {
        fontSize: 13,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    callBtn: {
        backgroundColor: colors.success + '15',
        paddingHorizontal: 15,
        paddingVertical: 10,
        borderRadius: 12,
    },
    callBtnText: {
        color: colors.success,
        fontWeight: '900',
    },
    footer: {
        marginTop: spacing.xl,
        alignItems: 'center',
    },
    completeBtn: {
        width: '100%',
        height: 60,
        backgroundColor: colors.success,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 10,
    },
    completeBtnText: {
        fontSize: 16,
        fontWeight: '900',
        color: colors.white,
        letterSpacing: 1,
    },
    footerHint: {
        fontSize: 12,
        color: colors.textSecondary,
        textAlign: 'center',
        marginTop: spacing.md,
        paddingHorizontal: spacing.xl,
        fontWeight: '500',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F8F9FA',
    },
    errorText: {
        fontSize: 16,
        color: colors.error,
        marginBottom: spacing.md,
        fontWeight: '700',
    },
    linkText: {
        color: colors.primary,
        fontWeight: '700',
        textDecorationLine: 'underline',
    },
    disabledButton: {
        opacity: 0.7,
    },
});
