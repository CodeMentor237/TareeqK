import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
    id: number;
    name: string;
    email: string;
    role: 'customer' | 'driver' | 'admin';
}

interface AuthState {
    user: User | null;
    token: string | null;
    refreshToken: string | null;
    setAuth: (user: User, token: string, refreshToken: string) => void;
    setTokens: (token: string, refreshToken: string) => void;
    logout: () => void;
}

export const useAuthStore = create<AuthState>()(
    persist(
        (set) => ({
            user: null,
            token: null,
            refreshToken: null,
            setAuth: (user, token, refreshToken) => {
                localStorage.setItem('auth_token', token);
                localStorage.setItem('refresh_token', refreshToken);
                set({ user, token, refreshToken });
            },
            setTokens: (token, refreshToken) => {
                localStorage.setItem('auth_token', token);
                localStorage.setItem('refresh_token', refreshToken);
                set({ token, refreshToken });
            },
            logout: () => {
                localStorage.removeItem('auth_token');
                localStorage.removeItem('refresh_token');
                set({ user: null, token: null, refreshToken: null });
            },
        }),
        {
            name: 'auth-storage',
        }
    )
);
