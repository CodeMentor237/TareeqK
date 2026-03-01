import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';
import ProtectedRoute from '../components/ProtectedRoute';

const AppLayout = React.lazy(() => import('../layouts/AppLayout'));
const CustomerDashboard = React.lazy(() => import('../modules/customer/pages/Dashboard'));
const NewRequestPage = React.lazy(() => import('../modules/customer/pages/NewRequestPage'));
const TrackRequest = React.lazy(() => import('../modules/tracking/pages/TrackRequest'));
const RequestsPage = React.lazy(() => import('../modules/customer/pages/RequestsPage'));

export const CustomerRoutes = () => (
    <Routes>
        <Route element={<AppLayout />}>
            <Route
                path="dashboard"
                element={
                    <ProtectedRoute allowedRoles={['customer']}>
                        <CustomerDashboard />
                    </ProtectedRoute>
                }
            />
            <Route
                path="requests"
                element={
                    <ProtectedRoute allowedRoles={['customer']}>
                        <RequestsPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="new-request"
                element={
                    <ProtectedRoute allowedRoles={['customer']}>
                        <NewRequestPage />
                    </ProtectedRoute>
                }
            />
            <Route
                path="track/:trackingId"
                element={
                    <ProtectedRoute allowedRoles={['customer']}>
                        <TrackRequest />
                    </ProtectedRoute>
                }
            />
        </Route>
        <Route path="*" element={<Navigate to="dashboard" replace />} />
    </Routes>
);
