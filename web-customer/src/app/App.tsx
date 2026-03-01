import React, { Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import '../i18n';
import { PublicRoutes } from '../routes/public.routes';
import { AdminRoutes } from '../routes/admin.routes';
import { CustomerRoutes } from '../routes/customer.routes';
import Navbar from '../components/Navbar';
import { QueryClientProvider } from '@tanstack/react-query';
import { queryClient } from '../lib/queryClient';

const AppContent = () => {
    const { lang } = useParams<{ lang: string }>();
    const { i18n } = useTranslation();
    const navigate = useNavigate();
    const location = useLocation();

    React.useEffect(() => {
        if (lang && ['en', 'ar'].includes(lang) && i18n.language !== lang) {
            i18n.changeLanguage(lang);
        } else if (!lang) {
            const detectedLang = i18n.language.split('-')[0];
            const targetLang = ['en', 'ar'].includes(detectedLang) ? detectedLang : 'en';
            navigate(`/${targetLang}${location.pathname}`, { replace: true });
        }
    }, [lang, i18n, navigate, location.pathname]);

    const isLayoutRoute = location.pathname.includes('/customer/') || location.pathname.includes('/admin/');

    return (
        <QueryClientProvider client={queryClient}>
            <div className="min-h-screen bg-white">
                {!isLayoutRoute && <Navbar />}
                <Suspense fallback={<div className="flex h-screen items-center justify-center font-medium">Loading...</div>}>
                    <Routes>
                        <Route path="admin/*" element={<AdminRoutes />} />
                        <Route path="customer/*" element={<CustomerRoutes />} />
                        <Route path="*" element={<PublicRoutes />} />
                    </Routes>
                </Suspense>
            </div>
        </QueryClientProvider>
    );
};

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/:lang/*" element={<AppContent />} />
                <Route path="*" element={<Navigate to="/en" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
