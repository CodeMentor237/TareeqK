import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

const CustomerDashboard = React.lazy(() => import('../modules/customer/pages/Dashboard'));

export const CustomerRoutes = () => (
    <Routes>
        <Route
            path="dashboard"
            element={
                <ProtectedRoute allowedRoles={['customer']}>
                    <CustomerDashboard />
                </ProtectedRoute>
            }
        />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
);
