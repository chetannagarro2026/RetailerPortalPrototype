import { useState } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { activeBrandConfig } from "../../config/brandConfig";

export default function GuestBanner() {
  const { isAuthenticated } = useAuth();
  const [dismissed, setDismissed] = useState(false);
  const config = activeBrandConfig;

  if (isAuthenticated || dismissed) return null;

  return (
    <div
      className="w-full px-4 py-2.5 text-center text-sm font-medium flex items-center justify-center gap-3"
      style={{ backgroundColor: config.primaryColor, color: "#fff", zIndex: 60 }}
    >
      <span>
        You are browsing as Guest.{" "}
        <Link
          to="/sign-in"
          className="underline font-semibold"
          style={{ color: "#fff" }}
        >
          Sign in
        </Link>{" "}
        to access wholesale pricing and place orders.
      </span>
      <button
        onClick={() => setDismissed(true)}
        className="p-1 rounded cursor-pointer transition-colors hover:bg-white/20"
        style={{ border: "none", background: "none", color: "#fff" }}
        aria-label="Dismiss"
      >
        <CloseOutlined className="text-xs" />
      </button>
    </div>
  );
}
