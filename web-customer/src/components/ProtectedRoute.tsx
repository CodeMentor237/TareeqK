import React from 'react';
import { Navigate, useParams } from 'react-router-dom';
import { useAuthStore } from '../store/auth.store';

interface ProtectedRouteProps {
    children: React.ReactNode;
    allowedRoles?: ('customer' | 'driver' | 'admin')[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, allowedRoles }) => {
    const user = useAuthStore((state) => state.user);
    const { lang } = useParams<{ lang: string }>();

    if (!user) {
        return <Navigate to={`/${lang}/login`} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // If the user is authenticated but not authorized, redirect to their role's dashboard or login
        const redirectPath = user.role === 'admin' ? `/${lang}/admin/dashboard` : `/${lang}/customer/dashboard`;
        return <Navigate to={redirectPath} replace />;
    }

    return <>{children}</>;
};

export default ProtectedRoute;
