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
import { BusinessProfileProvider, useBusinessProfile, businessProfileTransforms } from "../context/BusinessProfileContext";
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

function BusinessProfilePageContent() {
  const config = activeBrandConfig;
  const { businessAccount, loading, error } = useBusinessProfile();
  const [activeTab, setActiveTab] = useState<TabKey>("credit-terms");

  // Determine if KYC is pending based on actual API data
  const isPendingKyc = businessAccount ? 
    !businessProfileTransforms.isKycApproved(businessAccount.accountStatus, businessAccount.taxIdentifications) :
    false;

  const displayStatus = businessAccount ? 
    businessProfileTransforms.getDisplayStatus(businessAccount.accountStatus) :
    '';

  const isPendingStatus = displayStatus === 'Pending KYC' || displayStatus === 'Pending';

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "16px 24px", boxSizing: "border-box" }}>
      {/* Error banner */}
      {error && (
        <div
          className="flex items-center gap-2 rounded-lg px-4 py-3 mb-6"
          style={{ backgroundColor: "#FEF2F2", border: "1px solid #FCA5A5" }}
        >
          <WarningOutlined className="text-sm" style={{ color: "#DC2626" }} />
          <span className="text-xs font-medium" style={{ color: "#991B1B" }}>
            Failed to load business profile: {error}
          </span>
        </div>
      )}

      {/* KYC Pending banner */}
      {!loading && !error && (isPendingKyc || isPendingStatus) && (
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
      <div className="mb-4">
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
      <div className="mt-6" style={{ width: "100%" }}>
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

        {/* Content card — locked to full container width */}
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
            {tabPanels[activeTab]}
          </div>
        </div>
      </div>

      {/* API Integration Notice */}
      {!loading && !error && businessAccount && (
        <div
          className="mt-6 p-4 rounded-lg text-xs"
          style={{ 
            backgroundColor: "#F0F9FF", 
            border: "1px solid #BAE6FD",
            color: "#075985"
          }}
        >
          <strong>API Integration Status:</strong> This page is now connected to the business account API. 
          Some features (document management, detailed credit terms, address contact details) are not available through the current API endpoints. 
          Data shown reflects what's available from the business account service.
        </div>
      )}
    </div>
  );
}
export default function BusinessProfilePage() {
  return (
    <BusinessProfileProvider>
      <BusinessProfilePageContent />
    </BusinessProfileProvider>
  );
}