import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/auth.store';
import api from '../../../services/api';

const LoginPage = () => {
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const { lang } = useParams<{ lang: string }>();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const loginMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post('/v1/auth/login', { email, password });
            return response.data;
        },
        onSuccess: (responseBody) => {
            const { data } = responseBody;
            const { access_token, refresh_token, ...user } = data;

            // Map access_token to token for the auth store
            setAuth(user, access_token, refresh_token);

            if (user.role === 'admin') {
                navigate(`/${lang}/admin/dashboard`);
            } else {
                navigate(`/${lang}/customer/dashboard`);
            }
        },
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginMutation.isPending) return;
        loginMutation.mutate();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                <div>
                    <h2 className="text-center text-3xl font-extrabold text-gray-900">
                        {t('login')}
                    </h2>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <input
                                type="email"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <input
                                type="password"
                                required
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    {loginMutation.isError && (
                        <div className="text-red-500 text-sm text-center">
                            {(loginMutation.error as any)?.response?.data?.message || 'Login failed'}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
                        >
                            {loginMutation.isPending ? t('loading') : t('login')}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <Link to={`/${lang}/register`} className="text-primary hover:underline">
                            {t('register')}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
