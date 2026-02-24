import { useState } from "react";
import {
  CreditCardOutlined,
  EnvironmentOutlined,
  SafetyCertificateOutlined,
  TeamOutlined,
  FileTextOutlined,
  FolderOutlined,
  WarningOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { businessIdentity } from "../data/businessProfileData";
import BusinessIdentityHeader from "../components/business-profile/BusinessIdentityHeader";
import CreditTermsTab from "../components/business-profile/CreditTermsTab";
import AddressesTab from "../components/business-profile/AddressesTab";
import KycTaxTab from "../components/business-profile/KycTaxTab";
import DistributorsTab from "../components/business-profile/DistributorsTab";
import AgreementsTab from "../components/business-profile/AgreementsTab";
import DocumentsTab from "../components/business-profile/DocumentsTab";

const tabs = [
  { key: "credit-terms", label: "Credit Terms", icon: <CreditCardOutlined /> },
  { key: "addresses", label: "Addresses", icon: <EnvironmentOutlined /> },
  { key: "kyc-tax", label: "KYC & Tax", icon: <SafetyCertificateOutlined /> },
  { key: "distributors", label: "Distributors", icon: <TeamOutlined /> },
  { key: "agreements", label: "Agreements", icon: <FileTextOutlined /> },
  { key: "documents", label: "Documents", icon: <FolderOutlined /> },
] as const;

type TabKey = (typeof tabs)[number]["key"];

const tabPanels: Record<TabKey, React.ReactNode> = {
  "credit-terms": <CreditTermsTab />,
  addresses: <AddressesTab />,
  "kyc-tax": <KycTaxTab />,
  distributors: <DistributorsTab />,
  agreements: <AgreementsTab />,
  documents: <DocumentsTab />,
};

export default function BusinessProfilePage() {
  const config = activeBrandConfig;
  const [activeTab, setActiveTab] = useState<TabKey>("credit-terms");
  const isPendingKyc = businessIdentity.accountStatus === "Pending KYC";

  return (
    <div className="max-w-[1280px] mx-auto px-6 py-8">
      {/* KYC Pending banner */}
      {isPendingKyc && (
        <div
          className="flex items-center gap-2 rounded-lg px-4 py-3 mb-6"
          style={{ backgroundColor: "#FFFBEB", border: "1px solid #FDE68A" }}
        >
          <WarningOutlined className="text-sm" style={{ color: "#D97706" }} />
          <span className="text-xs font-medium" style={{ color: "#92400E" }}>
            Your KYC verification is pending. Some features may be restricted until verification is complete.
          </span>
        </div>
      )}

      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold m-0 mb-1" style={{ color: config.primaryColor }}>
          Business Profile
        </h1>
        <p className="text-sm m-0" style={{ color: config.secondaryColor }}>
          Legal, KYC, distributor and agreement information
        </p>
      </div>

      {/* Identity Header */}
      <BusinessIdentityHeader />

      {/* Card-type Tabs (Ant DS style) */}
      <div className="mt-8">
        {/* Tab bar */}
        <div
          className="flex items-end"
          style={{ borderBottom: `1px solid ${config.borderColor}` }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
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
                  marginRight: "-1px",
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

        {/* Content card — fixed width, does not change per tab */}
        <div
          style={{
            width: "100%",
            boxSizing: "border-box",
            border: `1px solid ${config.borderColor}`,
            borderTop: "none",
            borderRadius: "0 0 8px 8px",
            backgroundColor: "#fff",
            padding: 24,
            minHeight: 420,
          }}
        >
          {tabPanels[activeTab]}
        </div>
      </div>
    </div>
  );
}
