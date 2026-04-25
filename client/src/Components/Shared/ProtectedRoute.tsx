import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requiredRole?: string;
}

export default function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
    const { isAuthenticated, user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 16 }}>
                <div style={{ width: 40, height: 40, border: "4px solid #f3f3f3", borderTop: "4px solid #3F51B5", borderRadius: "50%", animation: "spin 1s linear infinite" }} />
                <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
                <span style={{ fontSize: 14, color: "#64748b", fontWeight: 500 }}>Verifying session...</span>
            </div>
        );
    }

    if (!isAuthenticated) {
        // If the user is trying to access an admin route, redirect to admin login
        if (location.pathname.startsWith('/admin')) {
            return <Navigate to="/admin/login" state={{ from: location }} replace />;
        }
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requiredRole && user?.role !== requiredRole) {
        // If they don't have the required role, redirect to home or a forbidden page
        // For simplicity, we'll redirect to home or login based on whether it's an admin route
        if (requiredRole === 'Admin') {
            return <Navigate to="/admin/login" replace />;
        }
        return <Navigate to="/home" replace />;
    }

    return <>{children}</>;
}
