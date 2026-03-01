import { api } from './api';

// ─── Response Types ────────────────────────────────────────────────────────────

/** Matches AuthResource shape from backend: { status, data: { ...user, access_token, refresh_token } } */
export interface AuthResponse {
    status: string;
    data: {
        id: number;
        name: string;
        email: string;
        phone: string;
        role: string;
        avatar: string | null;
        is_active: boolean;
        is_verified: boolean;
        email_verified_at: string | null;
        phone_verified_at: string | null;
        created_at: string;
        updated_at: string;
        access_token: string;
        refresh_token: string;
        token_type: string;
    };
}

/** Matches SuccessResource shape: { status, message, data? } */
export interface SuccessResponse {
    status: string;
    message: string;
    data?: {
        email?: string;
        expires_in?: number;
        [key: string]: any;
    } | null;
}

/** Matches ErrorResource shape: { status, message, errors? } */
export interface ErrorResponse {
    status: string;
    message: string;
    errors?: Record<string, string[]> | null;
}

/** Validation error shape (422): { status, message, errors } */
export interface ValidationErrorResponse {
    status: string;
    message: string;
    errors: Record<string, string[]>;
}

// ─── Request Payloads ──────────────────────────────────────────────────────────

export interface RegisterPayload {
    name: string;
    email: string;
    phone: string;
    password: string;
    password_confirmation: string;
    role: 'driver';
}

export interface ResetPasswordPayload {
    email: string;
    otp: string;
    password: string;
    password_confirmation: string;
}

// ─── Service ───────────────────────────────────────────────────────────────────

export const authService = {
    /**
     * Login with email + password.
     * Backend returns AuthResource with tokens on success.
     * 401 = invalid credentials, 403 = not driver / email unverified.
     */
    login: async (email: string, password: string): Promise<AuthResponse> => {
        const response = await api.post('/auth/login', { email, password, device_type: 'mobile' });
        return response.data;
    },

    /**
     * Register a new driver account.
     * Backend returns SuccessResource with email + OTP expiry data.
     */
    register: async (data: RegisterPayload): Promise<SuccessResponse> => {
        const response = await api.post('/auth/register', data);
        return response.data;
    },

    /**
     * Verify OTP for email verification.
     * Backend expects { email, otp_code } (VerifyOTPRequest).
     */
    verifyOTP: async (email: string, otpCode: string): Promise<SuccessResponse> => {
        const response = await api.post('/auth/verify-otp', { email, otp_code: otpCode });
        return response.data;
    },

    /**
     * Request a new OTP to be sent (resend / email verification).
     * Backend expects { email } (SendOTPRequest).
     */
    sendOTP: async (email: string): Promise<SuccessResponse> => {
        const response = await api.post('/auth/send-otp', { email });
        return response.data;
    },

    /**
     * Request password reset OTP.
     * Backend expects { email } (SendOTPRequest) via PasswordResetController.
     */
    forgotPassword: async (email: string): Promise<SuccessResponse> => {
        const response = await api.post('/auth/forgot-password', { email });
        return response.data;
    },

    /**
     * Reset password with OTP.
     * Backend expects { email, otp, password, password_confirmation } (ResetPasswordRequest).
     */
    resetPassword: async (data: ResetPasswordPayload): Promise<SuccessResponse> => {
        const response = await api.post('/auth/reset-password', data);
        return response.data;
    },

    /**
     * Logout current user (requires auth token).
     */
    logout: async (): Promise<SuccessResponse> => {
        const response = await api.delete('/auth/logout');
        return response.data;
    },

    /**
     * Get authenticated user profile.
     */
    getUser: async (): Promise<SuccessResponse> => {
        const response = await api.get('/auth/user');
        return response.data;
    },
};
