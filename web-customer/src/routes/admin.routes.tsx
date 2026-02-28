import React from 'react';
import { Route, Routes, Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

const AdminDashboard = React.lazy(() => import('../modules/admin/pages/Dashboard'));

const RequireAdmin = ({ children }: { children: React.ReactNode }) => {
    const user = useAuthStore((state) => state.user);
    const { lang } = useParams<{ lang: string }>();
    if (!user || user.role !== 'admin') {
        return <Navigate to={`/${lang}/login`} replace />;
    }
    return <>{children}</>;
};

export const AdminRoutes = () => (
    <Routes>
        <Route
            path="dashboard"
            element={
                <RequireAdmin>
                    <AdminDashboard />
                </RequireAdmin>
            }
        />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
);
