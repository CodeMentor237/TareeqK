import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/auth.store';
import { MapPin, Truck, XCircle, ArrowLeft, Loader2, AlertTriangle, CheckCircle2, Circle, Clock } from 'lucide-react';

export interface RequestDetails {
    id: string; // This is the tracking ID from the backend
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    vehicle_type: string;
    pickup: {
        address: string;
    };
    destination: {
        address: string;
    };
    driver?: {
        name: string;
        phone: string;
    };
    logs?: Array<{
        status: string;
        updated_by: string;
        timestamp: string;
    }>;
}

const statusColors: Record<string, string> = {
    pending: 'text-yellow-500',
    accepted: 'text-blue-500',
    in_progress: 'text-indigo-500',
    completed: 'text-green-500',
    cancelled: 'text-red-500',
};

const TrackRequest = () => {
    const { t } = useTranslation('common');
    const { trackingId, lang } = useParams<{ trackingId: string; lang: string }>();
    const [inputId, setInputId] = useState('');
    const user = useAuthStore(state => state.user);
    const queryClient = useQueryClient();
    const navigate = useNavigate();

    const isCustomerPortal = window.location.pathname.includes('/customer/');

    const { data: responseData, isLoading, isError } = useQuery({
        queryKey: ['track-request', trackingId],
        queryFn: async () => {
            // Use authenticated endpoint if in portal, otherwise public
            const endpoint = isCustomerPortal
                ? `/v1/customer/requests/${trackingId}`
                : `/v1/requests/track/${trackingId}`;
            const response = await api.get(endpoint);
            return response.data;
        },
        enabled: !!trackingId,
        retry: false,
        refetchInterval: (query) => {
            const status = query.state.data?.data?.status;
            if (status && !['completed', 'cancelled'].includes(status)) {
                return 10000;
            }
            return false;
        },
    });

    const cancelMutation = useMutation({
        mutationFn: async () => {
            return await api.post(`/v1/customer/requests/${trackingId}/cancel`);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['track-request', trackingId] });
            queryClient.invalidateQueries({ queryKey: ['my-requests'] });
        },
    });

    const request = responseData?.data;

    if (!trackingId) {
        return (
            <div className={`min-h-[70vh] flex items-center justify-center ${isCustomerPortal ? '' : 'bg-gray-50'}`}>
                <div className="max-w-md w-full p-8 bg-white rounded-3xl shadow-xl border border-gray-100 space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto">
                        <Navigation className="w-8 h-8 text-primary" />
                    </div>
                    <div className="text-center">
                        <h2 className="text-2xl font-black text-gray-900">{t('track_request')}</h2>
                        <p className="text-gray-500 text-sm mt-1">Enter your tracking ID to see real-time updates.</p>
                    </div>
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); navigate(`/${lang}${isCustomerPortal ? '/customer' : ''}/track/${inputId}`); }}>
                        <input
                            type="text"
                            placeholder="TRK-XXXXX"
                            className="block w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-center font-mono font-bold tracking-widest uppercase"
                            value={inputId}
                            onChange={(e) => setInputId(e.target.value)}
                        />
                        <button type="submit" className="w-full btn-primary py-4 rounded-2xl shadow-lg shadow-primary/20">
                            Track Now
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    const canCancel = user && ['pending', 'accepted'].includes(request?.status);

    return (
        <div className={`min-h-screen ${isCustomerPortal ? '' : 'bg-gray-50 py-12 px-4 sm:px-6 lg:px-8'}`}>
            <div className="max-w-4xl mx-auto">
                {/* Back Button for Portal */}
                {isCustomerPortal && (
                    <button
                        onClick={() => navigate(-1)}
                        className="mb-8 flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Back to dashboard
                    </button>
                )}

                <div className="bg-white shadow-xl rounded-[2.5rem] border border-gray-100 overflow-hidden animate-in fade-in duration-700">
                    <div className="px-8 py-6 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div>
                            <h2 className="text-2xl font-black text-gray-900">{t('track_request')}</h2>
                            <p className="text-sm font-bold text-gray-400 font-mono tracking-widest mt-1 uppercase">{trackingId}</p>
                        </div>
                        {request && (
                            <div className={`px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest ${(statusColors[request.status] || 'text-gray-500').replace('text-', 'bg-').replace('500', '100')} ${statusColors[request.status] || 'text-gray-500'}`}>
                                {request.status.replace('_', ' ')}
                            </div>
                        )}
                    </div>

                    <div className="p-8">
                        {isLoading && !request ? (
                            <div className="flex flex-col justify-center items-center py-20 space-y-4">
                                <Loader2 className="w-12 h-12 text-primary animate-spin" />
                                <p className="text-gray-500 font-bold animate-pulse">Retrieving live updates...</p>
                            </div>
                        ) : isError ? (
                            <div className="text-center py-20 bg-red-50/50 rounded-3xl border border-red-100">
                                <AlertTriangle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                                <p className="text-red-900 font-black text-xl">Request Not Found</p>
                                <p className="text-red-700 font-medium mt-1 mb-8">We couldn't find a towing request with that ID.</p>
                                <button onClick={() => navigate(`/${lang}${isCustomerPortal ? '/customer' : ''}/track`)} className="btn-primary px-8">Try another ID</button>
                            </div>
                        ) : request ? (
                            <div className="space-y-12">
                                {/* Journey Info Grid */}
                                <div className="grid md:grid-cols-2 gap-8">
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                            <div className="w-2 h-6 bg-primary rounded-full" />
                                            Journey Details
                                        </h3>
                                        <div className="space-y-1 relative ml-3 border-l-2 border-dashed border-gray-100 pl-8 pb-2">
                                            <div className="relative mb-8">
                                                <MapPin className="absolute -left-[45px] top-0 w-8 h-8 p-1.5 bg-primary text-white rounded-xl shadow-lg shadow-primary/20" />
                                                <div>
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Pickup Location</p>
                                                    <p className="text-gray-900 font-bold mt-1">{request.pickup?.address || 'Selected via map'}</p>
                                                </div>
                                            </div>
                                            <div className="relative">
                                                <Navigation className="absolute -left-[45px] top-0 w-8 h-8 p-1.5 bg-indigo-500 text-white rounded-xl shadow-lg shadow-indigo-200" />
                                                <div>
                                                    <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Destination</p>
                                                    <p className="text-gray-900 font-bold mt-1">{request.destination?.address || 'Selected via map'}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Right Side: Driver & Vehicle */}
                                    <div className="space-y-6">
                                        <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                            <div className="w-2 h-6 bg-indigo-500 rounded-full" />
                                            Assignment
                                        </h3>

                                        {request.driver ? (
                                            <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100/50 flex items-center gap-6">
                                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-indigo-500 shadow-sm">
                                                    <Truck className="w-8 h-8" />
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-indigo-400 font-black uppercase tracking-widest">Pro Driver Assigned</p>
                                                    <p className="font-black text-gray-900 text-xl">{request.driver.name}</p>
                                                    <a href={`tel:${request.driver.phone}`} className="text-sm text-indigo-600 font-bold mt-1 flex items-center gap-1 hover:underline">
                                                        {request.driver.phone}
                                                    </a>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="bg-gray-50 p-8 rounded-3xl border border-dashed border-gray-200 flex flex-col items-center justify-center text-center">
                                                <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-gray-300 mb-3 shadow-sm">
                                                    <Loader2 className="w-6 h-6 animate-spin" />
                                                </div>
                                                <p className="text-gray-900 font-bold">Finding Provider</p>
                                                <p className="text-gray-400 text-xs font-bold mt-1">Connecting with the nearest driver...</p>
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 bg-white rounded-lg shadow-sm">
                                                    <Truck className="w-4 h-4 text-gray-400" />
                                                </div>
                                                <span className="text-xs font-bold text-gray-400 uppercase">Vehicle Type</span>
                                            </div>
                                            <span className="font-black text-gray-900 capitalize">{request.vehicle_type}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Tracking Timeline */}
                                <div className="pt-12 border-t border-gray-50 space-y-8">
                                    <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                                        <div className="w-2 h-6 bg-green-500 rounded-full" />
                                        Tracking Timeline
                                    </h3>

                                    <div className="relative space-y-0 pb-4">
                                        {/* Vertical line connecting logs */}
                                        <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-100" />

                                        {request.logs?.map((log: any, index: number) => {
                                            const isCurrent = log.status === request.status;

                                            // Status configuration
                                            const statusConfig: Record<string, { icon: any, color: string, label: string }> = {
                                                pending: { icon: Clock, color: 'text-yellow-500', label: t('status_pending') || 'Request Created' },
                                                accepted: { icon: CheckCircle2, color: 'text-blue-500', label: t('status_accepted') || 'Driver Assigned' },
                                                in_progress: { icon: Truck, color: 'text-indigo-500', label: t('status_in_progress') || 'Towing in Progress' },
                                                completed: { icon: CheckCircle2, color: 'text-green-500', label: t('status_completed') || 'Job Completed' },
                                                cancelled: { icon: XCircle, color: 'text-red-500', label: t('status_cancelled') || 'Request Cancelled' },
                                            };

                                            const config = statusConfig[log.status] || { icon: Circle, color: 'text-gray-400', label: log.status };
                                            const Icon = config.icon;

                                            return (
                                                <div key={index} className="relative pl-12 pb-10 last:pb-0 group">
                                                    {/* Timeline Point */}
                                                    <div className={`absolute left-0 top-0 w-8 h-8 rounded-full border-4 border-white shadow-sm flex items-center justify-center transition-all duration-300 z-10
                                                        ${isCurrent ? 'bg-primary scale-125 shadow-lg shadow-primary/20' : 'bg-gray-200'}
                                                    `}>
                                                        <Icon className={`w-3.5 h-3.5 ${isCurrent ? 'text-white' : 'text-gray-400'}`} />
                                                    </div>

                                                    <div className={`transition-all duration-300 ${isCurrent ? 'translate-x-2' : ''}`}>
                                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 sm:gap-4">
                                                            <p className={`font-black text-base uppercase tracking-tight ${isCurrent ? 'text-gray-900' : 'text-gray-400'}`}>
                                                                {config.label}
                                                            </p>
                                                            <p className="text-[10px] font-bold text-gray-400 font-mono tracking-widest uppercase bg-gray-50 px-2 py-0.5 rounded sm:bg-transparent">
                                                                {new Date(log.timestamp).toLocaleDateString()} at {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </p>
                                                        </div>
                                                        <p className="text-xs font-medium text-gray-500 mt-1">
                                                            Updated by {log.updated_by}
                                                        </p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Actions */}
                                {canCancel && (
                                    <div className="pt-8 border-t border-gray-50">
                                        <div className="flex flex-col sm:flex-row items-center gap-6 p-8 bg-red-50/50 rounded-[2rem] border border-red-50">
                                            <div className="flex-1">
                                                <h4 className="text-red-900 font-black text-lg">Changed your mind?</h4>
                                                <p className="text-red-700/70 font-medium text-sm mt-1">You can cancel your request before the driver starts the journey. This action cannot be undone.</p>
                                            </div>
                                            <button
                                                onClick={() => {
                                                    if (window.confirm('Are you sure you want to cancel this towing request?')) {
                                                        cancelMutation.mutate();
                                                    }
                                                }}
                                                disabled={cancelMutation.isPending}
                                                className="w-full sm:w-auto px-10 py-4 bg-white hover:bg-red-600 hover:text-white text-red-600 font-black rounded-2xl transition-all shadow-sm border border-red-100 flex items-center justify-center gap-3 disabled:opacity-50"
                                            >
                                                {cancelMutation.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : <XCircle className="w-5 h-5" />}
                                                Cancel Request
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : null}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Re-using Navigation icon from Lucide since I used it inside return but missed import
const Navigation = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polygon points="3 11 22 2 13 21 11 13 3 11" />
    </svg>
);

export default TrackRequest;
