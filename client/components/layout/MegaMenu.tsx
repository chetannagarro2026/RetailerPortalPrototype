import { useState } from "react";
import { activeBrandConfig } from "../../config/brandConfig";

interface MegaMenuProps {
  visible: boolean;
  onClose: () => void;
}

interface TabContent {
  key: string;
  label: string;
  items: string[];
}

const collectionsTabs: TabContent[] = [
  { key: "all", label: "All Products", items: ["View Full Catalog", "Search All Styles", "Filter by Availability"] },
  { key: "category", label: "By Category", items: ["Apparel", "Outerwear", "Kidswear", "Accessories", "Performance"] },
  { key: "brand", label: "By Brand", items: ["Calvin Klein", "Tommy Hilfiger", "IZOD", "Buffalo", "Arrow"] },
  { key: "gender", label: "By Gender", items: ["Men's", "Women's", "Unisex", "Kids"] },
  { key: "new", label: "New Arrivals", items: ["This Week", "This Month", "Pre-Order", "Coming Soon"] },
  { key: "best", label: "Best Sellers", items: ["Top 50 Styles", "Trending Now", "Reorder Favorites", "Seasonal Picks"] },
];

export default function MegaMenu({ visible, onClose }: MegaMenuProps) {
  const config = activeBrandConfig;
  const [activeTab, setActiveTab] = useState("all");

  if (!visible) return null;

  const activeContent = collectionsTabs.find((t) => t.key === activeTab);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-30"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className="absolute left-0 right-0 z-40 bg-white"
        style={{
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08)",
          borderBottom: `1px solid ${config.borderColor}`,
        }}
      >
        <div className="max-w-[1280px] mx-auto flex" style={{ padding: "24px 32px" }}>
          {/* Left — Vertical Tabs */}
          <div
            className="shrink-0 pr-8"
            style={{
              width: 200,
              borderRight: `1px solid ${config.borderColor}`,
            }}
          >
            <ul className="space-y-1">
              {collectionsTabs.map((tab) => (
                <li key={tab.key}>
                  <button
                    onClick={() => setActiveTab(tab.key)}
                    className="w-full text-left px-3 py-2 rounded-md text-sm transition-colors cursor-pointer"
                    style={{
                      fontWeight: activeTab === tab.key ? 600 : 400,
                      color: activeTab === tab.key ? config.primaryColor : "#6B7280",
                      backgroundColor: activeTab === tab.key ? config.cardBg : "transparent",
                    }}
                  >
                    {tab.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Right — Dynamic Content */}
          <div className="flex-1 pl-8">
            <h4
              className="text-xs font-semibold uppercase tracking-wider mb-4"
              style={{ color: config.secondaryColor }}
            >
              {activeContent?.label}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-3">
              {activeContent?.items.map((item) => (
                <button
                  key={item}
                  onClick={onClose}
                  className="text-left text-sm py-1.5 transition-colors cursor-pointer"
                  style={{ color: "#374151" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = config.primaryColor)}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "#374151")}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
