import { Navigate } from "react-router-dom";

const RoleGuard = ({ children, allowedRoles }) => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    return <Navigate to="/" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />; // Redirect to their safe dashboard or 403
  }

  return children;
};

export default RoleGuard;
