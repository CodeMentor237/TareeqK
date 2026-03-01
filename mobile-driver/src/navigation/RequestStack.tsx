import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../modules/home/screens/HomeScreen';
import RequestDetailsScreen from '../modules/request/screens/RequestDetailsScreen';
import OngoingRequestScreen from '../modules/request/screens/OngoingRequestScreen';

export type RequestStackParamList = {
    Home: undefined;
    RequestDetails: { trackingId: string };
    OngoingRequest: { trackingId: string };
};

const Stack = createNativeStackNavigator<RequestStackParamList>();

export function RequestStack() {
    return (
        <Stack.Navigator screenOptions={{ headerShown: false }}>
            <Stack.Screen name="Home" component={HomeScreen} />
            <Stack.Screen name="RequestDetails" component={RequestDetailsScreen} />
            <Stack.Screen name="OngoingRequest" component={OngoingRequestScreen} />
        </Stack.Navigator>
    );
}
