// const AuthLayout = ({ title, children }) => {
//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-indigo-500 to-purple-600">
//       <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
//         <h2 className="text-2xl font-bold text-center mb-6">{title}</h2>
//         {children}
//       </div>
//     </div>
//   );
// };

// export default AuthLayout;


// import React from 'react';
// import { Navigate } from 'react-router-dom';

// const AuthLayout = ({ children }) => {
//     // Check if a token exists in localStorage
//     const token = localStorage.getItem("token");

//     // IMPORTANT: If no token, go back to Login
//     if (!token) {
//         return <Navigate to="/" replace />;
//     }

//     // If token exists, render the Dashboard/Map
//     return children;
// };

// export default AuthLayout;

import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthLayout = ({ children, allowedRoles }) => {
    const [isLoading, setIsLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [userRole, setUserRole] = useState(null);
    const location = useLocation();

    useEffect(() => {
        const token = localStorage.getItem("token");
        const role = localStorage.getItem("userRole"); // Fetch role from login data
        
        if (token) {
            setIsAuthenticated(true);
            setUserRole(role);
        } else {
            setIsAuthenticated(false);
        }
        setIsLoading(false);
    }, [location]);

    if (isLoading) {
        return <div className="flex h-screen items-center justify-center">Loading...</div>;
    }

    // 1. Check if logged in
    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // 2. Check if the Role is allowed (RBAC Logic)
    // If the route has restricted roles and the current user isn't one of them:
    if (allowedRoles && !allowedRoles.includes(userRole)) {
        console.warn(`Access denied for role: ${userRole}`);
        // Kick them back to dashboard if they try to access /reports unauthorized
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <>
            {children}
        </>
    );
};

export default AuthLayout;