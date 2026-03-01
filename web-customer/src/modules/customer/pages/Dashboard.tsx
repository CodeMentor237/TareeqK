import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';
import {
    Clock,
    MapPin,
    CheckCircle,
    ClipboardList,
    PlusCircle,
    ChevronRight
} from 'lucide-react';
import { Link, useParams } from 'react-router-dom';

interface TowingRequest {
    id: string; // Tracking ID
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    vehicle_type: string;
    pickup: {
        address: string;
    };
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
            return response.data.data;
        },
    });

    const stats = {
        total: requests.length,
        pending: requests.filter(r => r.status === 'pending').length,
        active: requests.filter(r => ['accepted', 'in_progress'].includes(r.status)).length,
        completed: requests.filter(r => r.status === 'completed').length,
    };

    if (isLoading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
    );

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header / Actions Section */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{t('dashboard') || 'Dashboard'}</h1>
                    <p className="text-gray-500 font-medium">Manage and track your towing requests</p>
                </div>
                <Link
                    to={`/${lang}/customer/new-request`}
                    className="group btn-primary w-full sm:w-auto text-center shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-1 transform transition-all flex items-center justify-center gap-2 py-4 px-8"
                >
                    <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    {t('new_request')}
                </Link>
            </div>

            {/* Statistics Widgets Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total', value: stats.total, color: 'bg-white', icon: ClipboardList, textColor: 'text-gray-600', borderColor: 'border-gray-100' },
                    { label: 'Pending', value: stats.pending, color: 'bg-white', icon: Clock, textColor: 'text-yellow-600', borderColor: 'border-yellow-100' },
                    { label: 'Active', value: stats.active, color: 'bg-white', icon: MapPin, textColor: 'text-blue-600', borderColor: 'border-blue-100' },
                    { label: 'Finished', value: stats.completed, color: 'bg-white', icon: CheckCircle, textColor: 'text-green-600', borderColor: 'border-green-100' },
                ].map((stat, i) => (
                    <div key={i} className={`${stat.color} p-5 sm:p-7 rounded-[2rem] border ${stat.borderColor} shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between min-h-[140px]`}>
                        <div className="flex justify-between items-start">
                            <div className={`p-2 rounded-xl bg-opacity-10 ${stat.textColor.replace('text-', 'bg-')}`}>
                                <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                            </div>
                            <span className="text-3xl sm:text-4xl font-black text-gray-900 leading-none">{stat.value}</span>
                        </div>
                        <span className={`text-xs sm:text-sm font-bold uppercase tracking-widest ${stat.textColor} opacity-90`}>{stat.label}</span>
                    </div>
                ))}
            </div>

            {/* Requests Section */}
            <section className="space-y-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        {t('recent_requests') || 'Recent Requests'}
                    </h2>
                    <Link
                        to={`/${lang}/customer/requests`}
                        className="text-primary font-black text-sm hover:underline underline-offset-4 flex items-center gap-1 group"
                    >
                        View All
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>

                {requests.length === 0 ? (
                    <div className="bg-white rounded-[2.5rem] p-16 text-center border-2 border-dashed border-gray-100">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <ClipboardList className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No requests yet</h3>
                        <p className="text-gray-500 mb-8 max-w-xs mx-auto font-medium">You haven't made any requests yet. Need roadside assistance?</p>
                        <Link to={`/${lang}/customer/new-request`} className="text-primary hover:text-primary-dark font-black inline-flex items-center gap-2 group transition-colors">
                            Request a tow now
                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-5">
                        {requests.slice(0, 5).map((req) => {
                            const statusColorClass = statusColors[req.status] || 'bg-gray-100 text-gray-700';
                            const [bgClass, textClass] = statusColorClass.split(' ');

                            return (
                                <div
                                    key={req.id}
                                    className="group bg-white p-5 sm:p-7 rounded-[2rem] border border-gray-100 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-8"
                                >
                                    <div className="flex items-start gap-6 w-full sm:w-auto">
                                        <div className={`p-4 rounded-2xl shrink-0 ${bgClass} ${textClass?.replace('text-', 'text-opacity-40 text-') || ''}`}>
                                            <MapPin className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-2 flex-1 min-w-0">
                                            <div className="flex items-center gap-3 flex-wrap">
                                                <span className="font-mono text-[11px] text-gray-400 font-black uppercase tracking-widest">{req.id}</span>
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest leading-none ${statusColorClass}`}>
                                                    {req.status?.replace('_', ' ') || 'Unknown'}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 text-gray-500 font-medium">
                                                <span className="truncate max-w-[250px] sm:max-w-md text-sm">{req.pickup?.address || 'Selected Location'}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 w-full sm:w-auto pt-6 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                                        <Link
                                            to={`/${lang}/customer/track/${req.id}`}
                                            className="flex-1 sm:flex-none px-8 py-4 text-sm font-black text-gray-700 bg-gray-50 hover:bg-gray-900 hover:text-white rounded-[1.2rem] text-center transition-all flex items-center justify-center gap-3 group/btn shadow-sm"
                                        >
                                            {t('track')}
                                            <ChevronRight className="w-5 h-5 group-hover/btn:translate-x-1 transition-transform" />
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </section>
        </div>
    );
};

export default CustomerDashboard;
