import React, { useState } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../../../services/api';
import { KeyRound, ArrowLeft, Mail } from 'lucide-react';

const ForgotPasswordPage = () => {
    const navigate = useNavigate();
    const { lang } = useParams<{ lang: string }>();
    const [email, setEmail] = useState('');

    const forgotPasswordMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post('/v1/auth/forgot-password', { email });
            return response.data;
        },
        onSuccess: () => {
            navigate(`/${lang}/reset-password`, { state: { email } });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (forgotPasswordMutation.isPending) return;
        forgotPasswordMutation.mutate();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                        <KeyRound className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Forgot password?
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        No worries, we'll send you reset instructions.
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
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

                    {forgotPasswordMutation.isError && (
                        <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-md">
                            {(forgotPasswordMutation.error as any)?.response?.data?.message || 'Failed to send reset link'}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={forgotPasswordMutation.isPending}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                        >
                            {forgotPasswordMutation.isPending ? 'Sending...' : 'Reset password'}
                        </button>
                    </div>

                    <div className="text-center">
                        <Link
                            to={`/${lang}/login`}
                            className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center justify-center gap-1"
                        >
                            <ArrowLeft size={16} />
                            Back to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPasswordPage;
