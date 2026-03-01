import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useAuthStore } from '../store/auth.store';

const API_URL = 'http://localhost:8000/api/v1'; // Use localhost with adb reverse for physical devices, or 10.0.2.2 for emulator

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
    timeout: 15000, // 15 second timeout
});

// ─── Request Interceptor ───────────────────────────────────────────────────────

api.interceptors.request.use(
    async (config) => {
        const token = await AsyncStorage.getItem('access_token');
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// ─── Response Interceptor (Token Refresh + Force Logout) ────────────────────────

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Check if error is 401 and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;

            try {
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                if (refreshToken) {
                    const res = await axios.post(`${API_URL}/auth/refresh`, {
                        refresh_token: refreshToken,
                    });

                    if (res.data?.data?.access_token) {
                        const newAccessToken = res.data.data.access_token;
                        const newRefreshToken = res.data.data.refresh_token;

                        await AsyncStorage.setItem('access_token', newAccessToken);
                        await AsyncStorage.setItem('refresh_token', newRefreshToken);

                        originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
                        return api(originalRequest);
                    }
                }
            } catch {
                // Refresh failed — force logout and clear all auth state
                await forceLogout();
            }
        }

        return Promise.reject(error);
    }
);

/**
 * Clears all stored auth data and resets the Zustand auth store.
 * This forces the app back to the login screen.
 */
async function forceLogout(): Promise<void> {
    await AsyncStorage.removeItem('access_token');
    await AsyncStorage.removeItem('refresh_token');
    await AsyncStorage.removeItem('user');
    // Reset Zustand store (non-hook access)
    useAuthStore.getState().clearAuth();
}
