import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
    id: number;
    name: string;
    email: string;
    role: string;
}

interface AuthState {
    user: User | null;
    accessToken: string | null;
    isLoading: boolean;
    setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
    clearAuth: () => Promise<void>;
    hydrate: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    accessToken: null,
    isLoading: true,

    setAuth: async (user, accessToken, refreshToken) => {
        await AsyncStorage.setItem('access_token', accessToken);
        await AsyncStorage.setItem('refresh_token', refreshToken);
        // Ideally we'd persist user too or fetch on load
        await AsyncStorage.setItem('user', JSON.stringify(user));

        set({ user, accessToken, isLoading: false });
    },

    clearAuth: async () => {
        await AsyncStorage.removeItem('access_token');
        await AsyncStorage.removeItem('refresh_token');
        await AsyncStorage.removeItem('user');
        set({ user: null, accessToken: null, isLoading: false });
    },

    hydrate: async () => {
        try {
            const token = await AsyncStorage.getItem('access_token');
            const userStr = await AsyncStorage.getItem('user');

            if (token && userStr) {
                set({
                    accessToken: token,
                    user: JSON.parse(userStr),
                    isLoading: false,
                });
            } else {
                set({ isLoading: false });
            }
        } catch {
            set({ isLoading: false });
        }
    },
}));
