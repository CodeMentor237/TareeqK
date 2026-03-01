import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../../services/api';
import {
    Clock,
    ChevronRight,
    User as UserIcon,
    Truck,
    Settings,
    Loader2,
    X,
    Eye
} from 'lucide-react';

interface Driver {
    id: number;
    name: string;
    is_available: boolean;
}

interface TowingRequest {
    id: string; // This is tracking_id from resource
    customer_id: number;
    customer_name: string;
    customer_phone: string;
    vehicle_type: string;
    status: string;
    pickup: { address: string };
    destination: { address: string };
    driver?: {
        id: number;
        name: string;
        phone: string;
    };
    created_at: string;
}

const TowRequests: React.FC = () => {
    const navigate = useNavigate();
    const { lang } = useParams<{ lang: string }>();
    const queryClient = useQueryClient();
    const [selectedRequest, setSelectedRequest] = useState<TowingRequest | null>(null);
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);

    // Filters and Pagination State
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [assignedFilter, setAssignedFilter] = useState<string>('all');
    const [page, setPage] = useState(1);

    // Fetch Requests with filters and pagination
    const { data, isLoading } = useQuery({
        queryKey: ['admin-tow-requests', statusFilter, assignedFilter, page],
        queryFn: async () => {
            const params: any = { page };
            if (statusFilter !== 'all') params.status = statusFilter;
            if (assignedFilter !== 'all') params.assigned = assignedFilter;

            const response = await api.get('/v1/admin/requests', { params });
            return response.data; // This will have { data, links, meta }
        },
    });

    const requests = data?.data || [];
    const meta = data?.meta;

    // Fetch Drivers for Assignment
    const { data: drivers = [] } = useQuery<Driver[]>({
        queryKey: ['admin-drivers-list'],
        queryFn: async () => {
            const response = await api.get('/v1/admin/users?role=driver');
            return response.data.data.data;
        },
        enabled: isAssigning
    });

    // Update Status Mutation
    const statusMutation = useMutation({
        mutationFn: async ({ id, status }: { id: string; status: string }) => {
            await api.post(`/v1/admin/requests/${id}/status`, { status });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tow-requests'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            queryClient.invalidateQueries({ queryKey: ['admin-drivers'] });
            setIsManageModalOpen(false);
            setSelectedRequest(null);
        }
    });

    // Reassign Driver Mutation
    const reassignMutation = useMutation({
        mutationFn: async ({ id, driverId }: { id: string; driverId: number }) => {
            await api.post(`/v1/admin/requests/${id}/reassign`, { driver_id: driverId });
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-tow-requests'] });
            queryClient.invalidateQueries({ queryKey: ['admin-drivers-list'] });
            queryClient.invalidateQueries({ queryKey: ['admin-drivers'] });
            queryClient.invalidateQueries({ queryKey: ['admin-stats'] });
            setIsManageModalOpen(false);
            setIsAssigning(false);
            setSelectedRequest(null);
        }
    });

    const handleManage = (request: TowingRequest) => {
        setSelectedRequest(request);
        setIsManageModalOpen(true);
        setIsAssigning(false);
    };

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

    if (isLoading) return (
        <div className="p-8 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
            <p className="text-gray-500 font-medium tracking-tight">Synchronizing Request Data...</p>
        </div>
    );

    const statuses = ['pending', 'accepted', 'in_progress', 'completed', 'cancelled'];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-gray-900">Tow Request Management</h1>
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => queryClient.invalidateQueries({ queryKey: ['admin-tow-requests'] })}
                        className="p-2 text-gray-400 hover:text-indigo-600 transition-colors"
                        title="Refresh Data"
                    >
                        <Clock className="w-5 h-5" />
                    </button>
                    {/* Status Filter */}
                    <select
                        value={statusFilter}
                        onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                        className="text-xs font-bold text-gray-600 bg-white border border-gray-100 rounded-xl px-3 py-2 outline-none focus:border-indigo-200"
                    >
                        <option value="all">All Statuses</option>
                        {statuses.map(s => <option key={s} value={s}>{s.replace('_', ' ').toUpperCase()}</option>)}
                    </select>
                    {/* Assigned Filter */}
                    <select
                        value={assignedFilter}
                        onChange={(e) => { setAssignedFilter(e.target.value); setPage(1); }}
                        className="text-xs font-bold text-gray-600 bg-white border border-gray-100 rounded-xl px-3 py-2 outline-none focus:border-indigo-200"
                    >
                        <option value="all">All Assignments</option>
                        <option value="true">Assigned Only</option>
                        <option value="false">Unassigned Only</option>
                    </select>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left rtl:text-right">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-400 font-black tracking-wider border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Request ID</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Driver Assigned</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Date</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.map((request: TowingRequest) => (
                                <tr key={request.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="font-mono text-[10px] font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded inline-block">
                                            {request.id}
                                        </div>
                                        <div className="font-bold text-gray-900 mt-1 capitalize text-sm">{request.vehicle_type}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2">
                                            <UserIcon className="w-3.5 h-3.5 text-gray-400" />
                                            <span className="font-bold text-gray-700 text-sm">{request.customer_name || 'Guest'}</span>
                                        </div>
                                        <div className="text-[10px] text-gray-400 font-medium ml-5">{request.customer_phone}</div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {request.driver ? (
                                            <div className="flex items-center gap-2">
                                                <Truck className="w-3.5 h-3.5 text-emerald-500" />
                                                <span className="font-bold text-emerald-700 text-sm">{request.driver.name}</span>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400 italic text-xs ml-5">Not Assigned</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider border ${getStatusStyles(request.status)}`}>
                                            {request.status.replace('_', ' ')}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="text-xs font-bold text-gray-500">
                                            {new Date(request.created_at).toLocaleDateString()}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex items-center justify-end gap-2">
                                            <button
                                                onClick={() => navigate(`/${lang}/admin/requests/${request.id}`)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="View Details"
                                            >
                                                <Eye className="w-5 h-5" />
                                            </button>
                                            <button
                                                onClick={() => handleManage(request)}
                                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all"
                                                title="Manage"
                                            >
                                                <Settings className="w-5 h-5" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Pagination Controls */}
                {meta && meta.last_page > 1 && (
                    <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                            Page {page} of {meta.last_page} • {meta.total} Total Requests
                        </div>
                        <div className="flex items-center gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-3 py-1.5 text-[10px] font-black text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 transition-all uppercase tracking-wider"
                            >
                                Prev
                            </button>
                            <div className="flex items-center gap-1">
                                {[...Array(meta.last_page)].map((_, i) => {
                                    const p = i + 1;
                                    // Only show first, last, and pages around current
                                    if (p === 1 || p === meta.last_page || (p >= page - 1 && p <= page + 1)) {
                                        return (
                                            <button
                                                key={p}
                                                onClick={() => setPage(p)}
                                                className={`w-7 h-7 flex items-center justify-center text-[10px] font-black rounded-lg transition-all
                                                    ${page === p
                                                        ? 'bg-indigo-600 text-white shadow-sm'
                                                        : 'bg-white text-gray-400 border border-gray-100 hover:border-indigo-200'
                                                    }`}
                                            >
                                                {p}
                                            </button>
                                        );
                                    }
                                    if (p === page - 2 || p === page + 2) {
                                        return <span key={p} className="text-gray-300">...</span>;
                                    }
                                    return null;
                                })}
                            </div>
                            <button
                                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                                disabled={page === meta.last_page}
                                className="px-3 py-1.5 text-[10px] font-black text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-indigo-50 hover:text-indigo-600 disabled:opacity-50 transition-all uppercase tracking-wider"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Management Modal */}
            {isManageModalOpen && selectedRequest && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="absolute inset-0 bg-black/40 backdrop-blur-sm shadow-inner" onClick={() => setIsManageModalOpen(false)} />
                    <div className="relative bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="p-6 border-b border-gray-50 flex items-center justify-between bg-indigo-600 text-white">
                            <div>
                                <h3 className="font-black text-lg">Manage Request</h3>
                                <p className="text-[10px] font-bold opacity-80 uppercase tracking-widest">{selectedRequest.id}</p>
                            </div>
                            <button onClick={() => setIsManageModalOpen(false)} className="p-2 hover:bg-white/10 rounded-xl transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Assign Driver Section */}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">
                                    {selectedRequest.driver ? 'Change assigned Driver' : 'Assign to Driver'}
                                </label>
                                {!isAssigning ? (
                                    <button
                                        onClick={() => setIsAssigning(true)}
                                        className="w-full flex items-center justify-between p-4 bg-gray-50 border border-gray-100 rounded-2xl hover:border-indigo-200 transition-all group"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-indigo-600">
                                                <Truck className="w-5 h-5" />
                                            </div>
                                            <div className="text-left">
                                                <div className="font-bold text-gray-900">
                                                    {selectedRequest.driver?.name || 'Select a Driver'}
                                                </div>
                                                <div className="text-[10px] text-gray-400 font-bold uppercase">
                                                    {selectedRequest.driver ? 'Currently assigned' : 'No driver yet'}
                                                </div>
                                            </div>
                                        </div>
                                        <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                                    </button>
                                ) : (
                                    <div className="space-y-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {drivers.map(driver => (
                                            <button
                                                key={driver.id}
                                                onClick={() => reassignMutation.mutate({ id: selectedRequest.id, driverId: driver.id })}
                                                disabled={reassignMutation.isPending}
                                                className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-indigo-50 border border-transparent hover:border-indigo-100 transition-all disabled:opacity-50"
                                            >
                                                <div className="font-bold text-gray-700">{driver.name}</div>
                                                <div className="flex items-center gap-2">
                                                    <span className={`w-1.5 h-1.5 rounded-full ${driver.is_available ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-gray-300'}`}></span>
                                                    {reassignMutation.isPending && reassignMutation.variables?.driverId === driver.id && (
                                                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                        {drivers.length === 0 && (
                                            <div className="p-4 text-center text-xs text-gray-400 font-medium italic">No drivers found.</div>
                                        )}
                                        <button
                                            onClick={() => setIsAssigning(false)}
                                            className="w-full py-2 text-xs font-black text-gray-400 hover:text-gray-600 uppercase tracking-widest mt-2 border-t border-gray-50 pt-3"
                                        >
                                            Cancel Assignment
                                        </button>
                                    </div>
                                )}
                            </div>

                            <div className="h-[1px] bg-gray-50" />

                            {/* Status Update Section */}
                            <div>
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-3">Update Status</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {statuses.map(status => (
                                        <button
                                            key={status}
                                            onClick={() => statusMutation.mutate({ id: selectedRequest.id, status })}
                                            disabled={statusMutation.isPending || selectedRequest.status === status}
                                            className={`relative flex items-center justify-center px-3 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-wider border transition-all
                                                ${selectedRequest.status === status
                                                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-[1.02]'
                                                    : 'bg-white text-gray-500 border-gray-100 hover:border-indigo-200'
                                                }
                                                disabled:cursor-not-allowed
                                            `}
                                        >
                                            <span className={statusMutation.isPending && statusMutation.variables?.status === status ? 'opacity-0' : ''}>
                                                {status.replace('_', ' ')}
                                            </span>
                                            {statusMutation.isPending && statusMutation.variables?.status === status && (
                                                <Loader2 className="absolute w-4 h-4 animate-spin text-indigo-400" />
                                            )}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TowRequests;
