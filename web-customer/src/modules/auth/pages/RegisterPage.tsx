import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/auth.store';
import api from '../../../services/api';

const RegisterPage = () => {
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const { lang } = useParams<{ lang: string }>();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        password: '',
        password_confirmation: '',
        role: 'customer',
    });

    const registerMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post('/v1/auth/register', formData);
            return response.data;
        },
        onSuccess: (responseBody) => {
            const { data } = responseBody;
            const { access_token, refresh_token, ...user } = data;

            setAuth(user, access_token);
            navigate(`/${lang}/customer/dashboard`);
        },
    });

    const handleRegister = (e: React.FormEvent) => {
        e.preventDefault();
        if (registerMutation.isPending) return;
        registerMutation.mutate();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        {t('register')}
                    </h2>
                </div>
                <form className="mt-8 space-y-4" onSubmit={handleRegister}>
                    <input
                        type="text"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                    <input
                        type="email"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Email address"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    />
                    <input
                        type="text"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Phone Number"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    />
                    <input
                        type="password"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    />
                    <input
                        type="password"
                        required
                        className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                        placeholder="Confirm Password"
                        value={formData.password_confirmation}
                        onChange={(e) => setFormData({ ...formData, password_confirmation: e.target.value })}
                    />

                    {registerMutation.isError && (
                        <div className="text-red-500 text-sm text-center">
                            {(registerMutation.error as any)?.response?.data?.message || 'Registration failed'}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={registerMutation.isPending}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                        >
                            {registerMutation.isPending ? t('loading') : t('register')}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <Link to={`/${lang}/login`} className="text-primary hover:underline">
                            {t('login')}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RegisterPage;
