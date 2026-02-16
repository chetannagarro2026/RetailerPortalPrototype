import { useState, useCallback, useRef } from "react";
import { Menu } from "antd";
import { MenuOutlined } from "@ant-design/icons";
import { Link, useLocation } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import MegaMenu from "./MegaMenu";
import MobileNav from "./MobileNav";

export default function Navigation() {
  const config = activeBrandConfig;
  const location = useLocation();
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const handleMenuItemEnter = useCallback(
    (key: string, hasMegaMenu?: boolean) => {
      clearCloseTimer();
      if (hasMegaMenu) {
        setActiveMegaMenu(key);
      } else {
        setActiveMegaMenu(null);
      }
    },
    [clearCloseTimer]
  );

  const handleMenuItemLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 200);
  }, []);

  const handleMegaMenuEnter = useCallback(() => {
    clearCloseTimer();
  }, [clearCloseTimer]);

  const handleMegaMenuLeave = useCallback(() => {
    setActiveMegaMenu(null);
  }, []);

  const activeKey =
    config.navItems.find((item) => item.path === location.pathname)?.key ||
    "home";

  const menuItems = config.navItems.map((item) => ({
    key: item.key,
    label: (
      <Link
        to={item.path}
        onMouseEnter={() => handleMenuItemEnter(item.key, item.hasMegaMenu)}
        onMouseLeave={handleMenuItemLeave}
      >
        {item.label}
      </Link>
    ),
  }));

  return (
    <>
      <nav
        className="sticky z-40 bg-white hidden lg:block"
        style={{
          top: "var(--header-height)",
          borderBottom: `1px solid ${config.borderColor}`,
        }}
      >
        <div className="max-w-[1440px] mx-auto px-6 lg:px-8">
          <Menu
            mode="horizontal"
            selectedKeys={[activeKey]}
            items={menuItems}
            style={{
              lineHeight: "54px",
              border: "none",
              fontWeight: 500,
              fontSize: 14,
            }}
          />
        </div>

        {/* Mega Menu */}
        {activeMegaMenu && (
          <MegaMenu
            menuKey={activeMegaMenu}
            visible={!!activeMegaMenu}
            onMouseEnter={handleMegaMenuEnter}
            onMouseLeave={handleMegaMenuLeave}
          />
        )}
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
        <span className="ml-3 text-sm font-medium text-gray-700 capitalize">
          {activeKey === "home" ? "Home" : activeKey.replace("-", " ")}
        </span>
      </div>

      <MobileNav
        open={mobileNavOpen}
        onClose={() => setMobileNavOpen(false)}
      />
    </>
  );
}
