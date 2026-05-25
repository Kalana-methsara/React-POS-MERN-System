import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

interface RequireAuthProps {
  children: ReactNode;
  roles?: string[];
}

export const RequireAuth = ({ children, roles }: RequireAuthProps) => {
  const { user, loading } = useSelector((state: RootState) => state.auth);
  const location = useLocation();

  if (loading) return <div>Loading...</div>;

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (roles && !roles.some((role) => (user.roles as string[]).includes(role))) {
    return <div>Access Denied</div>;
  }

  return children;
};
