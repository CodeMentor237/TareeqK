import React, { useState, useEffect, useCallback } from 'react';
import {
    View, Text, StyleSheet, FlatList, TouchableOpacity,
    ActivityIndicator, RefreshControl,
} from 'react-native';
import { colors } from '../../../theme/colors';
import { spacing } from '../../../theme/spacing';
import { driverService, TowingRequest } from '../../../services/driver.service';

type FilterType = 'all' | 'completed' | 'cancelled';

export default function HistoryScreen() {
    const [requests, setRequests] = useState<TowingRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [filter, setFilter] = useState<FilterType>('all');
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingMore, setIsLoadingMore] = useState(false);

    useEffect(() => {
        loadHistory(1, true);
    }, [filter]);

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

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed':
                return colors.success;
            case 'cancelled':
                return colors.error;
            default:
                return colors.textSecondary;
        }
    };

    const renderItem = ({ item }: { item: TowingRequest }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.cardVehicle}>🚗 {item.vehicle_type}</Text>
                <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                    <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
                        {item.status.toUpperCase()}
                    </Text>
                </View>
            </View>

            <Text style={styles.cardAddress} numberOfLines={1}>
                📍 From: {item.pickup.address || `${item.pickup.lat.toFixed(4)}, ${item.pickup.lng.toFixed(4)}`}
            </Text>
            <Text style={styles.cardAddress} numberOfLines={1}>
                📍 To: {item.destination.address || `${item.destination.lat.toFixed(4)}, ${item.destination.lng.toFixed(4)}`}
            </Text>

            <View style={styles.cardFooter}>
                <Text style={styles.cardCustomer}>👤 {item.customer_name}</Text>
                <Text style={styles.cardDate}>
                    {new Date(item.created_at).toLocaleDateString()}
                </Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>History</Text>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filterContainer}>
                {(['all', 'completed', 'cancelled'] as FilterType[]).map((f) => (
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
                        <RefreshControl refreshing={isRefreshing} onRefresh={onRefresh} />
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
                            <Text style={styles.emptyEmoji}>📋</Text>
                            <Text style={styles.emptyTitle}>No history yet</Text>
                            <Text style={styles.emptySubtitle}>
                                Completed and cancelled jobs will appear here.
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
        backgroundColor: colors.background,
    },
    header: {
        padding: spacing.lg,
        paddingTop: spacing.xxl,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    title: {
        fontSize: 26,
        fontWeight: 'bold',
        color: colors.text,
    },
    filterContainer: {
        flexDirection: 'row',
        padding: spacing.sm,
        backgroundColor: colors.white,
        borderBottomWidth: 1,
        borderBottomColor: colors.border,
    },
    filterTab: {
        flex: 1,
        paddingVertical: spacing.sm,
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 4,
    },
    filterTabActive: {
        backgroundColor: colors.primary,
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
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
        padding: spacing.md,
        flexGrow: 1,
    },
    card: {
        backgroundColor: colors.white,
        borderRadius: 12,
        padding: spacing.md,
        marginBottom: spacing.md,
        borderWidth: 1,
        borderColor: colors.border,
    },
    cardHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: spacing.sm,
    },
    cardVehicle: {
        fontSize: 16,
        fontWeight: '700',
        color: colors.text,
    },
    statusBadge: {
        paddingHorizontal: spacing.sm,
        paddingVertical: 2,
        borderRadius: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '700',
    },
    cardAddress: {
        fontSize: 13,
        color: colors.textSecondary,
        marginBottom: 2,
    },
    cardFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: spacing.sm,
        paddingTop: spacing.sm,
        borderTopWidth: 1,
        borderTopColor: colors.surface,
    },
    cardCustomer: {
        fontSize: 13,
        color: colors.text,
        fontWeight: '500',
    },
    cardDate: {
        fontSize: 12,
        color: colors.textSecondary,
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: 100,
    },
    emptyEmoji: {
        fontSize: 64,
        marginBottom: spacing.md,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: colors.text,
        marginBottom: spacing.xs,
    },
    emptySubtitle: {
        fontSize: 15,
        color: colors.textSecondary,
        textAlign: 'center',
    },
});
