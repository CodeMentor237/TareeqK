import React, { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import MapPicker from '../../maps/components/MapPicker';
import api from '../../../services/api';
import { useAuthStore } from '../../../store/auth.store';
import { Truck, MapPin, Navigation, Phone, Mail, User as UserIcon, Loader2, XCircle } from 'lucide-react';

interface TowRequestFormProps {
    onSuccess?: (requestId: string) => void;
    className?: string;
}

const TowRequestForm: React.FC<TowRequestFormProps> = ({ onSuccess, className = "" }) => {
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
        customer_name: user?.name || '',
        customer_email: user?.email || '',
        customer_phone: user?.phone || '',
        note: '',
    });

    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const nextStep = () => {
        if (step === 1) {
            if (!formData.pickup_lat || !formData.pickup_lng) {
                setError('Please select a pickup location on the map');
                return;
            }
            if (!user && (!formData.customer_name || !formData.customer_phone)) {
                setError('Please fill in your contact details');
                return;
            }
        }
        setError('');
        setStep(step + 1);
    };

    const prevStep = () => {
        setError('');
        setStep(step - 1);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Intercept form submission if we are only on step 1 (e.g. from pressing enter)
        if (step === 1) {
            nextStep();
            return;
        }

        setLoading(true);
        setError('');

        try {
            const response = await api.post('/v1/requests', formData);
            const { data: request } = response.data;

            if (onSuccess) {
                onSuccess(request.id);
            } else {
                navigate(`/${lang}/customer/track/${request.id}`);
            }
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden ${className}`}>
            {/* Step Indicator */}
            <div className="flex border-b border-gray-50">
                <div className={`flex-1 py-4 text-center text-xs font-black uppercase tracking-widest transition-all ${step === 1 ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-300'}`}>
                    1. Basic Info
                </div>
                <div className={`flex-1 py-4 text-center text-xs font-black uppercase tracking-widest transition-all ${step === 2 ? 'text-primary border-b-2 border-primary bg-primary/5' : 'text-gray-300'}`}>
                    2. Destination
                </div>
            </div>

            <div className="px-6 py-8 sm:px-10">
                <form onSubmit={handleSubmit} className="space-y-8">
                    {step === 1 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* User Info (Only for guests) */}
                            {!user && (
                                <div className="space-y-4 bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest flex items-center gap-2">
                                        <UserIcon className="w-4 h-4 text-primary" />
                                        Contact Information
                                    </h3>
                                    <div className="space-y-3">
                                        <div className="relative">
                                            <UserIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                            <input
                                                type="text"
                                                required
                                                placeholder="Full Name"
                                                className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium"
                                                value={formData.customer_name}
                                                onChange={(e) => setFormData({ ...formData, customer_name: e.target.value })}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                            <div className="relative">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="email"
                                                    required
                                                    placeholder="Email"
                                                    className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium"
                                                    value={formData.customer_email}
                                                    onChange={(e) => setFormData({ ...formData, customer_email: e.target.value })}
                                                />
                                            </div>
                                            <div className="relative">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                                <input
                                                    type="tel"
                                                    required
                                                    placeholder="Phone Number"
                                                    className="block w-full pl-12 pr-4 py-3.5 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium"
                                                    value={formData.customer_phone}
                                                    onChange={(e) => setFormData({ ...formData, customer_phone: e.target.value })}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Vehicle Type */}
                            <div className="space-y-3">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <Truck className="w-4 h-4 text-primary" />
                                    Select Vehicle Type
                                </label>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                    {['car', 'suv', 'truck', 'motorcycle', 'other'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setFormData({ ...formData, vehicle_type: type })}
                                            className={`py-3 px-2 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group
                                                ${formData.vehicle_type === type
                                                    ? 'bg-primary/5 border-primary text-primary'
                                                    : 'bg-white border-gray-100 text-gray-500 hover:border-gray-200'}
                                            `}
                                        >
                                            <span className="text-[10px] font-black uppercase tracking-tighter truncate w-full text-center">{type}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Pickup Map Selection */}
                            <div className="space-y-4">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2 px-1">
                                    <MapPin className="w-4 h-4 text-primary" />
                                    Specify Pickup Point
                                </label>
                                <div className="rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner h-[250px]">
                                    <MapPicker
                                        onLocationSelect={(lat, lng) => {
                                            setFormData({ ...formData, pickup_lat: lat, pickup_lng: lng });
                                        }}
                                        initialLocation={formData.pickup_lat ? { lat: formData.pickup_lat, lng: formData.pickup_lng } : undefined}
                                    />
                                </div>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                                    <input
                                        type="text"
                                        placeholder="Detailed pickup address (optional)"
                                        className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium shadow-sm"
                                        value={formData.pickup_address}
                                        onChange={(e) => setFormData({ ...formData, pickup_address: e.target.value })}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                            {/* Destination Selection (Optional) */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between px-1">
                                    <label className="block text-xs font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                        <Navigation className="w-4 h-4 text-indigo-500" />
                                        Set Destination
                                    </label>
                                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-0.5 rounded-full">Optional</span>
                                </div>
                                <div className="rounded-[2rem] overflow-hidden border border-gray-100 shadow-inner h-[250px]">
                                    <MapPicker
                                        onLocationSelect={(lat, lng) => {
                                            setFormData({ ...formData, destination_lat: lat, destination_lng: lng });
                                        }}
                                        initialLocation={formData.destination_lat ? { lat: formData.destination_lat, lng: formData.destination_lng } : undefined}
                                    />
                                </div>
                                <div className="relative">
                                    <Navigation className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-indigo-500" />
                                    <input
                                        type="text"
                                        placeholder="Where should we take you?"
                                        className="block w-full pl-12 pr-4 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-indigo-500/5 focus:border-indigo-500 transition-all text-sm font-medium shadow-sm"
                                        value={formData.destination_address}
                                        onChange={(e) => setFormData({ ...formData, destination_address: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest px-1">Additional Notes</label>
                                <textarea
                                    className="block w-full px-5 py-4 border border-gray-200 rounded-2xl focus:ring-4 focus:ring-primary/5 focus:border-primary transition-all text-sm font-medium shadow-sm h-32 resize-none"
                                    placeholder="Any details to help the driver?"
                                    value={formData.note}
                                    onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="p-4 rounded-2xl bg-red-50 border border-red-100 text-red-600 text-sm font-bold flex items-center gap-3 animate-in shake duration-500">
                            <XCircle className="w-5 h-5 flex-shrink-0" />
                            {error}
                        </div>
                    )}

                    <div className="flex gap-3 pt-4">
                        {step === 2 && (
                            <button
                                type="button"
                                onClick={prevStep}
                                className="px-8 py-5 rounded-2xl font-black text-gray-500 bg-gray-50 hover:bg-gray-100 transition-all active:scale-95"
                            >
                                Back
                            </button>
                        )}

                        {step === 1 ? (
                            <button
                                type="button"
                                onClick={(e) => {
                                    e.preventDefault();
                                    e.stopPropagation();
                                    nextStep();
                                }}
                                className="flex-1 py-5 rounded-[1.25rem] font-black text-lg bg-primary text-white hover:bg-primary/90 shadow-2xl shadow-primary/20 hover:-translate-y-1 transition-all active:translate-y-0 active:scale-95 flex items-center justify-center gap-3"
                            >
                                Next Step
                                <Navigation className="w-5 h-5 rotate-90" />
                            </button>
                        ) : (
                            <button
                                type="submit"
                                disabled={loading}
                                className={`flex-1 py-5 rounded-[1.25rem] font-black text-lg transition-all flex items-center justify-center gap-3 shadow-2xl elevation-2
                                    ${loading
                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                        : 'bg-primary text-white hover:bg-primary/90 shadow-primary/30 hover:-translate-y-1 active:translate-y-0 active:scale-95'}
                                `}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-6 h-6 animate-spin" />
                                        Processing...
                                    </>
                                ) : (
                                    <>
                                        <Truck className="w-6 h-6" />
                                        Request Towing
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default TowRequestForm;
