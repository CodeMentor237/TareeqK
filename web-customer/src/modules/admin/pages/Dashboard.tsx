import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import api from '../../../services/api';
import { Truck, Clock, CheckCircle } from 'lucide-react';
import type { ReactNode } from 'react';

interface Stats {
    total_requests: number;
    active_drivers: number;
    pending_requests: number;
    completed_requests: number;
}

interface TowingRequest {
    id: number;
    tracking_id: string;
    customer_name: string;
    status: string;
    vehicle_type: string;
    created_at: string;
}

const StatCard = ({ title, value, icon }: { title: string; value: number; icon: ReactNode }) => (
    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm flex items-center justify-between">
        <div>
            <p className="text-sm text-gray-500 mb-1">{title}</p>
            <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
        <div className="p-3 bg-gray-50 rounded-lg">{icon}</div>
    </div>
);

const AdminDashboard = () => {
    const { t } = useTranslation('common');

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

    if (loading) return <div className="p-8 text-center">{t('loading')}</div>;

    return (
        <div className="p-4 sm:p-8 bg-gray-50 min-h-screen">
            <h1 className="text-2xl font-bold mb-8">Admin Dashboard</h1>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <StatCard title="Total Requests" value={stats?.total_requests || 0} icon={<Clock className="text-blue-500" />} />
                <StatCard title="Active Drivers" value={stats?.active_drivers || 0} icon={<Truck className="text-green-500" />} />
                <StatCard title="Pending" value={stats?.pending_requests || 0} icon={<Clock className="text-yellow-500" />} />
                <StatCard title="Completed" value={stats?.completed_requests || 0} icon={<CheckCircle className="text-indigo-500" />} />
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-100">
                    <h2 className="font-bold text-lg">Recent Requests</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left rtl:text-right">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-medium">
                            <tr>
                                <th className="px-6 py-3 text-center">ID</th>
                                <th className="px-6 py-3">Customer</th>
                                <th className="px-6 py-3">Vehicle</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Date</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {requests.map((req) => (
                                <tr key={req.id} className="hover:bg-gray-50 transition-colors">
                                    <td className="px-6 py-4 font-mono text-xs text-gray-400 text-center">{req.tracking_id}</td>
                                    <td className="px-6 py-4 font-medium">{req.customer_name || 'Guest'}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{req.vehicle_type}</td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${req.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                            req.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {req.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-400">
                                        {new Date(req.created_at).toLocaleDateString()}
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

export default AdminDashboard;
