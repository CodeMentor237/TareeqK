import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MapPicker from '../../maps/components/MapPicker';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/auth.store';

const LandingPage = () => {
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const { lang } = useParams<{ lang: string }>();

    const user = useAuthStore((state) => state.user);

    const [formData, setFormData] = useState({
        vehicle_type: 'car',
        pickup_lat: 0,
        pickup_lng: 0,
        destination_lat: 0,
        destination_lng: 0,
        pickup_address: '',
        destination_address: '',
        customer_name: '',
        customer_email: '',
        customer_phone: '',
    });

    const [selectingDestination, setSelectingDestination] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await api.post('/v1/requests', formData);
            const { data: request } = response.data;
            navigate(`/${lang}/track/${request.id}`);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-24">
                <div className="lg:grid lg:grid-cols-12 lg:gap-8">
                    <div className="sm:text-center md:max-w-2xl md:mx-auto lg:col-span-6 lg:text-left rtl:lg:text-right">
                        <h1>
                            <span className="block text-sm font-semibold uppercase tracking-wide text-gray-500 sm:text-base lg:text-sm xl:text-base">
                                {t('welcome')}
                            </span>
                            <span className="mt-1 block text-4xl tracking-tight font-extrabold sm:text-5xl xl:text-6xl">
                                <span className="block text-gray-900">Your roadside</span>
                                <span className="block text-primary">assistance partner</span>
                            </span>
                        </h1>
                        <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-xl lg:text-lg xl:text-xl">
                            Quick, reliable, and professional towing services at your fingertips. Request help now or track your ongoing request.
                        </p>
                    </div>

                    <div className="mt-12 sm:mt-16 lg:mt-0 lg:col-span-6">
                        <div className="bg-white sm:max-w-md sm:w-full sm:mx-auto sm:rounded-lg sm:overflow-hidden border border-gray-100 shadow-xl">
                            <div className="px-4 py-8 sm:px-10">
                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {!user && (
                                        <div className="space-y-4 border-b border-gray-100 pb-4 mb-4">
                                            <div className="grid grid-cols-1 gap-4">
                                                <input
                                                    type="text"
                                                    required
                                                    placeholder="Full Name"
                                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                                    value={formData.customer_name}
                                                    onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                                />
                                                <div className="grid grid-cols-2 gap-4">
                                                    <input
                                                        type="email"
                                                        required
                                                        placeholder="Email"
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                                        value={formData.customer_email}
                                                        onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                                    />
                                                    <input
                                                        type="tel"
                                                        required
                                                        placeholder="Phone Number"
                                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                                        value={formData.customer_phone}
                                                        onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Vehicle Type</label>
                                        <select
                                            className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md"
                                            value={formData.vehicle_type}
                                            onChange={(e) => setFormData({ ...formData, vehicle_type: e.target.value })}
                                        >
                                            <option value="car">Car (Sedan/Hatchback)</option>
                                            <option value="suv">SUV</option>
                                            <option value="truck">Truck</option>
                                            <option value="motorcycle">Motorcycle</option>
                                            <option value="other">Other</option>
                                        </select>
                                    </div>

                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded-lg">
                                            <button
                                                type="button"
                                                onClick={() => setSelectingDestination(false)}
                                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${!selectingDestination ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
                                            >
                                                Pickup Point
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setSelectingDestination(true)}
                                                className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${selectingDestination ? 'bg-white shadow-sm text-primary' : 'text-gray-500'}`}
                                            >
                                                Destination (Optional)
                                            </button>
                                        </div>

                                        <MapPicker
                                            onLocationSelect={(lat, lng) => {
                                                if (selectingDestination) {
                                                    setFormData({ ...formData, destination_lat: lat, destination_lng: lng });
                                                } else {
                                                    setFormData({ ...formData, pickup_lat: lat, pickup_lng: lng });
                                                }
                                            }}
                                            initialLocation={
                                                selectingDestination
                                                    ? (formData.destination_lat ? { lat: formData.destination_lat, lng: formData.destination_lng } : undefined)
                                                    : (formData.pickup_lat ? { lat: formData.pickup_lat, lng: formData.pickup_lng } : undefined)
                                            }
                                        />
                                    </div>

                                    <input
                                        type="text"
                                        placeholder={selectingDestination ? "Destination address (optional)" : "Pickup address (optional)"}
                                        className="block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                        value={selectingDestination ? formData.destination_address : formData.pickup_address}
                                        onChange={(e) => {
                                            if (selectingDestination) {
                                                setFormData({ ...formData, destination_address: e.target.value });
                                            } else {
                                                setFormData({ ...formData, pickup_address: e.target.value });
                                            }
                                        }}
                                    />

                                    {error && <div className="text-red-500 text-sm">{error}</div>}

                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="w-full btn-primary"
                                    >
                                        {loading ? t('loading') : t('request_towing')}
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LandingPage;
