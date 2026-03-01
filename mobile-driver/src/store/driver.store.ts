import { create } from 'zustand';
import { TowingRequest } from '../services/driver.service';

interface DriverState {
    isAvailable: boolean;
    currentRequest: TowingRequest | null;
    availableRequests: TowingRequest[];

    setAvailable: (value: boolean) => void;
    setCurrentRequest: (request: TowingRequest | null) => void;
    setAvailableRequests: (requests: TowingRequest[]) => void;
    removeRequest: (trackingId: string) => void;
    reset: () => void;
}

export const useDriverStore = create<DriverState>((set) => ({
    isAvailable: false,
    currentRequest: null,
    availableRequests: [],

    setAvailable: (value) => set({ isAvailable: value }),

    setCurrentRequest: (request) => set({ currentRequest: request }),

    setAvailableRequests: (requests) => set({ availableRequests: requests }),

    removeRequest: (trackingId) =>
        set((state) => ({
            availableRequests: state.availableRequests.filter((r) => r.id !== trackingId),
        })),

    reset: () =>
        set({
            isAvailable: false,
            currentRequest: null,
            availableRequests: [],
        }),
}));
