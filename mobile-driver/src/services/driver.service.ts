import { api } from './api';

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface TowingRequest {
    id: string; // tracking_id
    customer_id: number | null;
    customer_name: string;
    customer_email: string;
    customer_phone: string;
    vehicle_type: string;
    pickup: {
        lat: number;
        lng: number;
        address: string | null;
    };
    destination: {
        lat: number;
        lng: number;
        address: string | null;
    };
    note: string | null;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    driver?: {
        id: number;
        name: string;
        phone: string;
        avatar: string | null;
    };
    logs: RequestLog[];
    media: RequestMedia[];
    created_at: string;
    updated_at: string;
}

export interface RequestLog {
    status: string;
    updated_by: string;
    timestamp: string;
}

export interface RequestMedia {
    id: number;
    image_path: string;
    uploaded_by: number;
    created_at: string;
}

interface SuccessResponse<T = any> {
    message: string;
    data: T;
}

interface PaginatedResponse<T> {
    data: T[];
    meta: {
        current_page: number;
        last_page: number;
        per_page: number;
        total: number;
    };
}

// ─── Service ────────────────────────────────────────────────────────────────────

export const driverService = {
    /**
     * Toggle driver availability (online/offline).
     */
    toggleAvailability: async (): Promise<SuccessResponse<{ is_available: boolean }>> => {
        const response = await api.post('/driver/availability');
        return response.data;
    },

    /**
     * Get available towing requests for the driver.
     */
    getAvailableRequests: async (page: number = 1): Promise<PaginatedResponse<TowingRequest>> => {
        const response = await api.get('/driver/requests/available', { params: { page } });
        return response.data;
    },

    /**
     * Get the driver's current active request (accepted / in_progress).
     */
    getCurrentRequest: async (): Promise<SuccessResponse<TowingRequest | null>> => {
        const response = await api.get('/driver/requests/current');
        return response.data;
    },

    /**
     * Accept a towing request by its tracking ID.
     */
    acceptRequest: async (trackingId: string): Promise<SuccessResponse<TowingRequest>> => {
        const response = await api.post(`/driver/requests/${trackingId}/accept`);
        return response.data;
    },

    /**
     * Decline a towing request by its tracking ID.
     */
    declineRequest: async (trackingId: string): Promise<SuccessResponse> => {
        const response = await api.post(`/driver/requests/${trackingId}/decline`);
        return response.data;
    },

    /**
     * Update status of an assigned request.
     * Status transitions: accepted → in_progress → completed
     */
    updateRequestStatus: async (
        trackingId: string,
        status: string,
        images?: any[],
    ): Promise<SuccessResponse<TowingRequest>> => {
        const formData = new FormData();
        formData.append('status', status);

        if (images && images.length > 0) {
            images.forEach((image, index) => {
                formData.append(`images[${index}]`, {
                    uri: image.uri,
                    type: image.type || 'image/jpeg',
                    name: image.fileName || `image_${index}.jpg`,
                } as any);
            });
        }

        const response = await api.post(`/driver/requests/${trackingId}/status`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return response.data;
    },

    /**
     * Get driver's history (completed + cancelled requests).
     * @param filter — 'all' | 'completed' | 'cancelled'
     */
    getHistory: async (
        page: number = 1,
        filter: string = 'all',
    ): Promise<PaginatedResponse<TowingRequest>> => {
        const response = await api.get('/driver/requests/history', {
            params: { page, filter },
        });
        return response.data;
    },

    /**
     * Get details of a specific request by its tracking ID.
     */
    getRequestDetails: async (trackingId: string): Promise<SuccessResponse<TowingRequest | null>> => {
        const response = await api.get(`/driver/requests/${trackingId}`);
        return response.data;
    },
};
