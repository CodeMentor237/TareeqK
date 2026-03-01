import React, { useState } from 'react';
import { useNavigate, useParams, Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../../store/auth.store';
import api from '../../../services/api';
import { Eye, EyeOff, LogIn, Mail } from 'lucide-react';

const LoginPage = () => {
    const { t } = useTranslation('common');
    const navigate = useNavigate();
    const { lang } = useParams<{ lang: string }>();
    const location = useLocation();
    const setAuth = useAuthStore((state) => state.setAuth);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const successMessage = location.state?.message;

    const loginMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post('/v1/auth/login', { email, password, device_type: 'web' });
            return response.data;
        },
        onSuccess: (responseBody) => {
            const { data } = responseBody;
            const { access_token, refresh_token, ...user } = data;

            setAuth(user, access_token, refresh_token);

            if (user.role === 'admin') {
                navigate(`/${lang}/admin/dashboard`);
            } else {
                navigate(`/${lang}/customer/dashboard`);
            }
        },
        onError: (error: any) => {
            if (error?.response?.status === 403 && error?.response?.data?.errors?.email) {
                navigate(`/${lang}/verify-otp`, {
                    state: {
                        email: error.response.data.errors.email,
                        message: error.response.data.message
                    }
                });
            }
        }
    });

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (loginMutation.isPending) return;
        loginMutation.mutate();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                        <LogIn className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        {t('login')}
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Welcome back! Please enter your details
                    </p>
                </div>

                {successMessage && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md text-sm text-center">
                        {successMessage}
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email address
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="email"
                                    required
                                    className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="john@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-1">
                                <label className="block text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                <Link
                                    to={`/${lang}/forgot-password`}
                                    className="text-sm font-medium text-primary hover:text-primary-dark"
                                >
                                    Forgot password?
                                </Link>
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    required
                                    className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {loginMutation.isError && (
                        <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-md">
                            {(loginMutation.error as any)?.response?.data?.message || 'Login failed'}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={loginMutation.isPending}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                        >
                            {loginMutation.isPending ? 'Signing in...' : t('login')}
                        </button>
                    </div>

                    <div className="text-center text-sm">
                        <span className="text-gray-600">Don't have an account? </span>
                        <Link to={`/${lang}/register`} className="font-medium text-primary hover:text-primary-dark underline-offset-4 hover:underline">
                            {t('register')}
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default LoginPage;
