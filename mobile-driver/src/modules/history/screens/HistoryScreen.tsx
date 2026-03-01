import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { driverService, TowingRequest } from '../../../services/driver.service';

type FilterType = 'all' | 'active' | 'completed' | 'cancelled';

export default function HistoryScreen() {
    const navigation = useNavigation<any>();
    const [requests, setRequests] = useState<TowingRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    // Refresh data when screen comes into focus
    useFocusEffect(
        useCallback(() => {
            loadHistory(1, true);
        }, [filter])
    );

    const loadHistory = async (pg: number, reset: boolean = false) => {
        if (reset) {
            setIsLoading(true);
        }

        try {
            const response = await driverService.getHistory(pg, filter);
            const newData = response.data;
            setRequests(reset ? newData : [...requests, ...newData]);
            setPage(pg);
            setHasMore(response.meta.current_page < response.meta.last_page);
        } catch {
            // Silently handle
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
            setIsLoadingMore(false);
        }
    };

    const onRefresh = useCallback(() => {
        setIsRefreshing(true);
        loadHistory(1, true);
    }, [filter]);

    const onEndReached = () => {
        if (!hasMore || isLoadingMore) return;
        setIsLoadingMore(true);
        loadHistory(page + 1, false);
    };

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'completed':
                return { color: colors.success, bg: colors.success + '15', label: 'Completed' };
            case 'cancelled':
                return { color: colors.error, bg: colors.error + '15', label: 'Cancelled' };
            case 'accepted':
                return { color: colors.primary, bg: colors.primary + '15', label: 'Accepted' };
            case 'in_progress':
                return { color: '#FF9800', bg: '#FF980015', label: 'In Progress' };
            default:
                return { color: colors.textSecondary, bg: colors.surface, label: status };
        }
    };

    const renderItem = ({ item }: { item: TowingRequest }) => {
        const status = getStatusStyles(item.status);

        return (
            <TouchableOpacity
                style={styles.card}
                onPress={() => {
                    if (item.status === 'in_progress') {
                        navigation.navigate('OngoingRequest', { trackingId: item.id });
                    } else {
                        navigation.navigate('RequestDetails', { trackingId: item.id });
                    }
                }}
            >
                <View style={styles.cardHeader}>
                    <View>
                        <Text style={styles.cardVehicle}>🚗 {item.vehicle_type}</Text>
                        <Text style={styles.cardCustomerId}>Job #{item.id.slice(0, 8).toUpperCase()}</Text>
                    </View>
                    <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
                        <Text style={[styles.statusText, { color: status.color }]}>
                            {status.label.toUpperCase()}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardDivider} />

                <View style={styles.addressContainer}>
                    <View style={styles.addressRow}>
                        <View style={styles.dot} />
                        <Text style={styles.cardAddress} numberOfLines={1}>
                            {item.pickup.address || 'Pickup Point'}
                        </Text>
                    </View>
                    <View style={[styles.dot, { backgroundColor: colors.primary, marginVertical: 4 }]} />
                    <View style={styles.addressRow}>
                        <View style={[styles.dot, { backgroundColor: colors.primary }]} />
                        <Text style={styles.cardAddress} numberOfLines={1}>
                            {item.destination.address || 'Destination'}
                        </Text>
                    </View>
                </View>

                <View style={styles.cardFooter}>
                    <Text style={styles.cardCustomer}>👤 {item.customer_name}</Text>
                    <Text style={styles.cardDate}>
                        {new Date(item.created_at).toLocaleDateString()}
                    </Text>
                </View>
            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            {/* Premium Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Job History</Text>
                <Text style={styles.subtitle}>Track and manage your towing jobs</Text>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterWrapper}>
                <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.filterScroll}
                >
                    {(['all', 'active', 'completed', 'cancelled'] as FilterType[]).map((f) => (
                        <TouchableOpacity
                            key={f}
                            style={[styles.filterTab, filter === f && styles.filterTabActive]}
                            onPress={() => setFilter(f)}
                        >
                            <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>
                                {f.charAt(0).toUpperCase() + f.slice(1)}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </ScrollView>
            </View>

            {/* Content */}
            {isLoading ? (
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color={colors.primary} />
                </View>
            ) : (
                <FlatList
                    data={requests}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.listContent}
                    refreshControl={
                        <RefreshControl
                            refreshing={isRefreshing}
                            onRefresh={onRefresh}
                            colors={[colors.primary]}
                            tintColor={colors.primary}
                        />
                    }
                    onEndReached={onEndReached}
                    onEndReachedThreshold={0.3}
                    ListFooterComponent={
                        isLoadingMore ? (
                            <ActivityIndicator style={{ padding: spacing.md }} color={colors.primary} />
                        ) : null
                    }
                    ListEmptyComponent={
                        <View style={styles.emptyContainer}>
                            <View style={styles.emptyIconCircle}>
                                <Text style={{ fontSize: 40 }}>📋</Text>
                            </View>
                            <Text style={styles.emptyTitle}>No Jobs Found</Text>
                            <Text style={styles.emptySubtitle}>
                                Your {filter === 'all' ? '' : filter} jobs will appear here once you start taking requests.
                            </Text>
                        </View>
                    }
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#F8F9FA',
    },
    header: {
        paddingHorizontal: spacing.md,
        paddingTop: spacing.md,
        paddingBottom: spacing.lg,
        backgroundColor: colors.white,
    },
    title: {
        fontSize: 28,
        fontWeight: '900',
        color: colors.text,
    },
    subtitle: {
        fontSize: 14,
        color: colors.textSecondary,
        marginTop: 4,
        fontWeight: '500',
    },
    filterWrapper: {
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: '#F1F3F5',
    },
    filterScroll: {
        paddingHorizontal: spacing.lg,
        paddingBottom: spacing.md,
    },
    filterTab: {
        paddingHorizontal: spacing.lg,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#F1F3F5',
        marginRight: spacing.sm,
    },
    filterTabActive: {
        backgroundColor: colors.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '700',
        color: colors.textSecondary,
    },
    filterTextActive: {
        color: colors.white,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContent: {
        padding: spacing.lg,
        paddingBottom: spacing.xxl,
        flexGrow: 1,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 20,
        padding: spacing.lg,
        marginBottom: spacing.md,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 10,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: spacing.md,
    },
    cardVehicle: {
        fontSize: 17,
        fontWeight: '800',
        color: colors.text,
    },
    cardCustomerId: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
        marginTop: 2,
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 10,
    },
    statusText: {
        fontSize: 10,
        fontWeight: '900',
        letterSpacing: 0.5,
    },
    cardDivider: {
        height: 1,
        backgroundColor: '#F1F3F5',
        marginBottom: spacing.md,
    },
    addressContainer: {
        marginBottom: spacing.md,
    },
    addressRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    dot: {
        width: 8,
        height: 8,
        borderRadius: 4,
        backgroundColor: '#DEE2E6',
        marginRight: 10,
    },
    cardAddress: {
        fontSize: 14,
        color: colors.text,
        fontWeight: '500',
        flex: 1,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: spacing.md,
        borderTopWidth: 1,
        borderTopColor: '#F1F3F5',
    },
    cardCustomer: {
        fontSize: 13,
        color: colors.text,
        fontWeight: '700',
    },
    cardDate: {
        fontSize: 12,
        color: colors.textSecondary,
        fontWeight: '600',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 60,
    },
    emptyIconCircle: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: colors.surface,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: spacing.lg,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: '800',
        color: colors.text,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: 'center',
        paddingHorizontal: spacing.xl,
        lineHeight: 22,
    },
});
