import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { ClipboardList, Clock, CheckCircle, XCircle, ChevronRight, User, Truck } from 'lucide-react';

interface TowingRequest {
    id: number;
    tracking_id: string;
    customer_name: string;
    driver_name: string | null;
    status: string;
    vehicle_type: string;
    pickup_address: string;
    destination_address: string;
    created_at: string;
}

const TowRequests: React.FC = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-tow-requests'],
        queryFn: async () => {
            const response = await api.get('/v1/admin/requests');
            return response.data.data; // Paginated data
        },
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-medium">Loading requests...</div>;

    const requests: TowingRequest[] = data || [];

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

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-gray-900">Tow Requests</h1>
                <div className="flex gap-2">
                    <button className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors">
                        Export CSV
                    </button>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left rtl:text-right">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-black tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Request Details</th>
                                <th className="px-6 py-4">Parties</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.map((request) => (
                                <tr key={request.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="font-mono text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                                                {request.tracking_id}
                                            </div>
                                            <div className="font-bold text-gray-900 capitalize">{request.vehicle_type}</div>
                                            <div className="text-[10px] text-gray-400 line-clamp-1 max-w-[200px]">
                                                {request.pickup_address || 'N/A'}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-2 text-xs">
                                                <User className="w-3 h-3 text-gray-400" />
                                                <span className="font-bold text-gray-700">{request.customer_name || 'Guest'}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs">
                                                <Truck className="w-3 h-3 text-gray-400" />
                                                <span className={request.driver_name ? "font-bold text-gray-700" : "text-gray-400 italic"}>
                                                    {request.driver_name || 'Unassigned'}
                                                </span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(request.status)}`}>
                                            {request.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold text-gray-500">
                                            {new Date(request.created_at).toLocaleDateString()}
                                            <div className="text-[10px] font-medium opacity-60">
                                                {new Date(request.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all">
                                            <ChevronRight className="w-5 h-5" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default TowRequests;
