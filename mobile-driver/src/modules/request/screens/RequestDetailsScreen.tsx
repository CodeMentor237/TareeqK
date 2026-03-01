import React, { useState, useEffect } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, ScrollView,
    ActivityIndicator, Alert, Linking,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RequestStackParamList } from '../../../navigation/RequestStack';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { driverService, TowingRequest } from '../../../services/driver.service';
import { useDriverStore } from '../../../store/driver.store';

type DetailsNavigationProp = NativeStackNavigationProp<RequestStackParamList, 'RequestDetails'>;
type DetailsRouteProp = RouteProp<RequestStackParamList, 'RequestDetails'>;

export default function RequestDetailsScreen() {
    const navigation = useNavigation<DetailsNavigationProp>();
    const route = useRoute<DetailsRouteProp>();
    const { trackingId } = route.params;

    const currentRequest = useDriverStore(state => state.currentRequest);
    const setCurrentRequest = useDriverStore(state => state.setCurrentRequest);
    const [request, setRequest] = useState<TowingRequest | null>(currentRequest);
    const [isLoading, setIsLoading] = useState(!currentRequest);
    const [isStarting, setIsStarting] = useState(false);

    useEffect(() => {
        if (!currentRequest) {
            loadRequest();
        }
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

    const handleStartTowing = async () => {
        setIsStarting(true);
        try {
            const response = await driverService.updateRequestStatus(trackingId, 'in_progress');
            if (response.data) {
                setCurrentRequest(response.data);
                navigation.replace('OngoingRequest', { trackingId });
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to start towing.');
        } finally {
            setIsStarting(false);
        }
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
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            <View style={styles.header}>
                <Text style={styles.title}>Request Details</Text>
                <Text style={styles.trackingId}>#{request.id}</Text>
            </View>

            {/* Customer Info */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Customer</Text>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Name:</Text>
                    <Text style={styles.infoValue}>{request.customer_name}</Text>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Phone:</Text>
                    <TouchableOpacity onPress={() => Linking.openURL(`tel:${request.customer_phone}`)}>
                        <Text style={[styles.infoValue, styles.linkText]}>{request.customer_phone}</Text>
                    </TouchableOpacity>
                </View>
                <View style={styles.infoRow}>
                    <Text style={styles.infoLabel}>Vehicle:</Text>
                    <Text style={styles.infoValue}>{request.vehicle_type}</Text>
                </View>
            </View>

            {/* Pickup Location */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Pickup Location</Text>
                <Text style={styles.addressText}>
                    {request.pickup.address || `${request.pickup.lat}, ${request.pickup.lng}`}
                </Text>
                <TouchableOpacity
                    style={styles.mapsButton}
                    onPress={() => openInGoogleMaps(request.pickup.lat, request.pickup.lng)}
                >
                    <Text style={styles.mapsButtonText}>🗺️ Navigate to Pickup</Text>
                </TouchableOpacity>
            </View>

            {/* Destination */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Destination</Text>
                <Text style={styles.addressText}>
                    {request.destination.address || `${request.destination.lat}, ${request.destination.lng}`}
                </Text>
                <TouchableOpacity
                    style={styles.mapsButton}
                    onPress={() => openInGoogleMaps(request.destination.lat, request.destination.lng)}
                >
                    <Text style={styles.mapsButtonText}>🗺️ Navigate to Destination</Text>
                </TouchableOpacity>
            </View>

            {/* Note */}
            {request.note ? (
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Note</Text>
                    <Text style={styles.noteText}>{request.note}</Text>
                </View>
            ) : null}

            {/* Action */}
            {request.status === 'accepted' && (
                <TouchableOpacity
                    style={[styles.startButton, isStarting && styles.disabledButton]}
                    onPress={handleStartTowing}
                    disabled={isStarting}
                >
                    {isStarting ? (
                        <ActivityIndicator color={colors.white} />
                    ) : (
                        <Text style={styles.startButtonText}>🚛 Start Towing</Text>
                    )}
                </TouchableOpacity>
            )}
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    contentContainer: {
        padding: spacing.lg,
        paddingTop: spacing.xxl,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.text,
    },
    trackingId: {
        fontSize: 14,
        color: colors.primary,
        fontWeight: '600',
        backgroundColor: colors.surface,
        paddingHorizontal: spacing.sm,
        paddingVertical: 4,
        borderRadius: 6,
    },
    section: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    infoRow: {
        flexDirection: 'row',
        marginBottom: spacing.xs,
    },
    infoLabel: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.textSecondary,
        width: 80,
    },
    infoValue: {
        fontSize: 14,
        color: colors.text,
        flex: 1,
    },
    addressText: {
        fontSize: 14,
        color: colors.text,
        marginBottom: spacing.sm,
        lineHeight: 20,
    },
    noteText: {
        fontSize: 14,
        color: colors.text,
        lineHeight: 20,
    },
    mapsButton: {
        backgroundColor: colors.surface,
        paddingVertical: spacing.sm,
        borderRadius: 8,
        alignItems: 'center',
    },
    mapsButtonText: {
        fontSize: 14,
        fontWeight: '600',
        color: colors.primary,
    },
    startButton: {
        backgroundColor: colors.primary,
        paddingVertical: spacing.md,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: spacing.md,
    },
    startButtonText: {
        color: colors.white,
        fontSize: 18,
        fontWeight: '700',
    },
    disabledButton: {
        opacity: 0.7,
    },
    errorText: {
        fontSize: 16,
        color: colors.error,
        marginBottom: spacing.md,
    },
    linkText: {
        color: colors.primary,
        textDecorationLine: 'underline',
    },
});
