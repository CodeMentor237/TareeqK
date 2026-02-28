import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { Clock, MapPin, Truck, CheckCircle, XCircle } from 'lucide-react';

export interface RequestDetails {
    id: number;
    tracking_id: string;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    vehicle_type: string;
    pickup_address: string;
    destination_address: string;
    driver?: {
        name: string;
        phone: string;
    };
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

    const { data: responseData, isLoading, isError } = useQuery({
        queryKey: ['track-request', trackingId],
        queryFn: async () => {
            const response = await api.get(`/v1/requests/track/${trackingId}`);
            return response.data;
        },
        enabled: !!trackingId,
        retry: false, // Don't keep polling if it fails (e.g. 404)
        refetchInterval: (query) => {
            const status = query.state.data?.data?.status;
            // Only poll if request exists and is NOT completed or cancelled
            if (status && !['completed', 'cancelled'].includes(status)) {
                return 10000;
            }
            return false;
        },
    });

    const request = responseData?.data;

    if (!trackingId) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-sm border border-gray-100 space-y-6">
                    <h2 className="text-2xl font-bold text-center">{t('track_request')}</h2>
                    <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); window.location.href = `/${lang}/track/${inputId}`; }}>
                        <input
                            type="text"
                            placeholder="Enter Tracking ID (e.g. TRK-XXXX)"
                            className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                            value={inputId}
                            onChange={(e) => setInputId(e.target.value)}
                        />
                        <button type="submit" className="w-full btn-primary">Track</button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow-sm rounded-xl border border-gray-100 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <h2 className="text-xl font-bold bg-white">{t('track_request')}</h2>
                        <span className="text-sm text-gray-400 font-mono">{trackingId}</span>
                    </div>

                    <div className="p-6">
                        {isLoading && !request ? (
                            <div className="flex justify-center py-12">{t('loading')}</div>
                        ) : isError ? (
                            <div className="text-center py-12">
                                <p className="text-red-500 mb-4">Request not found or failed to fetch</p>
                                <Link to={`/${lang}/track`} className="text-primary hover:underline">Try another ID</Link>
                            </div>
                        ) : request ? (
                            <div className="space-y-8">
                                {/* Status Bar */}
                                <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                                    <div className="flex items-center space-x-3 rtl:space-x-reverse">
                                        <Clock className={`w-6 h-6 ${statusColors[request.status]}`} />
                                        <div>
                                            <p className="text-sm text-gray-500">Current Status</p>
                                            <p className={`font-bold uppercase ${statusColors[request.status]}`}>
                                                {request.status.replace('_', ' ')}
                                            </p>
                                        </div>
                                    </div>
                                    {request.status === 'completed' && <CheckCircle className="text-green-500 w-8 h-8" />}
                                    {request.status === 'cancelled' && <XCircle className="text-red-500 w-8 h-8" />}
                                </div>

                                {/* Timeline */}
                                <div className="space-y-4">
                                    <h3 className="font-semibold px-4">Journey Details</h3>
                                    <div className="space-y-6 relative ml-4 rtl:mr-4 border-l-2 border-gray-100 pl-6 rtl:pl-0 rtl:pr-6 rtl:border-r-2">
                                        <div className="relative">
                                            <MapPin className="absolute -left-10 rtl:-right-10 w-8 h-8 p-1.5 bg-white border-2 border-primary text-primary rounded-full" />
                                            <div>
                                                <p className="text-sm font-medium">Pickup Location</p>
                                                <p className="text-gray-500">{request.pickup_address || 'Selected via map'}</p>
                                            </div>
                                        </div>
                                        <div className="relative">
                                            <MapPin className="absolute -left-10 rtl:-right-10 w-8 h-8 p-1.5 bg-white border-2 border-gray-300 text-gray-400 rounded-full" />
                                            <div>
                                                <p className="text-sm font-medium">Destination</p>
                                                <p className="text-gray-500">{request.destination_address || 'Selected via map'}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Driver Info */}
                                {request.driver && (
                                    <div className="bg-primary/5 p-4 rounded-xl border border-primary/10 flex items-center space-x-4 rtl:space-x-reverse">
                                        <div className="bg-primary text-white p-3 rounded-full">
                                            <Truck className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-primary font-bold uppercase">Driver Assigned</p>
                                            <p className="font-bold text-gray-900">{request.driver.name}</p>
                                            <p className="text-sm text-gray-500">{request.driver.phone}</p>
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

export default TrackRequest;
