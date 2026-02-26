import { useState, useRef, useCallback } from "react";
import { UserOutlined, LockOutlined, BellOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import ProfileTab from "../components/settings/ProfileTab";
import SecurityTab from "../components/settings/SecurityTab";
import NotificationsTab from "../components/settings/NotificationsTab";
import DiscardModal from "../components/settings/DiscardModal";

const tabs = [
  { key: "profile", label: "Profile", icon: <UserOutlined /> },
  { key: "security", label: "Security", icon: <LockOutlined /> },
  { key: "notifications", label: "Notifications", icon: <BellOutlined /> },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function SettingsPage() {
  const config = activeBrandConfig;
  const [activeTab, setActiveTab] = useState<TabKey>("profile");
  const [pendingTab, setPendingTab] = useState<TabKey | null>(null);
  const dirtyRef = useRef(false);

  const setDirty = useCallback((v: boolean) => {
    dirtyRef.current = v;
  }, []);

  const handleTabClick = (key: TabKey) => {
    if (key === activeTab) return;
    if (dirtyRef.current) {
      setPendingTab(key);
    } else {
      setActiveTab(key);
    }
  };

  const confirmDiscard = () => {
    dirtyRef.current = false;
    if (pendingTab) {
      setActiveTab(pendingTab);
      setPendingTab(null);
    }
  };

  const cancelDiscard = () => {
    setPendingTab(null);
  };

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "16px 24px", boxSizing: "border-box" }}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold m-0 mb-1" style={{ color: config.primaryColor }}>
          Settings
        </h1>
        <p className="text-sm m-0" style={{ color: config.secondaryColor }}>
          Manage your personal account preferences
        </p>
      </div>

      {/* Card-type Tabs */}
      <div style={{ width: "100%" }}>
        {/* Tab bar */}
        <div
          className="flex items-end gap-2"
          style={{ borderBottom: `1px solid ${config.borderColor}` }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => handleTabClick(tab.key)}
                className="flex items-center gap-2 px-4 py-2 cursor-pointer transition-colors"
                style={{
                  backgroundColor: isActive ? "#fff" : "#FAFAFA",
                  color: isActive ? config.primaryColor : config.secondaryColor,
                  fontWeight: isActive ? 600 : 400,
                  outline: "none",
                  border: `1px solid ${config.borderColor}`,
                  borderBottom: isActive ? "1px solid #fff" : `1px solid ${config.borderColor}`,
                  borderRadius: "8px 8px 0 0",
                  marginBottom: "-1px",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "#F5F5F5";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "#FAFAFA";
                }}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="text-sm whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Content card */}
        <div
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: `1px solid ${config.borderColor}`,
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            backgroundColor: "#fff",
            padding: 32,
            minHeight: 420,
            overflow: "hidden",
          }}
        >
          <div style={{ width: "100%", minWidth: 0 }}>
            {activeTab === "profile" && <ProfileTab setDirty={setDirty} />}
            {activeTab === "security" && <SecurityTab setDirty={setDirty} />}
            {activeTab === "notifications" && <NotificationsTab setDirty={setDirty} />}
          </div>
        </div>
      </div>

      {/* Discard modal */}
      <DiscardModal open={pendingTab !== null} onDiscard={confirmDiscard} onCancel={cancelDiscard} />
    </div>
  );
}
