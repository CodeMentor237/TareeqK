import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../../../services/api';
import {
    ChevronLeft,
    Clock,
    User,
    MapPin,
    Truck,
    XCircle,
    Loader2,
    Settings,
    ChevronRight,
    MessageSquare
} from 'lucide-react';

interface Driver {
    id: number;
    name: string;
    is_available: boolean;
}

interface Log {
    status: string;
    updated_by: string;
    timestamp: string;
}

interface TowingRequest {
    id: string; // tracking_id
    customer_name: string;
    customer_phone: string;
    customer_email: string;
    vehicle_type: string;
    status: string;
    pickup: { address: string; lat: number; lng: number };
    destination: { address: string; lat: number; lng: number };
    note: string;
    driver?: {
        id: number;
        name: string;
        phone: string;
    };
    logs: Log[];
    created_at: string;
}

const TowRequestDetails: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [isAssigning, setIsAssigning] = useState(false);

    const { data: request, isLoading, error } = useQuery<TowingRequest>({
        queryKey: ['admin-request-details', id],
        queryFn: async () => {
            const response = await api.get(`/v1/admin/requests/${id}`);
            return response.data.data;
        },
    });

    const { data: drivers = [] } = useQuery<Driver[]>({
        queryKey: ['admin-drivers-list'],
        queryFn: async () => {
            const response = await api.get('/v1/admin/users?role=driver');
            return response.data.data.data;
        },
        enabled: isAssigning
    });

    const statusMutation = useMutation({
        mutationFn: async (status: string) => {
            await api.post(`/v1/admin/requests/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-request-details', id] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
        }
    });

    const reassignMutation = useMutation({
        mutationFn: async (driverId: number) => {
            await api.post(`/v1/admin/requests/${id}/reassign`, { driver_id: driverId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-request-details', id] });
            queryClient.invalidateQueries({ queryKey: ['admin-drivers-list'] });
            setIsAssigning(false);
        }
    });

    if (isLoading) return (
        <div className="p-12 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-10 h-10 animate-spin text-indigo-600" />
            <p className="text-gray-500 font-bold tracking-tight">Loading request intelligence...</p>
        </div>
    );

    if (error || !request) return (
        <div className="p-12 text-center text-rose-500 font-bold">
            <XCircle className="w-12 h-12 mx-auto mb-4 opacity-20" />
            Request not found or access denied.
        </div>
    );

    const getStatusStyles = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-amber-100 text-amber-700 border-amber-200';
            case 'accepted': return 'bg-blue-100 text-blue-700 border-blue-200';
            case 'in_progress': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
            case 'completed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'cancelled': return 'bg-rose-100 text-rose-700 border-rose-200';
            default: return 'bg-gray-100 text-gray-700 border-gray-200';
        }
    };

    const statuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-12">
            {/* Header */}
            <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2.5 bg-white border border-gray-100 rounded-2xl shadow-sm hover:shadow-md hover:border-gray-200 transition-all text-gray-400 hover:text-gray-900"
                    >
                        <ChevronLeft className="w-6 h-6" />
                    </button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Request Details</h1>
                            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(request.status)}`}>
                                {request.status.replace('_', ' ')}
                            </span>
                        </div>
                        <p className="text-gray-400 font-bold uppercase text-[10px] tracking-[0.2em] mt-0.5">{request.id}</p>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Column: Core Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Maps/Location Card Placeholder (Visual) */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
                        <div className="p-8 space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-6">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600 shrink-0 border border-indigo-100">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Pickup Location</p>
                                            <p className="text-sm font-bold text-gray-900 leading-relaxed">{request.pickup.address}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 shrink-0 border border-emerald-100">
                                            <MapPin className="w-5 h-5 shadow-[0_4px_10px_rgba(16,185,129,0.2)]" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1">Destination</p>
                                            <p className="text-sm font-bold text-gray-900 leading-relaxed">{request.destination.address}</p>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                        <MessageSquare className="w-3 h-3" /> Customer Note
                                    </p>
                                    <p className="text-sm font-medium text-gray-600 italic">
                                        {request.note || 'No specific instructions provided.'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Timeline Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-8">
                        <h3 className="font-black text-lg text-gray-900 mb-8 flex items-center gap-3">
                            <Clock className="w-5 h-5 text-indigo-600" /> Status Timeline
                        </h3>
                        <div className="space-y-8 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[2px] before:bg-gray-50">
                            {request.logs?.map((log, index) => (
                                <div key={index} className="relative pl-12">
                                    <div className={`absolute left-[13px] top-1.5 w-2.5 h-2.5 rounded-full ring-4 ring-white shadow-sm
                                        ${index === 0 ? 'bg-indigo-600 scale-125' : 'bg-gray-300'}
                                    `}></div>
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                                        <div>
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${index === 0 ? 'text-indigo-600' : 'text-gray-400'}`}>
                                                {log.status.replace('_', ' ')}
                                            </span>
                                            <p className="text-xs font-bold text-gray-500 mt-0.5">Updated by {log.updated_by}</p>
                                        </div>
                                        <div className="text-[10px] font-bold text-gray-400 uppercase">
                                            {new Date(log.timestamp).toLocaleString()}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Stakeholders & Actions */}
                <div className="space-y-8">
                    {/* Management Actions */}
                    <div className="bg-indigo-600 rounded-3xl shadow-xl p-8 text-white">
                        <h3 className="font-black text-lg mb-6 flex items-center gap-3">
                            <Settings className="w-5 h-5" /> Quick Actions
                        </h3>
                        <div className="space-y-4">
                            {!isAssigning ? (
                                <button
                                    onClick={() => setIsAssigning(true)}
                                    className="w-full flex items-center justify-between p-4 bg-white/10 hover:bg-white/20 rounded-2xl transition-all border border-white/10 group"
                                >
                                    <div className="flex items-center gap-3">
                                        <Truck className="w-5 h-5" />
                                        <div className="text-left leading-tight">
                                            <div className="font-bold">{request.driver ? 'Change Driver' : 'Assign Driver'}</div>
                                            <div className="text-[10px] font-bold opacity-60 uppercase">{request.driver?.name || 'Waiting for assignment'}</div>
                                        </div>
                                    </div>
                                    <ChevronRight className="w-5 h-5 opacity-40 group-hover:translate-x-1 transition-transform" />
                                </button>
                            ) : (
                                <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar-white">
                                    {drivers.map(driver => (
                                        <button
                                            key={driver.id}
                                            onClick={() => reassignMutation.mutate(driver.id)}
                                            disabled={reassignMutation.isPending}
                                            className="w-full flex items-center justify-between p-3 rounded-xl bg-white/5 hover:bg-white/20 transition-all text-xs font-bold"
                                        >
                                            {driver.name}
                                            {reassignMutation.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                                        </button>
                                    ))}
                                    <button onClick={() => setIsAssigning(false)} className="w-full py-2 text-[10px] font-black opacity-60 hover:opacity-100 uppercase mt-2">Cancel</button>
                                </div>
                            )}

                            <div className="pt-4 grid grid-cols-1 gap-2">
                                <label className="text-[10px] font-black opacity-60 uppercase tracking-widest ml-1 mb-1">Set Status</label>
                                {statuses.map(st => (
                                    <button
                                        key={st}
                                        disabled={request.status === st || statusMutation.isPending}
                                        onClick={() => statusMutation.mutate(st)}
                                        className={`w-full py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all border
                                            ${request.status === st
                                                ? 'bg-white text-indigo-600 border-white'
                                                : 'bg-indigo-700/50 text-white/80 border-white/10 hover:bg-indigo-700 hover:text-white'
                                            }
                                            disabled:opacity-50 disabled:cursor-not-allowed
                                        `}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            {st.replace('_', ' ')}
                                            {statusMutation.isPending && statusMutation.variables === st && <Loader2 className="w-3 h-3 animate-spin" />}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Customer Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Customer Intelligence</p>
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                                <User className="w-7 h-7" />
                            </div>
                            <div>
                                <h4 className="font-black text-gray-900">{request.customer_name || 'Anonymous'}</h4>
                                <p className="text-xs font-bold text-gray-400">{request.customer_phone}</p>
                                <p className="text-[10px] font-medium text-indigo-500 underline mt-0.5">{request.customer_email}</p>
                            </div>
                        </div>
                    </div>

                    {/* Driver Card */}
                    <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-8">
                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Assigned Personnel</p>
                        {request.driver ? (
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center text-emerald-600 border border-emerald-100">
                                    <Truck className="w-7 h-7 shadow-sm" />
                                </div>
                                <div>
                                    <h4 className="font-black text-gray-900">{request.driver.name}</h4>
                                    <p className="text-xs font-bold text-gray-400">{request.driver.phone}</p>
                                    <div className="flex items-center gap-1.5 mt-1">
                                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                        <span className="text-[10px] font-black text-emerald-600 uppercase tracking-wider">Active on this job</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="py-4 text-center">
                                <Truck className="w-8 h-8 mx-auto text-gray-200 mb-2" />
                                <p className="text-xs font-bold text-gray-400 italic">No driver currently dispatched.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TowRequestDetails;
