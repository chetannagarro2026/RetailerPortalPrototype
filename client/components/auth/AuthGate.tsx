import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

interface AuthGateProps {
  children: React.ReactNode;
  message?: string;
}

/**
 * Wraps a route element. If the user is not authenticated,
 * redirects to the sign-in page.
 */
export default function AuthGate({ children }: AuthGateProps) {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate("/sign-in", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
