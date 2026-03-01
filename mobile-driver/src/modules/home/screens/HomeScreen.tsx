import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    View, Text, StyleSheet, TouchableOpacity, FlatList,
    ActivityIndicator, RefreshControl, Alert, Linking, Modal, ScrollView
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../../../navigation/RootNavigator';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { driverService, TowingRequest } from '../../../services/driver.service';
import { useDriverStore } from '../../../store/driver.store';
import { useAuthStore } from '../../../store/auth.store';

const POLL_INTERVAL = 10000; // 10 seconds

export default function HomeScreen() {
    const navigation = useNavigation<any>(); // Using any for simplicity in navigation across stacks
    const user = useAuthStore(state => state.user);
    const {
        isAvailable, setAvailable,
        availableRequests, setAvailableRequests, removeRequest,
        currentRequest, setCurrentRequest,
    } = useDriverStore();

    const [isToggling, setIsToggling] = useState(false);
    const [isLoadingRequests, setIsLoadingRequests] = useState(false);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState<TowingRequest | null>(null);
    const [isAccepting, setIsAccepting] = useState(false);
    const [isDeclining, setIsDeclining] = useState(false);
    const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Check for current active request on mount
    useEffect(() => {
        checkCurrentRequest();
    }, []);

    // Poll for available requests when online
    useEffect(() => {
        if (isAvailable && !currentRequest) {
            fetchAvailableRequests();
            pollRef.current = setInterval(fetchAvailableRequests, POLL_INTERVAL);
        }

        return () => {
            if (pollRef.current) {
                clearInterval(pollRef.current);
                pollRef.current = null;
            }
        };
    }, [isAvailable, currentRequest]);

    const checkCurrentRequest = async () => {
        try {
            const response = await driverService.getCurrentRequest();
            if (response.data) {
                setCurrentRequest(response.data);
                // Navigate to appropriate screen based on status (on root stack)
                if (response.data.status === 'accepted') {
                    navigation.navigate('RequestDetails', { trackingId: response.data.id });
                } else if (response.data.status === 'in_progress') {
                    navigation.navigate('OngoingRequest', { trackingId: response.data.id });
                }
            }
        } catch {
            // No active request — stay on home
        }
    };

    const fetchAvailableRequests = async () => {
        try {
            const response = await driverService.getAvailableRequests();
            setAvailableRequests(response.data);
        } catch {
            // Silently fail on poll errors
        }
    };

    const handleToggleAvailability = async () => {
        setIsToggling(true);
        try {
            const response = await driverService.toggleAvailability();
            const newAvailable = response.data.is_available;
            setAvailable(newAvailable);

            if (newAvailable) {
                // Immediate refresh when going online
                fetchAvailableRequests();
            } else {
                setAvailableRequests([]);
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to update availability.');
        } finally {
            setIsToggling(false);
        }
    };

    const handleAccept = async (request: TowingRequest) => {
        setIsAccepting(true);
        try {
            const response = await driverService.acceptRequest(request.id);
            if (response.data) {
                setCurrentRequest(response.data);
                setSelectedRequest(null);
                navigation.navigate('RequestDetails', { trackingId: request.id });
            } else {
                Alert.alert('Unavailable', response.message || 'This request is no longer available.');
                removeRequest(request.id);
                setSelectedRequest(null);
            }
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to accept request.');
        } finally {
            setIsAccepting(false);
        }
    };

    const handleDecline = async (request: TowingRequest) => {
        setIsDeclining(true);
        try {
            await driverService.declineRequest(request.id);
            removeRequest(request.id);
            setSelectedRequest(null);
        } catch (err: any) {
            Alert.alert('Error', err.response?.data?.message || 'Failed to decline request.');
        } finally {
            setIsDeclining(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setIsRefreshing(true);
        await fetchAvailableRequests();
        setIsRefreshing(false);
    }, []);

    const openInGoogleMaps = (lat: number, lng: number, label: string) => {
        const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
        Linking.openURL(url).catch(() => Alert.alert('Error', 'Could not open Google Maps.'));
    };

    const renderRequestCard = ({ item }: { item: TowingRequest }) => (
        <TouchableOpacity
            style={styles.requestCard}
            onPress={() => setSelectedRequest(item)}
        >
            <View style={styles.cardHeader}>
                <Text style={styles.cardVehicle}>🚗 {item.vehicle_type}</Text>
                <Text style={styles.cardStatus}>{item.status.toUpperCase()}</Text>
            </View>
            <View style={styles.cardDivider} />
            <Text style={styles.cardAddress} numberOfLines={1}>
                📍 {item.pickup.address || `${item.pickup.lat.toFixed(4)}, ${item.pickup.lng.toFixed(4)}`}
            </Text>
            {item.note ? (
                <Text style={styles.cardNote} numberOfLines={1}>📝 {item.note}</Text>
            ) : null}
            <View style={styles.cardFooterMain}>
                <Text style={styles.cardTime}>
                    {new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
                <Text style={styles.viewDetailsText}>View Details ›</Text>
            </View>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            {/* Premium Header */}
            <View style={styles.headerContainer}>
                <View style={styles.headerTop}>
                    <View>
                        <Text style={styles.greeting}>Welcome back,</Text>
                        <Text style={styles.nameText}>{user?.name} 👋</Text>
                    </View>
                    <View style={styles.avatarMini}>
                        <Text style={styles.avatarMiniText}>{user?.name?.charAt(0)}</Text>
                    </View>
                </View>

                <View style={styles.statusCard}>
                    <View style={styles.statusInfo}>
                        <Text style={styles.statusLabel}>Availability</Text>
                        <View style={styles.statusIndicatorWrapper}>
                            <View style={[styles.statusDot, { backgroundColor: isAvailable ? colors.success : colors.error }]} />
                            <Text style={styles.statusBadgeText}>
                                {isAvailable ? 'Currently Online' : 'Currently Offline'}
                            </Text>
                        </View>
                    </View>
                    <TouchableOpacity
                        style={[
                            styles.toggleSwitch,
                            isAvailable ? styles.toggleOn : styles.toggleOff,
                            isToggling && styles.disabledButton,
                        ]}
                        onPress={handleToggleAvailability}
                        disabled={isToggling}
                    >
                        {isToggling ? (
                            <ActivityIndicator color={colors.white} size="small" />
                        ) : (
                            <View style={[styles.switchKnob, isAvailable ? styles.knobOn : styles.knobOff]} />
                        )}
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content Section */}
            <View style={styles.contentSection}>
                {!isAvailable ? (
                    <View style={styles.offlineContainer}>
                        <View style={styles.offlineIconWrapper}>
                            <Text style={styles.offlineEmoji}>🌙</Text>
                        </View>
                        <Text style={styles.offlineTitle}>You are Offline</Text>
                        <Text style={styles.offlineSubtitle}>
                            Toggle the switch above to start receiving incoming towing requests in real-time.
                        </Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Available Jobs</Text>
                            <Text style={styles.requestCount}>{availableRequests.length} Requests</Text>
                        </View>
                        <FlatList
                            data={availableRequests}
                            keyExtractor={(item) => item.id}
                            renderItem={renderRequestCard}
                            contentContainerStyle={styles.listContent}
                            showsVerticalScrollIndicator={false}
                            refreshControl={
                                <RefreshControl
                                    refreshing={isRefreshing}
                                    onRefresh={onRefresh}
                                    colors={[colors.primary]}
                                    tintColor={colors.primary}
                                />
                            }
                            ListEmptyComponent={
                                <View style={styles.emptyContainer}>
                                    <ActivityIndicator color={colors.primary} style={{ marginBottom: spacing.md }} />
                                    <Text style={styles.emptyTitle}>Scanning Area...</Text>
                                    <Text style={styles.emptySubtitle}>
                                        Looking for new towing requests nearby.
                                    </Text>
                                </View>
                            }
                        />
                    </>
                )}
            </View>

            {/* Request Detail Modal */}
            <Modal
                visible={!!selectedRequest}
                transparent
                animationType="fade"
                onRequestClose={() => setSelectedRequest(null)}
            >
                <View style={styles.modalOverlay}>
                    <TouchableOpacity
                        style={styles.modalDismissOverlay}
                        activeOpacity={1}
                        onPress={() => setSelectedRequest(null)}
                    />
                    <View style={styles.modalContent}>
                        <View style={styles.modalHandle} />
                        {selectedRequest && (
                            <>
                                <View style={styles.modalHeader}>
                                    <Text style={styles.modalTitle}>New Request</Text>
                                    <Text style={styles.modalPrice}>#{selectedRequest.id}</Text>
                                </View>

                                <View style={styles.modalDetailsContainer}>
                                    <View style={styles.modalDetailRow}>
                                        <View style={styles.modalIconBox}>
                                            <Text>🚗</Text>
                                        </View>
                                        <View>
                                            <Text style={styles.modalDetailLabel}>Vehicle Type</Text>
                                            <Text style={styles.modalDetailValue}>{selectedRequest.vehicle_type}</Text>
                                        </View>
                                    </View>

                                    <View style={styles.modalDetailRow}>
                                        <View style={styles.modalIconBox}>
                                            <Text>📍</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.modalDetailLabel}>Pickup Point</Text>
                                            <TouchableOpacity onPress={() => openInGoogleMaps(selectedRequest.pickup.lat, selectedRequest.pickup.lng, 'Pickup')}>
                                                <Text style={[styles.modalDetailValue, styles.linkText]} numberOfLines={2}>
                                                    {selectedRequest.pickup.address || `${selectedRequest.pickup.lat}, ${selectedRequest.pickup.lng}`}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    <View style={styles.modalDetailRow}>
                                        <View style={styles.modalIconBox}>
                                            <Text>🏁</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={styles.modalDetailLabel}>Destination</Text>
                                            <TouchableOpacity onPress={() => openInGoogleMaps(selectedRequest.destination.lat, selectedRequest.destination.lng, 'Destination')}>
                                                <Text style={[styles.modalDetailValue, styles.linkText]} numberOfLines={2}>
                                                    {selectedRequest.destination.address || `${selectedRequest.destination.lat}, ${selectedRequest.destination.lng}`}
                                                </Text>
                                            </TouchableOpacity>
                                        </View>
                                    </View>

                                    {selectedRequest.note ? (
                                        <View style={styles.modalDetailRow}>
                                            <View style={styles.modalIconBox}>
                                                <Text>📝</Text>
                                            </View>
                                            <View style={{ flex: 1 }}>
                                                <Text style={styles.modalDetailLabel}>Note</Text>
                                                <Text style={styles.modalDetailValue}>{selectedRequest.note}</Text>
                                            </View>
                                        </View>
                                    ) : null}
                                </View>

                                <View style={styles.modalActions}>
                                    <TouchableOpacity
                                        style={[styles.declineBtn, (isDeclining || isAccepting) && styles.disabledButton]}
                                        onPress={() => handleDecline(selectedRequest)}
                                        disabled={isDeclining || isAccepting}
                                    >
                                        {isDeclining ? (
                                            <ActivityIndicator color={colors.error} />
                                        ) : (
                                            <Text style={styles.declineBtnText}>Decline</Text>
                                        )}
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={[styles.acceptBtn, (isAccepting || isDeclining) && styles.disabledButton]}
                                        onPress={() => handleAccept(selectedRequest)}
                                        disabled={isAccepting || isDeclining}
                                    >
                                        {isAccepting ? (
                                            <ActivityIndicator color={colors.white} />
                                        ) : (
                                            <Text style={styles.acceptBtnText}>Accept Job</Text>
                                        )}
                                    </TouchableOpacity>
                                </View>
                            </>
                        )}
                    </View>
                </View>
            </Modal>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    // Premium Header
    headerContainer: {
        backgroundColor: colors.white,
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
        borderBottomLeftRadius: 30,
        borderBottomRightRadius: 30,
        elevation: 5,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 10,
    },
    headerTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    greeting: {
        fontSize: 14,
        color: colors.textSecondary,
        fontWeight: '500',
    },
    nameText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: colors.text,
    },
    avatarMini: {
        width: 45,
        height: 45,
        borderRadius: 22.5,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    avatarMiniText: {
        color: colors.white,
        fontWeight: 'bold',
        fontSize: 18,
    },
    statusCard: {
        flexDirection: 'row',
        backgroundColor: '#F1F3F5',
        borderRadius: 20,
        padding: spacing.md,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    statusInfo: {
        flex: 1,
    },
    statusLabel: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
        textTransform: 'uppercase',
        letterSpacing: 1,
        marginBottom: 4,
    },
    statusIndicatorWrapper: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    statusDot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        marginRight: 6,
    },
    statusBadgeText: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
    },
    toggleSwitch: {
        width: 60,
        height: 32,
        borderRadius: 16,
        padding: 4,
        justifyContent: 'center',
    },
    toggleOn: {
        backgroundColor: colors.success,
    },
    toggleOff: {
        backgroundColor: colors.error,
    },
    switchKnob: {
        width: 24,
        height: 24,
        borderRadius: 12,
        backgroundColor: colors.white,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
    },
    knobOn: {
        alignSelf: 'flex-end',
    },
    knobOff: {
        alignSelf: 'flex-start',
    },
    // Content Section
    contentSection: {
        flex: 1,
        paddingHorizontal: spacing.lg,
        paddingTop: spacing.lg,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'baseline',
        marginBottom: spacing.md,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '800',
        color: colors.text,
    },
    requestCount: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.primary,
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 10,
    },
    offlineContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: spacing.xl,
    },
    offlineIconWrapper: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    offlineEmoji: {
        fontSize: 40,
    },
    offlineTitle: {
        fontSize: 22,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.sm,
    },
    offlineSubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    listContent: {
        paddingBottom: spacing.xxl,
    },
    // Request Card
    requestCard: {
        backgroundColor: colors.white,
        borderRadius: 18,
        padding: spacing.md,
        marginBottom: spacing.md,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 8,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    cardVehicle: {
        fontSize: 17,
        fontWeight: '700',
        color: colors.text,
    },
    cardStatus: {
        fontSize: 11,
        fontWeight: '800',
        color: colors.primary,
        letterSpacing: 0.5,
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#F1F3F5',
        marginBottom: 12,
    },
    cardAddress: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
        marginBottom: 6,
    },
    cardNote: {
        fontSize: 13,
        color: colors.textSecondary,
        fontStyle: 'italic',
        marginBottom: 12,
    },
    cardFooterMain: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    cardTime: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    viewDetailsText: {
        fontSize: 13,
        fontWeight: '700',
        color: colors.primary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: colors.text,
        marginBottom: 4,
    },
    emptySubtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        textAlign: 'center',
    },
    // Modal Redesign
    modalOverlay: {
        flex: 1,
        backgroundColor: 'rgba(0,0,0,0.6)',
        justifyContent: 'flex-end',
    },
    modalDismissOverlay: {
        flex: 1,
    },
    modalContent: {
        backgroundColor: colors.white,
        borderTopLeftRadius: 30,
        borderTopRightRadius: 30,
        padding: spacing.xl,
        paddingBottom: spacing.xxl,
    },
    modalHandle: {
        width: 40,
        height: 5,
        backgroundColor: '#DEE2E6',
        borderRadius: 2.5,
        alignSelf: 'center',
        marginBottom: spacing.xl,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.xl,
    },
    modalTitle: {
        fontSize: 24,
        fontWeight: '800',
        color: colors.text,
    },
    modalPrice: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.primary,
        backgroundColor: colors.primary + '15',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    modalDetailsContainer: {
        marginBottom: spacing.xl,
    },
    modalDetailRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    modalIconBox: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: '#F8F9FA',
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: spacing.md,
    },
    modalDetailLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: colors.textSecondary,
        textTransform: 'uppercase',
    },
    modalDetailValue: {
        fontSize: 15,
        fontWeight: '700',
        color: colors.text,
        marginTop: 2,
    },
    linkText: {
        color: colors.primary,
        textDecorationLine: 'underline',
    },
    modalActions: {
        flexDirection: 'row',
        gap: spacing.md,
    },
    declineBtn: {
        flex: 1,
        height: 56,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 2,
        borderColor: '#F1F3F5',
    },
    declineBtnText: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.error,
    },
    acceptBtn: {
        flex: 2,
        height: 56,
        borderRadius: 16,
        backgroundColor: colors.success,
        justifyContent: 'center',
        alignItems: 'center',
        elevation: 4,
        shadowColor: colors.success,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
    },
    acceptBtnText: {
        fontSize: 16,
        fontWeight: '800',
        color: colors.white,
    },
    disabledButton: {
        opacity: 0.6,
    },
});

