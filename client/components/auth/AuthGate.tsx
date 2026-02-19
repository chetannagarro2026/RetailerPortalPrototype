import { useEffect } from "react";
import { useAuth } from "../../context/AuthContext";

interface AuthGateProps {
  children: React.ReactNode;
  message?: string;
}

/**
 * Wraps a route element. If the user is not authenticated,
 * triggers the sign-in modal instead of rendering the page.
 */
export default function AuthGate({ children, message }: AuthGateProps) {
  const { isAuthenticated, showSignInModal } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      showSignInModal(
        message || "Sign in to access this section of your account.",
      );
    }
  }, [isAuthenticated, showSignInModal, message]);

  if (!isAuthenticated) return null;

  return <>{children}</>;
}
