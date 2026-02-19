import { useState, useRef, useCallback, useEffect } from "react";
import { Input, Badge } from "antd";
import {
  SearchOutlined,
  BellOutlined,
  ShoppingCartOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import { searchCatalog, type SearchResult } from "../../data/skuIndex";
import CartDropdown, { useCartCount } from "./CartDropdown";
import { useAuth } from "../../contexts/AuthContext";

export default function Header() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const cartCount = useCartCount();
  const { authenticated } = useAuth();
  const [cartOpen, setCartOpen] = useState(false);
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);

  // Debounced search
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(() => {
      const results = searchCatalog(searchQuery, 8);
      setSearchResults(results);
      setSearchOpen(results.length > 0);
    }, 200);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close search on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSearchSelect = (result: SearchResult) => {
    setSearchOpen(false);
    setSearchQuery("");
    navigate(`/product/${result.product.id}`);
  };

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
      <div className="h-full flex items-center justify-between px-6">
        {/* Left — Brand Identity */}
        <Link to="/" className="flex items-center gap-3 shrink-0 no-underline">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt={config.brandName} className="h-8 w-auto" />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: config.primaryColor }}
              >
                {config.brandName.charAt(0)}
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-semibold tracking-tight" style={{ color: config.primaryColor }}>
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
        <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={searchRef}>
          <Input
            placeholder={config.searchPlaceholder}
            prefix={<SearchOutlined className="text-gray-400" />}
            size="middle"
            className="rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => searchResults.length > 0 && setSearchOpen(true)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setSearchOpen(false);
            }}
            style={{ backgroundColor: "#F8F9FA", borderColor: "transparent" }}
          />
          {searchOpen && searchResults.length > 0 && (
            <SearchDropdown
              results={searchResults}
              query={searchQuery}
              onSelect={handleSearchSelect}
            />
          )}
        </div>

        {/* Right — Utility Actions */}
        <div className="flex items-center gap-3 shrink-0">
          {/* Sign in button when unauthenticated */}
          {!authenticated && (
            <Link to="/login" className="px-3 py-1 rounded-md text-sm text-gray-700 hover:bg-gray-50">
              Sign in
            </Link>
          )}
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
              <button
                className="p-2 text-gray-500 hover:text-gray-700 transition-colors rounded-lg hover:bg-gray-50 cursor-pointer"
                onClick={() => navigate("/cart")}
              >
                <ShoppingCartOutlined className="text-lg" />
              </button>
            </Badge>
            <CartDropdown visible={cartOpen} onClose={() => setCartOpen(false)} />
          </div>
        </div>
      </div>
    </header>
  );
}

// ── Search Dropdown ─────────────────────────────────────────────────

const matchLabels: Record<string, string> = {
  "exact-sku": "SKU Match",
  "partial-sku": "SKU",
  name: "Name",
  brand: "Brand",
  attribute: "Attribute",
};

function SearchDropdown({
  results,
  query,
  onSelect,
}: {
  results: SearchResult[];
  query: string;
  onSelect: (r: SearchResult) => void;
}) {
  const config = activeBrandConfig;

  return (
    <div
      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg overflow-hidden z-50"
      style={{
        boxShadow: "0 8px 32px rgba(0,0,0,0.12)",
        border: `1px solid ${config.borderColor}`,
      }}
    >
      <div className="px-3 py-2" style={{ borderBottom: `1px solid ${config.borderColor}` }}>
        <span className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: config.secondaryColor }}>
          {results.length} result{results.length !== 1 ? "s" : ""} for "{query}"
        </span>
      </div>
      <div className="max-h-[320px] overflow-y-auto">
        {results.map((r) => (
          <button
            key={r.product.id}
            onClick={() => onSelect(r)}
            className="w-full px-3 py-2.5 flex items-center gap-3 text-left cursor-pointer transition-colors hover:bg-gray-50"
            style={{ border: "none", background: "none", borderBottom: `1px solid ${config.borderColor}` }}
          >
            <img
              src={r.product.imageUrl}
              alt={r.product.name}
              className="w-10 h-10 rounded-lg object-cover shrink-0"
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: config.primaryColor }}>
                {r.product.name}
              </p>
              <p className="text-[11px]" style={{ color: config.secondaryColor }}>
                {r.product.sku} · ${r.product.price.toFixed(2)}
              </p>
            </div>
            <span
              className="text-[9px] font-semibold uppercase px-1.5 py-0.5 rounded shrink-0"
              style={{
                backgroundColor: r.matchType === "exact-sku" ? "#EEF2FF" : config.cardBg,
                color: r.matchType === "exact-sku" ? "#4338CA" : config.secondaryColor,
              }}
            >
              {matchLabels[r.matchType] || r.matchType}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
