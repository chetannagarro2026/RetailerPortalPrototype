import {
  CreditCardOutlined,
  FileTextOutlined,
  DollarOutlined,
  HistoryOutlined,
  RollbackOutlined,
  CustomerServiceOutlined,
  UserOutlined,
  SettingOutlined,
  LogoutOutlined,
  ShoppingOutlined,
  CheckCircleOutlined,
  LoginOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import { useAuth } from "../../context/AuthContext";

interface AccountDropdownProps {
  visible: boolean;
  onClose: () => void;
}

interface DropdownItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
}

interface DropdownSection {
  title: string;
  items: DropdownItem[];
}

const authenticatedSections: DropdownSection[] = [
  {
    title: "Account",
    items: [
      { key: "details", label: "My Account", icon: <UserOutlined />, path: "/account/details" },
      { key: "settings", label: "Settings", icon: <SettingOutlined />, path: "/account/settings" },
    ],
  },
  {
    title: "Financials",
    items: [
      { key: "credit", label: "Credit History", icon: <CreditCardOutlined />, path: "/account/credit" },
      { key: "invoices", label: "Invoices", icon: <FileTextOutlined />, path: "/account/invoices" },
      { key: "payments", label: "Payments", icon: <DollarOutlined />, path: "/account/payments" },
      { key: "payment-history", label: "Payment History", icon: <HistoryOutlined />, path: "/account/payment-history" },
    ],
  },
  {
    title: "Support",
    items: [
      { key: "support", label: "Customer Service", icon: <CustomerServiceOutlined />, path: "/account/support" },
      { key: "returns", label: "Returns & Claims", icon: <RollbackOutlined />, path: "/account/returns" },
    ],
  },
];

export default function AccountDropdown({ visible, onClose }: AccountDropdownProps) {
  const config = activeBrandConfig;
  const { isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      {/* Dropdown */}
      <div
        className="absolute right-0 z-40 bg-white"
        style={{
          width: 300,
          borderRadius: 8,
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.1)",
          border: `1px solid ${config.borderColor}`,
          padding: "8px 0",
          top: "100%",
          marginTop: 4,
        }}
      >
        {isAuthenticated ? (
          <AuthenticatedContent config={config} onClose={onClose} onSignOut={() => { signOut(); onClose(); }} />
        ) : (
          <GuestContent config={config} onClose={onClose} onNavigateSignIn={() => { onClose(); navigate("/sign-in"); }} />
        )}
      </div>
    </>
  );
}

/* ─── Authenticated Dropdown ─── */

function AuthenticatedContent({
  config,
  onClose,
  onSignOut,
}: {
  config: typeof activeBrandConfig;
  onClose: () => void;
  onSignOut: () => void;
}) {
  return (
    <>
      {authenticatedSections.map((section, sectionIdx) => (
        <div key={section.title}>
          <div className="px-4 pt-3 pb-1">
            <span
              className="text-[11px] font-semibold uppercase tracking-wider"
              style={{ color: config.secondaryColor }}
            >
              {section.title}
            </span>
          </div>
          {section.items.map((item) => (
            <Link
              key={item.key}
              to={item.path}
              onClick={onClose}
              className="flex items-center gap-3 px-4 py-2.5 text-sm transition-colors no-underline"
              style={{ color: "#374151" }}
              onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = config.cardBg; }}
              onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
            >
              <span className="text-base" style={{ color: config.secondaryColor }}>
                {item.icon}
              </span>
              <span>{item.label}</span>
            </Link>
          ))}
          {sectionIdx < authenticatedSections.length - 1 && (
            <div className="mx-4 my-1" style={{ borderBottom: `1px solid ${config.borderColor}` }} />
          )}
        </div>
      ))}

      {/* Sign Out */}
      <div className="mx-4 my-1" style={{ borderBottom: `1px solid ${config.borderColor}` }} />
      <button
        onClick={onSignOut}
        className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors cursor-pointer text-left"
        style={{ color: "#DC2626", border: "none", background: "none" }}
        onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FEF2F2"; }}
        onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
      >
        <LogoutOutlined className="text-base" />
        <span>Sign Out</span>
      </button>
    </>
  );
}

/* ─── Guest Dropdown ─── */

const guestFeatures = [
  "Credit-based purchasing",
  "Live inventory visibility",
  "Bulk ordering tools",
  "Order tracking & invoices",
];

function GuestContent({
  config,
  onClose,
  onNavigateSignIn,
}: {
  config: typeof activeBrandConfig;
  onClose: () => void;
  onNavigateSignIn: () => void;
}) {
  return (
    <div className="px-5 py-4">
      {/* Title */}
      <h3 className="text-base font-semibold mb-1.5" style={{ color: config.primaryColor }}>
        Access Your Account
      </h3>
      <p className="text-xs leading-relaxed mb-5" style={{ color: config.secondaryColor }}>
        Sign in to place orders, track purchase history, manage invoices, and access your credit account.
      </p>

      {/* Buttons */}
      <div className="flex flex-col gap-2.5 mb-5">
        <button
          onClick={onNavigateSignIn}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-semibold rounded-lg cursor-pointer transition-colors text-white"
          style={{ backgroundColor: config.primaryColor, border: "none" }}
        >
          <LoginOutlined className="text-xs" />
          Sign In
        </button>
        <button
          onClick={onNavigateSignIn}
          className="w-full flex items-center justify-center gap-2 py-2.5 text-sm font-medium rounded-lg cursor-pointer transition-colors"
          style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff", color: config.primaryColor }}
        >
          <UserOutlined className="text-xs" />
          Register
        </button>
      </div>

      {/* Feature preview */}
      <div className="pt-4" style={{ borderTop: `1px solid ${config.borderColor}` }}>
        <p className="text-[11px] font-semibold uppercase tracking-wider mb-3" style={{ color: config.secondaryColor }}>
          What you get with an account
        </p>
        <ul className="space-y-2 m-0 p-0 list-none">
          {guestFeatures.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-xs" style={{ color: "#374151" }}>
              <CheckCircleOutlined className="text-[11px]" style={{ color: "#16A34A" }} />
              {feature}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
