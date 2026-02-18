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
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";

interface AccountDropdownProps {
  visible: boolean;
  onClose: () => void;
}

interface DropdownItem {
  key: string;
  label: string;
  icon: React.ReactNode;
  path: string;
  danger?: boolean;
}

interface DropdownSection {
  title: string;
  items: DropdownItem[];
}

const sections: DropdownSection[] = [
  {
    title: "Orders",
    items: [
      { key: "purchase-orders", label: "Purchase Orders", icon: <ShoppingOutlined />, path: "/purchase-orders" },
    ],
  },
  {
    title: "Financials",
    items: [
      { key: "credit", label: "Credit Overview", icon: <CreditCardOutlined />, path: "/account/credit" },
      { key: "invoices", label: "Invoices", icon: <FileTextOutlined />, path: "/account/invoices" },
      { key: "payments", label: "Payments", icon: <DollarOutlined />, path: "/account/payments" },
      { key: "payment-history", label: "Payment History", icon: <HistoryOutlined />, path: "/account/payment-history" },
    ],
  },
  {
    title: "Service",
    items: [
      { key: "returns", label: "Returns & Claims", icon: <RollbackOutlined />, path: "/account/returns" },
      { key: "support", label: "Customer Service", icon: <CustomerServiceOutlined />, path: "/account/support" },
    ],
  },
  {
    title: "Profile",
    items: [
      { key: "details", label: "Account Details", icon: <UserOutlined />, path: "/account/details" },
      { key: "settings", label: "Settings", icon: <SettingOutlined />, path: "/account/settings" },
    ],
  },
];

export default function AccountDropdown({ visible, onClose }: AccountDropdownProps) {
  const config = activeBrandConfig;

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      {/* Dropdown */}
      <div
        className="absolute right-0 z-40 bg-white"
        style={{
          width: 280,
          borderRadius: 8,
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.1)",
          border: `1px solid ${config.borderColor}`,
          padding: "8px 0",
          top: "100%",
          marginTop: 4,
        }}
      >
        {sections.map((section, sectionIdx) => (
          <div key={section.title}>
            <div
              className="px-4 pt-3 pb-1"
            >
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
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = config.cardBg;
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span className="text-base" style={{ color: config.secondaryColor }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            ))}
            {sectionIdx < sections.length - 1 && (
              <div
                className="mx-4 my-1"
                style={{ borderBottom: `1px solid ${config.borderColor}` }}
              />
            )}
          </div>
        ))}

        {/* Sign Out */}
        <div
          className="mx-4 my-1"
          style={{ borderBottom: `1px solid ${config.borderColor}` }}
        />
        <button
          onClick={onClose}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-sm transition-colors cursor-pointer text-left"
          style={{ color: "#DC2626" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = "#FEF2F2";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <LogoutOutlined className="text-base" />
          <span>Sign Out</span>
        </button>
      </div>
    </>
  );
}
