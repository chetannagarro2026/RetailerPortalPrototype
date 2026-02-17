import { useState } from "react";
import { RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import DepartmentPanel from "./mega-menu/DepartmentPanel";
import BrandPanel from "./mega-menu/BrandPanel";
import PurchasedPanel from "./mega-menu/PurchasedPanel";

interface MegaMenuProps {
  visible: boolean;
  onClose: () => void;
}

type TabKey = "department" | "brand" | "purchased";

const tabs: { key: TabKey; label: string }[] = [
  { key: "department", label: "Shop by Department" },
  { key: "brand", label: "Shop by Brand" },
  { key: "purchased", label: "Purchased Items" },
];

const panelMap: Record<TabKey, React.FC> = {
  department: DepartmentPanel,
  brand: BrandPanel,
  purchased: PurchasedPanel,
};

export default function MegaMenu({ visible, onClose }: MegaMenuProps) {
  const config = activeBrandConfig;
  const [activeTab, setActiveTab] = useState<TabKey>("department");

  if (!visible) return null;

  const ActivePanel = panelMap[activeTab];
  const activeLabel = tabs.find((t) => t.key === activeTab)?.label;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-30" onClick={onClose} />

      {/* Panel */}
      <div
        className="absolute left-0 right-0 z-40 bg-white"
        style={{
          boxShadow: "0 12px 32px rgba(0, 0, 0, 0.08)",
          borderBottom: `1px solid ${config.borderColor}`,
          maxHeight: 480,
        }}
      >
        <div
          className="max-w-[1280px] mx-auto flex"
          style={{ padding: "32px", minHeight: 360 }}
        >
          {/* Left — Vertical Tabs */}
          <div
            className="shrink-0 pr-8 flex flex-col gap-2"
            style={{
              width: 240,
              borderRight: `1px solid ${config.borderColor}`,
            }}
          >
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="w-full text-left px-4 py-2.5 rounded-lg text-sm transition-colors cursor-pointer border-none"
                style={{
                  fontWeight: activeTab === tab.key ? 600 : 400,
                  color: activeTab === tab.key ? config.primaryColor : "#6B7280",
                  backgroundColor: activeTab === tab.key ? config.cardBg : "transparent",
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Right — Header Row + Dynamic Content */}
          <div className="flex-1 pl-8 flex flex-col" style={{ maxHeight: 416 }}>
            {/* Global Header Row */}
            <div
              className="flex items-center justify-between pb-4 mb-5 shrink-0"
              style={{ borderBottom: `1px solid ${config.borderColor}` }}
            >
              <h4
                className="text-sm font-semibold"
                style={{ color: config.primaryColor }}
              >
                {activeLabel}
              </h4>
              <Link
                to="/collections/all-products"
                onClick={onClose}
                className="flex items-center gap-1.5 text-sm font-semibold no-underline transition-colors"
                style={{ color: "#1677FF" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#4096FF";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "#1677FF";
                }}
              >
                View Full Catalog <RightOutlined className="text-[9px]" />
              </Link>
            </div>

            {/* Dynamic Content */}
            <div className="flex-1 overflow-y-auto">
              <ActivePanel />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
