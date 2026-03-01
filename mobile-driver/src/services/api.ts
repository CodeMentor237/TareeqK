import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://10.0.2.2:8000/api/v1'; // 10.0.2.2 is mapped to localhost for Android emulator

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

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

api.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        const originalRequest = error.config;

        // Check if error is 401 and we haven't already retried
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            try {
                const refreshToken = await AsyncStorage.getItem('refresh_token');
                if (refreshToken) {
                    const res = await axios.post(`${API_URL}/auth/refresh`, {
                        refresh_token: refreshToken
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
                // If refresh fails, clear auth state
                await AsyncStorage.removeItem('access_token');
                await AsyncStorage.removeItem('refresh_token');
                // We'd ideally trigger a logout action here via Zustand
            }
        }

        return Promise.reject(error);
    }
);
