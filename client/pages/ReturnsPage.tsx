import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PlusOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { RETURN_CLAIMS } from "../data/returns";
import type { ClaimStatus } from "../data/returns";
import ReturnsTable from "../components/returns/ReturnsTable";

const TABS: { label: string; value: ClaimStatus | "All" }[] = [
  { label: "All", value: "All" },
  { label: "Submitted", value: "Submitted" },
  { label: "Under Review", value: "Under Review" },
  { label: "Approved", value: "Approved" },
  { label: "Rejected", value: "Rejected" },
  { label: "Completed", value: "Completed" },
];

export default function ReturnsPage() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<ClaimStatus | "All">("All");

  const filtered = useMemo(() => {
    const sorted = [...RETURN_CLAIMS].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    if (activeTab === "All") return sorted;
    return sorted.filter((c) => c.status === activeTab);
  }, [activeTab]);

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "24px 24px", boxSizing: "border-box" }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold m-0" style={{ color: config.primaryColor }}>
          Returns & Claims
        </h1>
        <button
          onClick={() => navigate("/account/returns/new")}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer text-white border-none"
          style={{ backgroundColor: config.primaryColor }}
        >
          <PlusOutlined style={{ fontSize: 12 }} />
          Create Return
        </button>
      </div>

      {/* Tabs */}
      <div
        className="inline-flex rounded-lg overflow-hidden mb-5"
        style={{ border: `1px solid ${config.borderColor}` }}
      >
        {TABS.map((tab, idx) => {
          const isActive = activeTab === tab.value;
          return (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className="px-4 py-2 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
              style={{
                backgroundColor: isActive ? config.primaryColor : "#fff",
                color: isActive ? "#fff" : config.secondaryColor,
                border: "none",
                borderRight: idx < TABS.length - 1 ? `1px solid ${config.borderColor}` : "none",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Table */}
      <ReturnsTable claims={filtered} />
    </div>
  );
}
