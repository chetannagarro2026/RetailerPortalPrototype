import { useState } from "react";
import { activeBrandConfig } from "../config/brandConfig";
import ActiveSchemesTab from "../components/schemes/ActiveSchemesTab";
import AchievementsTab from "../components/schemes/AchievementsTab";

type TabKey = "active" | "achievements";

const TABS: { key: TabKey; label: string }[] = [
  { key: "active", label: "Active Schemes" },
  { key: "achievements", label: "My Achievements" },
];

export default function SchemesPage() {
  const config = activeBrandConfig;
  const [activeTab, setActiveTab] = useState<TabKey>("active");

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", boxSizing: "border-box" }}>
      <div className="px-6 pt-6 pb-2">
        <h1 className="text-xl font-bold m-0 mb-1" style={{ color: config.primaryColor }}>
          Schemes & Promotions
        </h1>
        <p className="text-sm m-0 mb-5" style={{ color: config.secondaryColor }}>
          Track active schemes, view progress, and manage earned benefits.
        </p>

        {/* Tabs */}
        <div className="flex gap-1 mb-6" style={{ borderBottom: `1px solid ${config.borderColor}` }}>
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className="px-4 py-2.5 text-sm font-medium cursor-pointer bg-transparent border-none transition-colors"
              style={{
                color: activeTab === tab.key ? config.primaryColor : config.secondaryColor,
                fontWeight: activeTab === tab.key ? 600 : 400,
                borderBottom: activeTab === tab.key ? `2px solid ${config.primaryColor}` : "2px solid transparent",
                marginBottom: -1,
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="px-6 pb-8">
        {activeTab === "active" && <ActiveSchemesTab />}
        {activeTab === "achievements" && <AchievementsTab />}
      </div>
    </div>
  );
}
