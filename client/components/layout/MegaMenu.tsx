import { useState } from "react";
import { activeBrandConfig } from "../../config/brandConfig";
import DepartmentPanel from "./mega-menu/DepartmentPanel";
import BrandPanel from "./mega-menu/BrandPanel";
import PurchasedPanel from "./mega-menu/PurchasedPanel";
import CatalogPanel from "./mega-menu/CatalogPanel";

interface MegaMenuProps {
  visible: boolean;
  onClose: () => void;
}

type TabKey = "department" | "brand" | "purchased" | "catalog";

const tabs: { key: TabKey; label: string }[] = [
  { key: "department", label: "Shop by Department" },
  { key: "brand", label: "Shop by Brand" },
  { key: "purchased", label: "Purchased Items" },
  { key: "catalog", label: "View Full Catalog" },
];

const panelMap: Record<TabKey, React.FC> = {
  department: DepartmentPanel,
  brand: BrandPanel,
  purchased: PurchasedPanel,
  catalog: CatalogPanel,
};

export default function MegaMenu({ visible, onClose }: MegaMenuProps) {
  const config = activeBrandConfig;
  const [activeTab, setActiveTab] = useState<TabKey>("department");

  if (!visible) return null;

  const ActivePanel = panelMap[activeTab];

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

          {/* Right — Dynamic Content */}
          <div className="flex-1 pl-8 overflow-y-auto" style={{ maxHeight: 416 }}>
            <ActivePanel />
          </div>
        </div>
      </div>
    </>
  );
}
