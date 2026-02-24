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

      {/* Horizontal tab nav */}
      <div className="mt-8">
        <nav
          className="flex gap-1 pb-0 mb-0"
          style={{ borderBottom: `1px solid ${config.borderColor}` }}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="flex items-center gap-2 px-4 py-2.5 cursor-pointer transition-colors border-none rounded-t-lg"
                style={{
                  backgroundColor: isActive ? "#fff" : "transparent",
                  color: isActive ? config.primaryColor : config.secondaryColor,
                  fontWeight: isActive ? 600 : 400,
                  outline: "none",
                  borderBottom: isActive ? `2px solid ${config.primaryColor}` : "2px solid transparent",
                  marginBottom: "-1px",
                }}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "#F9FAFB";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <span className="text-sm">{tab.icon}</span>
                <span className="text-sm whitespace-nowrap">{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Content panel — fixed width */}
        <div
          className="w-full rounded-b-xl rounded-tr-xl p-6"
          style={{
            border: `1px solid ${config.borderColor}`,
            borderTop: "none",
            backgroundColor: "#fff",
            minHeight: 400,
          }}
        >
          {tabPanels[activeTab]}
        </div>
      </div>
    </div>
  );
}
