import { useSelector } from "react-redux";
import type { RootState } from "../redux/store";

export const useAuth = () => {
  const auth = useSelector((state: RootState) => state.auth);

  return {
    user: auth.user,
    loading: auth.loading,
    isAuthenticated: Boolean(auth.user),
  };
};
