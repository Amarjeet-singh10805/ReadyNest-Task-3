import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export const ProtectedRoute = () => {
  const { user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!user) return <Navigate to="/login" replace />;

  return <Outlet />;
};

export const PublicOnlyRoute = () => {
  const { user, isCheckingAuth } = useAuthStore();

  if (isCheckingAuth) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (user) return <Navigate to="/" replace />;

  return <Outlet />;
};
