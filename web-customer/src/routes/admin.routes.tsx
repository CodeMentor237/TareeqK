import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

const AdminDashboard = React.lazy(() => import('../modules/admin/pages/Dashboard'));

export const AdminRoutes = () => (
    <Routes>
        <Route
            path="dashboard"
            element={
                <ProtectedRoute allowedRoles={['admin']}>
                    <AdminDashboard />
                </ProtectedRoute>
            }
        />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
);
