import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import api from '../../../services/api';
import {
    Search,
    MapPin,
    ChevronRight,
    ClipboardList,
    PlusCircle,
    Clock,
    RefreshCw
} from 'lucide-react';

interface TowingRequest {
    id: string; // This is the tracking ID from the backend
    status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
    vehicle_type: string;
    pickup: {
        address: string;
    };
    destination: {
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

const RequestsPage: React.FC = () => {
    const { t } = useTranslation('common');
    const { lang } = useParams<{ lang: string }>();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');

    const { data: requests = [], isLoading, refetch, isRefetching } = useQuery<TowingRequest[]>({
        queryKey: ['my-requests-full'],
        queryFn: async () => {
            const response = await api.get('/v1/customer/requests');
            return response.data.data;
        },
    });

    const filteredRequests = requests.filter(req => {
        const matchesSearch = (req.id?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
            (req.pickup?.address?.toLowerCase() || '').includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="text-gray-500 font-bold animate-pulse">Loading your requests...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
                        <ClipboardList className="w-8 h-8 text-primary" />
                        {t('my_requests') || 'My Requests'}
                    </h1>
                    <p className="text-gray-500 font-medium mt-1">View and manage all your roadside assistance requests.</p>
                </div>
                <Link
                    to={`/${lang}/customer/new-request`}
                    className="btn-primary w-full sm:w-auto flex items-center justify-center gap-2 group whitespace-nowrap"
                >
                    <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform" />
                    {t('new_request') || 'New Request'}
                </Link>
            </div>

            {/* Filters Section */}
            <div className="bg-white p-4 sm:p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by tracking ID or address..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-2xl focus:ring-2 focus:ring-primary/20 transition-all font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-hide">
                        {['all', 'pending', 'accepted', 'in_progress', 'completed', 'cancelled'].map((status) => (
                            <button
                                key={status}
                                onClick={() => setStatusFilter(status)}
                                className={`px-4 py-2.5 rounded-xl text-sm font-black whitespace-nowrap transition-all border
                                    ${statusFilter === status
                                        ? 'bg-gray-900 border-gray-900 text-white shadow-lg'
                                        : 'bg-white border-gray-100 text-gray-500 hover:border-gray-300'}
                                `}
                            >
                                {status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ')}
                            </button>
                        ))}
                    </div>
                    <button
                        onClick={() => refetch()}
                        disabled={isRefetching}
                        className="p-3 text-gray-400 hover:text-primary hover:bg-gray-50 rounded-xl transition-all"
                        title="Refresh list"
                    >
                        <RefreshCw className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`} />
                    </button>
                </div>
            </div>

            {/* Requests List */}
            {filteredRequests.length === 0 ? (
                <div className="bg-white rounded-[2.5rem] p-16 sm:p-20 text-center border-2 border-dashed border-gray-100">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <ClipboardList className="w-12 h-12 text-gray-200" />
                    </div>
                    <h3 className="text-2xl font-black text-gray-900 mb-2">No matches found</h3>
                    <p className="text-gray-500 mb-8 max-w-sm mx-auto font-medium">Try adjusting your filters or search term to find what you're looking for.</p>
                    {(searchTerm || statusFilter !== 'all') && (
                        <button
                            onClick={() => { setSearchTerm(''); setStatusFilter('all'); }}
                            className="text-primary font-black underline underline-offset-4"
                        >
                            Reset filters
                        </button>
                    )}
                </div>
            ) : (
                <div className="grid gap-4">
                    {filteredRequests.map((req) => {
                        const statusColorClass = statusColors[req.status] || 'bg-gray-100 text-gray-700';
                        const [bgClass, textClass] = statusColorClass.split(' ');

                        return (
                            <div
                                key={req.id}
                                className="group bg-white p-5 sm:p-6 rounded-[2rem] border border-gray-100 hover:border-primary/30 hover:shadow-2xl hover:shadow-primary/5 transition-all duration-500 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6"
                            >
                                <div className="flex items-start gap-5 w-full sm:w-auto">
                                    <div className={`p-4 rounded-2xl shrink-0 ${bgClass} ${textClass?.replace('text-', 'text-opacity-40 text-') || ''}`}>
                                        <MapPin className="w-8 h-8" />
                                    </div>
                                    <div className="space-y-1.5 flex-1 min-w-0">
                                        <div className="flex items-center gap-3">
                                            <span className="font-mono text-xs text-gray-400 font-bold uppercase tracking-widest">{req.id}</span>
                                            <span className={`px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest leading-normal ${statusColorClass}`}>
                                                {req.status?.replace('_', ' ') || 'Unknown'}
                                            </span>
                                        </div>
                                        <h3 className="font-black text-gray-900 text-lg tracking-tight truncate capitalize">{req.vehicle_type} Request</h3>
                                        <div className="flex items-center gap-1.5 text-gray-500 font-medium text-sm">
                                            <Clock className="w-4 h-4" />
                                            <span>{new Date(req.created_at).toLocaleDateString()} at {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                        <p className="text-gray-500 text-sm font-medium truncate max-w-md mt-1">{req.pickup?.address || 'Pickup Point'}</p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-t-0 border-gray-50">
                                    <Link
                                        to={`/${lang}/customer/track/${req.id}`}
                                        className="flex-1 sm:flex-none px-6 py-3.5 text-sm font-black text-gray-700 bg-gray-50 hover:bg-gray-900 hover:text-white rounded-2xl text-center transition-all flex items-center justify-center gap-3 group/btn shadow-sm"
                                    >
                                        Track Update
                                        <ChevronRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default RequestsPage;
