import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import api from '../../../services/api';
import { ShieldCheck, RefreshCw } from 'lucide-react';

const OTPVerificationPage = () => {
    const navigate = useNavigate();
    const { lang } = useParams<{ lang: string }>();
    const location = useLocation();
    const email = location.state?.email;
    const initialMessage = location.state?.message;

    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

    useEffect(() => {
        if (!email) {
            navigate(`/${lang}/register`);
        }
        // Focus first input on mount
        inputRefs.current[0]?.focus();
    }, [email, navigate, lang]);

    const verifyMutation = useMutation({
        mutationFn: async (otpCode: string) => {
            const response = await api.post('/v1/auth/verify-otp', {
                email,
                otp_code: otpCode,
            });
            return response.data;
        },
        onSuccess: () => {
            navigate(`/${lang}/login`, { state: { message: 'Email verified successfully. You can now login.' } });
        },
    });

    const resendMutation = useMutation({
        mutationFn: async () => {
            const response = await api.post('/v1/auth/send-otp', { email });
            return response.data;
        },
    });

    const handleChange = (index: number, value: string) => {
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const otpCode = otp.join('');
        if (otpCode.length === 6) {
            verifyMutation.mutate(otpCode);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
            <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-xl shadow-sm border border-gray-100">
                <div className="text-center">
                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
                        <ShieldCheck className="h-6 w-6 text-primary" />
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">
                        Verify your email
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        We've sent a 6-digit verification code to <br />
                        <span className="font-semibold text-gray-900">{email}</span>
                    </p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="flex justify-between gap-2">
                        {otp.map((digit, index) => (
                            <input
                                key={index}
                                ref={(el) => { if (el) inputRefs.current[index] = el; }}
                                type="text"
                                maxLength={1}
                                value={digit}
                                onChange={(e) => handleChange(index, e.target.value)}
                                onKeyDown={(e) => handleKeyDown(index, e)}
                                className="w-12 h-12 text-center text-xl font-bold border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                            />
                        ))}
                    </div>

                    {initialMessage && !verifyMutation.isError && (
                        <div className="bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-md text-sm text-center">
                            {initialMessage}
                        </div>
                    )}

                    {verifyMutation.isError && (
                        <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-md">
                            {(verifyMutation.error as any)?.response?.data?.message || 'Verification failed'}
                        </div>
                    )}

                    <div>
                        <button
                            type="submit"
                            disabled={verifyMutation.isPending || otp.join('').length !== 6}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
                        >
                            {verifyMutation.isPending ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </div>

                    <div className="text-center">
                        <button
                            type="button"
                            disabled={resendMutation.isPending}
                            onClick={() => resendMutation.mutate()}
                            className="text-sm font-medium text-primary hover:text-primary-dark flex items-center justify-center mx-auto gap-1"
                        >
                            {resendMutation.isPending ? (
                                <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : null}
                            {resendMutation.isSuccess ? 'Code resent!' : "Didn't receive a code? Resend"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default OTPVerificationPage;
