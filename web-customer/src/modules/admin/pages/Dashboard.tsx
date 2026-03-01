import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { Truck, Clock, CheckCircle, AlertCircle, ClipboardList } from 'lucide-react';
import type { ReactNode } from 'react';

interface Stats {
    total_requests: number;
    active_requests: number;
    completed_requests: number;
    cancelled_requests: number;
    available_drivers: number;
}

interface TowingRequest {
    id: number;
    tracking_id: string;
    customer_name: string;
    status: string;
    vehicle_type: string;
    created_at: string;
}

const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: ReactNode; color: string }) => (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between group hover:shadow-md transition-all">
        <div>
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
            <p className="text-3xl font-black text-gray-900">{value}</p>
        </div>
        <div className={`p-4 rounded-2xl ${color} bg-opacity-10 transition-transform group-hover:scale-110`}>
            {icon}
        </div>
    </div>
);

const AdminDashboard = () => {

    const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
        queryKey: ['admin-stats'],
        queryFn: async () => {
            const response = await api.get('/v1/admin/dashboard');
            return response.data.data;
        },
    });

    const { data: requests = [], isLoading: requestsLoading } = useQuery<TowingRequest[]>({
        queryKey: ['admin-requests'],
        queryFn: async () => {
            const response = await api.get('/v1/admin/requests');
            return response.data.data;
        },
    });

    const loading = statsLoading || requestsLoading;

    if (loading) return <div className="p-12 text-center text-gray-400 font-bold animate-pulse">Initializing Dashboard...</div>;

    return (
        <div className="space-y-8">
            <header>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Executive Overview</h1>
                <p className="text-gray-500 font-medium">Real-time operations monitoring and statistics.</p>
            </header>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Active Requests"
                    value={stats?.active_requests || 0}
                    icon={<Clock className="text-amber-600 w-6 h-6" />}
                    color="bg-amber-500"
                />
                <StatCard
                    title="Available Drivers"
                    value={stats?.available_drivers || 0}
                    icon={<Truck className="text-emerald-600 w-6 h-6" />}
                    color="bg-emerald-500"
                />
                <StatCard
                    title="Completed"
                    value={stats?.completed_requests || 0}
                    icon={<CheckCircle className="text-indigo-600 w-6 h-6" />}
                    color="bg-indigo-500"
                />
                <StatCard
                    title="Total Volume"
                    value={stats?.total_requests || 0}
                    icon={<ClipboardList className="text-gray-600 w-6 h-6" />}
                    color="bg-gray-500"
                />
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-8 py-6 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h2 className="font-black text-xl text-gray-900">Recent Activity</h2>
                        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">Live Feed</p>
                    </div>
                    <button className="text-xs font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-4 py-2 rounded-xl transition-all">
                        View All Requests
                    </button>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left rtl:text-right">
                        <thead className="bg-gray-50 text-[10px] uppercase text-gray-400 font-black tracking-widest">
                            <tr>
                                <th className="px-8 py-4">Request ID</th>
                                <th className="px-8 py-4">Customer</th>
                                <th className="px-8 py-4">Vehicle</th>
                                <th className="px-8 py-4">Status</th>
                                <th className="px-8 py-4">Timestamp</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.slice(0, 5).map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-8 py-5">
                                        <span className="font-mono text-[10px] font-black text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                                            {req.tracking_id}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 font-bold text-gray-900">{req.customer_name || 'Guest User'}</td>
                                    <td className="px-8 py-5 text-sm text-gray-500 font-medium capitalize">{req.vehicle_type}</td>
                                    <td className="px-8 py-5">
                                        <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider ${req.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                                            req.status === 'completed' ? 'bg-emerald-100 text-emerald-700' :
                                                req.status === 'cancelled' ? 'bg-rose-100 text-rose-700' :
                                                    'bg-indigo-100 text-indigo-700'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-5 text-sm font-bold text-gray-400">
                                        {new Date(req.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        <span className="text-[10px] block opacity-50">{new Date(req.created_at).toLocaleDateString()}</span>
                                    </td>
                                </tr>
                            ))}
                            {requests.length === 0 && (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-gray-400 font-bold">
                                        <div className="flex flex-col items-center gap-3">
                                            <AlertCircle className="w-8 h-8 opacity-20" />
                                            <span>No recent requests observed.</span>
                                        </div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
