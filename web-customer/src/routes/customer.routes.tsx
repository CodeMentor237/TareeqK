import React from 'react';
import { Route, Routes, Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const CustomerDashboard = React.lazy(() => import('../modules/customer/pages/Dashboard'));

const RequireAuth = ({ children }: { children: React.ReactNode }) => {
    const user = useAuthStore((state) => state.user);
    const { lang } = useParams<{ lang: string }>();
    if (!user) {
        return <Navigate to={`/${lang}/login`} replace />;
    }
    return <>{children}</>;
};

export const CustomerRoutes = () => (
    <Routes>
        <Route
            path="dashboard"
            element={
                <RequireAuth>
                    <CustomerDashboard />
                </RequireAuth>
            }
        />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
);
