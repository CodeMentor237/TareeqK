import React from 'react';
import { useQuery } from '@tanstack/react-query';
import api from '../../../services/api';
import { Truck, Mail, Phone, ShieldCheck, MapPin } from 'lucide-react';

interface Driver {
    id: number;
    name: string;
    email: string;
    phone: string;
    is_available: boolean;
    created_at: string;
}

const Drivers: React.FC = () => {
    const { data, isLoading } = useQuery({
        queryKey: ['admin-drivers'],
        queryFn: async () => {
            const response = await api.get('/v1/admin/users?role=driver');
            return response.data.data.data;
        },
    });

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-medium">Loading drivers...</div>;

    const drivers: Driver[] = data || [];

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-gray-900">Driver Management</h1>
                <div className="flex gap-3">
                    <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-sm font-bold text-green-600">
                        Available: {drivers.filter(d => d.is_available).length}
                    </div>
                    <div className="bg-white px-4 py-2 rounded-xl border border-gray-100 shadow-sm text-sm font-bold text-gray-500">
                        Total: {drivers.length}
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left rtl:text-right">
                        <thead className="bg-gray-50 text-xs uppercase text-gray-500 font-black tracking-wider">
                            <tr>
                                <th className="px-6 py-4">Driver</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Contact</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {drivers.map((driver) => (
                                <tr key={driver.id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 font-bold">
                                                <Truck className="w-5 h-5" />
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900">{driver.name}</div>
                                                <div className="text-xs text-gray-400 font-medium tracking-tight">Verified Driver</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${driver.is_available
                                                ? 'bg-emerald-100 text-emerald-700'
                                                : 'bg-red-100 text-red-700'
                                            }`}>
                                            <span className={`w-1.5 h-1.5 rounded-full ${driver.is_available ? 'bg-emerald-500' : 'bg-red-500 animate-pulse'}`}></span>
                                            {driver.is_available ? 'Available' : 'Busy'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Mail className="w-3.5 h-3.5 opacity-40" />
                                                <span>{driver.email}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-sm text-gray-600">
                                                <Phone className="w-3.5 h-3.5 opacity-40" />
                                                <span>{driver.phone}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        <div className="flex justify-end gap-2">
                                            <button className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-gray-50 rounded-lg transition-all">
                                                <MapPin className="w-4 h-4" />
                                            </button>
                                            <button className="text-xs font-black text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg transition-colors">
                                                Profile
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {drivers.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="px-6 py-12 text-center text-gray-400 font-medium">
                                        No drivers found.
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

export default Drivers;
