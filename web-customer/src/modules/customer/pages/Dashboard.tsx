import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';
import { Clock, MapPin, CheckCircle, XCircle } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface TowingRequest {
    id: number;
    tracking_id: string;
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    vehicle_type: string;
    pickup_address: string;
    destination_address: string;
    created_at: string;
}

const statusColors: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-700',
    accepted: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-indigo-100 text-indigo-700',
    completed: 'bg-green-100 text-green-700',
    cancelled: 'bg-red-100 text-red-700',
};

const CustomerDashboard = () => {
    const { t } = useTranslation('common');
    const { lang } = useParams<{ lang: string }>();

    const { data: requests = [], isLoading } = useQuery<TowingRequest[]>({
        queryKey: ['my-requests'],
        queryFn: async () => {
            const response = await api.get('/v1/customer/requests');
            return response.data.data; // Return the array from the data property
        },
    });

    if (isLoading) return <div className="p-8 text-center">{t('loading')}</div>;

    return (
        <div className="max-w-4xl mx-auto p-4 sm:p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-2xl font-bold">{t('my_requests')}</h1>
                <Link to={`/${lang}/`} className="btn-primary">
                    {t('new_request')}
                </Link>
            </div>

            {requests.length === 0 ? (
                <div className="bg-white rounded-xl p-12 text-center border border-dashed border-gray-300">
                    <p className="text-gray-500 mb-4">You haven't made any requests yet.</p>
                    <Link to={`/${lang}/`} className="text-primary hover:underline font-medium">
                        Request a tow now
                    </Link>
                </div>
            ) : (
                <div className="space-y-4">
                    {requests.map((req) => (
                        <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div className="space-y-2">
                                <div className="flex items-center gap-3">
                                    <span className="font-mono text-xs text-gray-400">{req.tracking_id}</span>
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${statusColors[req.status]}`}>
                                        {req.status.replace('_', ' ')}
                                    </span>
                                </div>
                                <h3 className="font-bold text-gray-900 capitalize">{req.vehicle_type}</h3>
                                <div className="flex items-center gap-2 text-sm text-gray-500">
                                    <MapPin className="w-4 h-4" />
                                    <span className="truncate max-w-[200px]">{req.pickup_address || 'Selected Location'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-3 w-full sm:w-auto">
                                <Link
                                    to={`/${lang}/track/${req.id}`}
                                    className="flex-1 sm:flex-none px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg text-center transition-colors"
                                >
                                    {t('track')}
                                </Link>
                                {req.status === 'completed' ? (
                                    <CheckCircle className="text-green-500 w-6 h-6 hidden sm:block" />
                                ) : req.status === 'cancelled' ? (
                                    <XCircle className="text-red-500 w-6 h-6 hidden sm:block" />
                                ) : (
                                    <Clock className="text-yellow-500 w-6 h-6 hidden sm:block animate-pulse" />
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CustomerDashboard;
