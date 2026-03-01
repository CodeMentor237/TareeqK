import { api } from './api';

export interface AuthResponse {
    data: {
        user: {
            id: number;
            name: string;
            email: string;
            role: string;
            email_verified_at: string | null;
        };
        access_token: string;
        refresh_token: string;
    };
    message?: string;
}

export const authService = {
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', { email, password });
        return response.data;
    },

    register: async (data: any) => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    verifyEmail: async (otp: string, email: string) => {
        // Assuming backend has this endpoint, as it was mentioned OTP is sent out
        const response = await api.post('/auth/verify', { otp, email });
        return response.data;
    },

    logout: async () => {
        const response = await api.post('/auth/logout');
        return response.data;
    },

    getUser: async () => {
        const response = await api.get('/auth/user');
        return response.data;
    }
};
