import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';
import AdminLayout from '../layouts/AdminLayout';

const AdminDashboard = React.lazy(() => import('../modules/admin/pages/Dashboard'));
const Customers = React.lazy(() => import('../modules/admin/pages/Customers'));
const Drivers = React.lazy(() => import('../modules/admin/pages/Drivers'));
const TowRequests = React.lazy(() => import('../modules/admin/pages/TowRequests'));

export const AdminRoutes = () => (
    <Routes>
        <Route element={<AdminLayout />}>
            <Route
                path="dashboard"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <AdminDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="customers"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Customers />
                    </ProtectedRoute>
                }
            />
            <Route
                path="drivers"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <Drivers />
                    </ProtectedRoute>
                }
            />
            <Route
                path="requests"
                element={
                    <ProtectedRoute allowedRoles={['admin']}>
                        <TowRequests />
                    </ProtectedRoute>
                }
            />
            <Route path="*" element={<Navigate to="dashboard" replace />} />
        </Route>
    </Routes>
);
