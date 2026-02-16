import { Drawer, Menu } from "antd";
import type { MenuProps } from "antd";
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
} from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";

interface MobileNavProps {
  open: boolean;
  onClose: () => void;
}

export default function MobileNav({ open, onClose }: MobileNavProps) {
  const config = activeBrandConfig;
  const location = useLocation();

  const menuItems: MenuProps["items"] = config.navItems.map((item) => {
    // Collections — expandable with categories
    if (item.hasMegaMenu) {
      return {
        key: item.key,
        label: item.label,
        children: [
          { key: "coll-all", label: <Link to="/collections" onClick={onClose}>All Products</Link> },
          { key: "coll-category", label: <Link to="/collections" onClick={onClose}>By Category</Link> },
          { key: "coll-brand", label: <Link to="/collections" onClick={onClose}>By Brand</Link> },
          { key: "coll-new", label: <Link to="/collections" onClick={onClose}>New Arrivals</Link> },
          { key: "coll-best", label: <Link to="/collections" onClick={onClose}>Best Sellers</Link> },
        ],
      };
    }

    // My Account — expandable with grouped sections
    if (item.hasDropdown) {
      return {
        key: item.key,
        label: item.label,
        children: [
          { key: "acc-credit", icon: <CreditCardOutlined />, label: <Link to="/account/credit" onClick={onClose}>Credit Overview</Link> },
          { key: "acc-invoices", icon: <FileTextOutlined />, label: <Link to="/account/invoices" onClick={onClose}>Invoices</Link> },
          { key: "acc-payments", icon: <DollarOutlined />, label: <Link to="/account/payments" onClick={onClose}>Payments</Link> },
          { key: "acc-history", icon: <HistoryOutlined />, label: <Link to="/account/payment-history" onClick={onClose}>Payment History</Link> },
          { type: "divider" as const },
          { key: "acc-returns", icon: <RollbackOutlined />, label: <Link to="/account/returns" onClick={onClose}>Returns & Claims</Link> },
          { key: "acc-support", icon: <CustomerServiceOutlined />, label: <Link to="/account/support" onClick={onClose}>Customer Service</Link> },
          { type: "divider" as const },
          { key: "acc-details", icon: <UserOutlined />, label: <Link to="/account/details" onClick={onClose}>Account Details</Link> },
          { key: "acc-settings", icon: <SettingOutlined />, label: <Link to="/account/settings" onClick={onClose}>Settings</Link> },
          { type: "divider" as const },
          { key: "acc-signout", icon: <LogoutOutlined />, label: "Sign Out", danger: true },
        ],
      };
    }

    // Standard link
    return {
      key: item.key,
      label: (
        <Link to={item.path} onClick={onClose}>
          {item.label}
        </Link>
      ),
    };
  });

  const getActiveKey = (): string[] => {
    const path = location.pathname;
    if (path === "/") return [];
    const match = config.navItems.find(
      (item) => path === item.path || path.startsWith(item.path + "/")
    );
    return match ? [match.key] : [];
  };

  return (
    <Drawer
      placement="left"
      open={open}
      onClose={onClose}
      width={300}
      styles={{
        header: { borderBottom: `1px solid ${config.borderColor}` },
        body: { padding: 0 },
      }}
      title={
        <Link to="/" onClick={onClose} className="flex items-center gap-2 no-underline">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center text-white text-xs font-semibold"
            style={{ backgroundColor: config.primaryColor }}
          >
            {config.brandName.charAt(0)}
          </div>
          <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
            {config.brandName}
          </span>
        </Link>
      }
    >
      <Menu
        mode="inline"
        selectedKeys={getActiveKey()}
        items={menuItems}
        style={{ border: "none" }}
      />
    </Drawer>
  );
}
