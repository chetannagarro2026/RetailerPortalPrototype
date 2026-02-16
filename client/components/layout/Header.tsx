import { useState, useRef, useCallback } from "react";
import { Input, Badge } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import CartDropdown, { useCartCount } from "./CartDropdown";

export default function Header() {
  const config = activeBrandConfig;
  const cartCount = useCartCount();
  const [cartOpen, setCartOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearTimer = useCallback(() => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  }, []);

  const handleCartEnter = useCallback(() => {
    clearTimer();
    setCartOpen(true);
  }, [clearTimer]);

  const handleCartLeave = useCallback(() => {
    closeTimerRef.current = setTimeout(() => {
      setCartOpen(false);
    }, 200);
  }, []);

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white"
      style={{
        height: "var(--header-height)",
        borderBottom: `1px solid ${config.borderColor}`,
      }}
    >
      <div className="max-w-[1440px] mx-auto h-full flex items-center justify-between px-6 lg:px-8">
        {/* Left — Brand Identity (links to home) */}
        <Link to="/" className="flex items-center gap-3 shrink-0 no-underline">
          {config.logoUrl ? (
            <img
              src={config.logoUrl}
              alt={config.brandName}
              className="h-8 w-auto"
            />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: config.primaryColor }}
              >
                {config.brandName.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <span
                  className="text-base font-semibold tracking-tight"
                  style={{ color: config.primaryColor }}
                >
                  {config.brandName}
                </span>
                <span className="text-xs text-gray-400 ml-2 font-normal tracking-wide uppercase">
                  {config.portalTitle}
                </span>
              </div>
            </div>
          )}
        </Link>

        {/* Center — Global Search */}
        <div className="hidden md:flex flex-1 max-w-md mx-8">
          <Input
            placeholder={config.searchPlaceholder}
            prefix={<SearchOutlined className="text-gray-400" />}
            size="middle"
            className="rounded-lg"
            style={{
              backgroundColor: "#F8F9FA",
              borderColor: "transparent",
            }}
          />
        </div>

        {/* Right — Utility Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Mobile search icon */}
          <button className="md:hidden p-2 text-gray-500 hover:text-gray-700 transition-colors">
            <SearchOutlined className="text-lg" />
          </button>

          <Badge dot size="small" offset={[-2, 2]}>
            <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50">
              <BellOutlined className="text-lg" />
            </button>
          </Badge>

          {/* Cart Icon */}
          <div
            className="relative"
            onMouseEnter={handleCartEnter}
            onMouseLeave={handleCartLeave}
          >
            <Badge count={cartCount} size="small" offset={[-4, 4]}>
              <button className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50 cursor-pointer">
                <ShoppingCartOutlined className="text-lg" />
              </button>
            </Badge>
            <CartDropdown
              visible={cartOpen}
              onClose={() => setCartOpen(false)}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
