import { useState, useEffect, useCallback } from "react";
import { Avatar } from "antd";
import { MenuOutlined, DownOutlined, UserOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import MegaMenu from "./MegaMenu";
import AccountDropdown from "./AccountDropdown";
import MobileNav from "./MobileNav";

type OpenPanel = "collections" | "my-account" | null;

export default function Navigation() {
  const config = activeBrandConfig;
  const location = useLocation();
  const [openPanel, setOpenPanel] = useState<OpenPanel>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Close panels on route change
  useEffect(() => {
    setOpenPanel(null);
  }, [location.pathname]);

  // ESC key closes open panels
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpenPanel(null);
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const togglePanel = useCallback((panel: OpenPanel) => {
    setOpenPanel((prev) => (prev === panel ? null : panel));
  }, []);

  // Active state: no highlight on homepage
  const getActiveKey = (): string | null => {
    const path = location.pathname;
    if (path === "/") return null;
    if (path.startsWith("/collections")) return "collections";
    if (path.startsWith("/brands")) return "brands";
    if (path.startsWith("/bulk-order")) return "bulk-order";
    if (path.startsWith("/purchase-orders")) return "purchase-orders";
    if (path.startsWith("/account")) return "my-account";
    return null;
  };

  const activeKey = getActiveKey();

  const navItemStyle = (key: string) => ({
    color: activeKey === key ? config.primaryColor : "#4B5563",
    fontWeight: activeKey === key ? 600 : 500,
    borderBottom: activeKey === key ? `2px solid ${config.navActiveBorder}` : "2px solid transparent",
  });

  return (
    <>
      {/* Desktop Nav */}
      <nav
        className="sticky z-40 bg-white hidden lg:block"
        style={{
          top: "var(--header-height)",
          borderBottom: `1px solid ${config.borderColor}`,
        }}
      >
        <div className="px-2">
          <div className="flex items-center h-[56px] gap-1">
            {config.navItems.map((item) => {
              // Collections — triggers mega menu
              if (item.hasMegaMenu) {
                return (
                  <div key={item.key} className="relative">
                    <button
                      onClick={() => togglePanel("collections")}
                      className="flex items-center gap-1.5 h-[56px] px-4 text-sm transition-colors cursor-pointer bg-transparent"
                      style={navItemStyle(item.key)}
                    >
                      {item.label}
                      <DownOutlined
                        className="text-[10px] transition-transform"
                        style={{
                          transform: openPanel === "collections" ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </button>
                  </div>
                );
              }

              // My Account — triggers dropdown
              if (item.hasDropdown) {
                return (
                  <div key={item.key} className="relative ml-auto">
                    <button
                      onClick={() => togglePanel("my-account")}
                      className="flex items-center gap-2 h-[56px] px-4 text-sm transition-colors cursor-pointer bg-transparent"
                      style={navItemStyle(item.key)}
                    >
                      <Avatar
                        size={24}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: config.primaryColor, fontSize: 11 }}
                      />
                      {item.label}
                      <DownOutlined
                        className="text-[10px] transition-transform"
                        style={{
                          transform: openPanel === "my-account" ? "rotate(180deg)" : "rotate(0deg)",
                        }}
                      />
                    </button>
                    <AccountDropdown
                      visible={openPanel === "my-account"}
                      onClose={() => setOpenPanel(null)}
                    />
                  </div>
                );
              }

              // Standard nav link
              return (
                <Link
                  key={item.key}
                  to={item.path}
                  className="flex items-center h-[56px] px-4 text-sm transition-colors no-underline"
                  style={navItemStyle(item.key)}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Collections Mega Menu */}
        <MegaMenu
          visible={openPanel === "collections"}
          onClose={() => setOpenPanel(null)}
        />
      </nav>

      {/* Mobile hamburger — visible below lg */}
      <div
        className="sticky z-40 bg-white flex lg:hidden items-center px-4"
        style={{
          top: "var(--header-height)",
          height: "48px",
          borderBottom: `1px solid ${config.borderColor}`,
        }}
      >
        <button
          onClick={() => setMobileNavOpen(true)}
          className="p-2 text-gray-600 hover:text-gray-900 transition-colors cursor-pointer"
        >
          <MenuOutlined className="text-lg" />
        </button>
        <span className="ml-3 text-sm font-medium text-gray-700">
          {activeKey
            ? config.navItems.find((i) => i.key === activeKey)?.label || "Menu"
            : "Menu"}
        </span>
      </div>

      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </>
  );
}
