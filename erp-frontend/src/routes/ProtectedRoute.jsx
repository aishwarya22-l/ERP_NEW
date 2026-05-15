import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, roles }) {
  const { user, authLoading } = useAuth();

  if (authLoading) return null;

  const userRole = user?.role?.toString().toLowerCase();
  const allowedRoles = roles ? roles.map((r) => r.toString().toLowerCase()) : null;

  if (!user) return <Navigate to="/" replace />;

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return <Navigate to="/" replace />;
  }

  return children;
}