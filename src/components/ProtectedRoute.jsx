import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children, admin = false }) {
  const { user, loading } = useAuth();

  /* ================= WAIT FOR AUTH LOAD ================= */
  if (loading) {
    return null; // or loader spinner
  }

  /* ================= NOT LOGGED IN ================= */
  if (!user) {
    return <Navigate to="/" replace />;
  }

  /* ================= ADMIN ONLY ================= */
  if (admin === true && user.isAdmin !== true) {
    return <Navigate to="/centers" replace />;
  }

  return children;
}
