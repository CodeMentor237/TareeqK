import React, { useEffect } from 'react';
import { ActivityIndicator, View, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStack } from './AuthStack';
import { useAuthStore } from '../store/auth.store';
import { colors } from '../theme/colors';
import { MainTabs } from './MainTabs';
import RequestDetailsScreen from '../modules/request/screens/RequestDetailsScreen';
import OngoingRequestScreen from '../modules/request/screens/OngoingRequestScreen';

export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
    RequestDetails: { trackingId: string };
    OngoingRequest: { trackingId: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
    const user = useAuthStore(state => state.user);
    const isLoading = useAuthStore(state => state.isLoading);
    const hydrate = useAuthStore(state => state.hydrate);

    useEffect(() => {
        hydrate();
    }, [hydrate]);

    if (isLoading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer>
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {user ? (
                    <>
                        <Stack.Screen name="Main" component={MainTabs} />
                        <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
                        <Stack.Screen name="OngoingRequest" component={OngoingRequestScreen} />
                    </>
                ) : (
                    <Stack.Screen name="Auth" component={AuthStack} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: colors.background,
    },
});
