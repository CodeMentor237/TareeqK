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

type DetailsNavigationProp = NativeStackNavigationProp<RootStackParamList, 'RequestDetails'>;
type DetailsRouteProp = RouteProp<RootStackParamList, 'RequestDetails'>;

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
        loadRequest();
    }, []);

    const loadRequest = async () => {
        setIsLoading(true);
        try {
            const response = await driverService.getRequestDetails(trackingId);
            if (response.data) {
                setRequest(response.data);
                // Only update currentRequest in store if it's an active one
                if (['accepted', 'in_progress'].includes(response.data.status)) {
                    setCurrentRequest(response.data);
                }
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
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
                    <Text style={styles.backButtonText}>←</Text>
                </TouchableOpacity>
                <View>
                    <Text style={styles.headerTitle}>Job Details</Text>
                    <Text style={styles.headerSubtitle}>#{request.id.slice(0, 8).toUpperCase()}</Text>
                </View>
                <View style={[styles.statusBadge, { backgroundColor: request.status === 'accepted' ? colors.primary + '15' : colors.success + '15' }]}>
                    <Text style={[styles.statusBadgeText, { color: request.status === 'accepted' ? colors.primary : colors.success }]}>
                        {request.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <ScrollView style={styles.flex} contentContainerStyle={styles.scrollContent}>
                {/* Journey Section */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Journey Details</Text>
                    <View style={styles.addressWrapper}>
                        <View style={styles.timelineLine} />
                        <View style={styles.addressItem}>
                            <View style={[styles.marker, { backgroundColor: colors.success }]} />
                            <View style={styles.addressInfo}>
                                <Text style={styles.addressLabel}>Pickup Location</Text>
                                <Text style={styles.addressText}>{request.pickup.address || 'Selected Location'}</Text>
                                <TouchableOpacity
                                    style={styles.mapLink}
                                    onPress={() => openInGoogleMaps(request.pickup.lat, request.pickup.lng)}
                                >
                                    <Text style={styles.mapLinkText}>🗺️ Open in Google Maps</Text>
                                </TouchableOpacity>
                            </View>
                        </View>

                        <View style={[styles.addressItem, { marginTop: spacing.lg }]}>
                            <View style={[styles.marker, { backgroundColor: colors.primary }]} />
                            <View style={styles.addressInfo}>
                                <Text style={styles.addressLabel}>Destination</Text>
                                <Text style={styles.addressText}>{request.destination.address || 'Selected Location'}</Text>
                                <TouchableOpacity
                                    style={styles.mapLink}
                                    onPress={() => openInGoogleMaps(request.destination.lat, request.destination.lng)}
                                >
                                    <Text style={styles.mapLinkText}>🗺️ Open in Google Maps</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </View>

                {/* Customer & Vehicle Info */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Customer & Vehicle</Text>
                    <View style={styles.horizontalInfo}>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoBoxLabel}>Customer</Text>
                            <Text style={styles.infoBoxValue}>{request.customer_name}</Text>
                            <TouchableOpacity onPress={() => Linking.openURL(`tel:${request.customer_phone}`)}>
                                <Text style={styles.phoneText}>{request.customer_phone}</Text>
                            </TouchableOpacity>
                        </View>
                        <View style={styles.infoBox}>
                            <Text style={styles.infoBoxLabel}>Vehicle Type</Text>
                            <Text style={styles.infoBoxValue}>{request.vehicle_type}</Text>
                        </View>
                    </View>
                    {request.note ? (
                        <View style={styles.noteBox}>
                            <Text style={styles.noteLabel}>Driver Note:</Text>
                            <Text style={styles.noteText}>{request.note}</Text>
                        </View>
                    ) : null}
                </View>

                {/* Tracking Timeline */}
                <View style={styles.card}>
                    <Text style={styles.cardTitle}>Tracking Timeline</Text>
                    <View style={styles.timelineContainer}>
                        {request.logs?.map((log, index) => {
                            const isLast = index === (request.logs?.length || 0) - 1;
                            return (
                                <View key={index} style={styles.timelineItem}>
                                    <View style={styles.timelineLeft}>
                                        <View style={[styles.timelineDot, log.status === request.status && styles.activeDot]} />
                                        {!isLast && <View style={styles.timelineConnector} />}
                                    </View>
                                    <View style={styles.timelineRight}>
                                        <View style={styles.timelineHeader}>
                                            <Text style={[styles.timelineStatus, log.status === request.status && styles.activeStatusText]}>
                                                {log.status.replace('_', ' ').toUpperCase()}
                                            </Text>
                                            <Text style={styles.timelineTime}>
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </Text>
                                        </View>
                                        <Text style={styles.timelineUpdateBy}>Updated by {log.updated_by}</Text>
                                    </View>
                                </View>
                            );
                        })}
                    </View>
                </View>

                {/* Footer Action */}
                {request.status === 'accepted' && (
                    <View style={styles.footer}>
                        <TouchableOpacity
                            style={[styles.startBtn, isStarting && styles.disabledButton]}
                            onPress={handleStartTowing}
                            disabled={isStarting}
                        >
                            {isStarting ? (
                                <ActivityIndicator color={colors.white} />
                            ) : (
                                <Text style={styles.startBtnText}>START TOWING JOURNEY</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                )}
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
        marginLeft: 'auto',
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
        fontSize: 15,
        fontWeight: '900',
        color: colors.text,
        marginBottom: spacing.xl,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    addressWrapper: {
        position: 'relative',
    },
    timelineLine: {
        position: 'absolute',
        top: 10,
        left: 5,
        bottom: 10,
        width: 2,
        backgroundColor: '#F1F3F5',
        borderStyle: 'dashed',
    },
    marker: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 15,
        marginTop: 5,
        zIndex: 1,
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
    mapLink: {
        marginTop: 8,
    },
    mapLinkText: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: '700',
    },
    horizontalInfo: {
        flexDirection: 'row',
        gap: spacing.lg,
    },
    infoBox: {
        flex: 1,
    },
    infoBoxLabel: {
        fontSize: 11,
        fontWeight: '700',
        color: colors.textSecondary,
        textTransform: 'uppercase',
    },
    infoBoxValue: {
        fontSize: 15,
        fontWeight: '800',
        color: colors.text,
        marginTop: 4,
    },
    phoneText: {
        fontSize: 13,
        color: colors.primary,
        fontWeight: '700',
        marginTop: 2,
        textDecorationLine: 'underline',
    },
    noteBox: {
        marginTop: spacing.lg,
        padding: spacing.md,
        backgroundColor: '#FFF9C4',
        borderRadius: 12,
    },
    noteLabel: {
        fontSize: 12,
        fontWeight: '700',
        color: '#F57F17',
    },
    noteText: {
        fontSize: 14,
        color: colors.text,
        marginTop: 2,
        fontStyle: 'italic',
    },
    timelineContainer: {
        marginTop: spacing.sm,
    },
    timelineItem: {
        flexDirection: 'row',
        minHeight: 60,
    },
    timelineLeft: {
        width: 30,
        alignItems: 'center',
    },
    timelineDot: {
        width: 10,
        height: 10,
        borderRadius: 5,
        backgroundColor: '#DEE2E6',
        marginTop: 5,
    },
    activeDot: {
        backgroundColor: colors.primary,
        width: 14,
        height: 14,
        borderRadius: 7,
        marginTop: 3,
        borderWidth: 3,
        borderColor: colors.primary + '30',
    },
    timelineConnector: {
        flex: 1,
        width: 2,
        backgroundColor: '#F1F3F5',
        marginVertical: 4,
    },
    timelineRight: {
        flex: 1,
        paddingLeft: spacing.sm,
        paddingBottom: spacing.lg,
    },
    timelineHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    timelineStatus: {
        fontSize: 13,
        fontWeight: '800',
        color: colors.textSecondary,
    },
    activeStatusText: {
        color: colors.text,
    },
    timelineTime: {
        fontSize: 11,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    timelineUpdateBy: {
        fontSize: 12,
        color: colors.textSecondary,
        marginTop: 2,
    },
    footer: {
        marginTop: spacing.lg,
    },
    startBtn: {
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
    startBtnText: {
        fontSize: 16,
        fontWeight: '900',
        color: colors.white,
        letterSpacing: 1,
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
