import React from 'react';
import { Route, Routes, Navigate } from 'react-router-dom';

const LandingPage = React.lazy(() => import('../modules/landing/pages/LandingPage'));
const LoginPage = React.lazy(() => import('../modules/auth/pages/LoginPage'));
const RegisterPage = React.lazy(() => import('../modules/auth/pages/RegisterPage'));
const TrackRequest = React.lazy(() => import('../modules/tracking/pages/TrackRequest'));

export const PublicRoutes = () => (
    <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="register" element={<RegisterPage />} />
        <Route path="track/:trackingId?" element={<TrackRequest />} />
        <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
);
