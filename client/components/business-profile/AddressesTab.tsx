import { useState } from "react";
import {
  EnvironmentOutlined,
  PlusOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { useBusinessProfile } from "../../context/BusinessProfileContext";
import { type BusinessAccountAddress } from "../../services/businessAccountService";

const subTabs = ["Billing", "Shipping", "Warehouse"] as const;
type SubTab = (typeof subTabs)[number];

export default function AddressesTab() {
  const config = activeBrandConfig;
  const { businessAccount, loading } = useBusinessProfile();
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("Billing");

  const addresses = businessAccount?.addresses || [];
  // Map API address types to UI tab names
  const filtered = addresses.filter((a) => {
    const normalizedType = a.addrType?.toLowerCase();
    const tabName = activeSubTab.toLowerCase();
    return normalizedType === tabName || 
           (tabName === 'warehouse' && normalizedType === 'shipping'); // Fallback since API might not have warehouse type
  });

  if (loading) {
    return (
      <div style={{ width: "100%" }}>
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="flex gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-8 bg-gray-200 rounded w-20"></div>
            ))}
          </div>
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="border rounded-lg p-4">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: "100%" }}>
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-base font-semibold m-0" style={{ color: config.primaryColor }}>
          Registered Addresses
        </h3>
        <button
          className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md cursor-pointer transition-colors"
          style={{
            color: config.primaryColor,
            border: `1px solid ${config.borderColor}`,
            backgroundColor: "#fff",
          }}
          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
        >
          <PlusOutlined className="text-[10px]" />
          Add Address
        </button>
      </div>

      {/* Sub-tabs */}
      <div className="flex gap-1 mb-6">
        {subTabs.map((tab) => {
          const count = addresses.filter((a) => {
            const normalizedType = a.addrType?.toLowerCase();
            const tabName = tab.toLowerCase();
            return normalizedType === tabName || 
                   (tabName === 'warehouse' && normalizedType === 'shipping');
          }).length;
          const isActive = activeSubTab === tab;
          return (
            <button
              key={tab}
              onClick={() => setActiveSubTab(tab)}
              className="px-3 py-1.5 text-xs font-medium rounded-md cursor-pointer transition-colors border-none"
              style={{
                backgroundColor: isActive ? config.primaryColor + "10" : "transparent",
                color: isActive ? config.primaryColor : config.secondaryColor,
                outline: "none",
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "#F9FAFB";
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              {tab} ({count})
            </button>
          );
        })}
      </div>

      {/* Address cards */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center">
          <EnvironmentOutlined className="text-2xl mb-2" style={{ color: "#D1D5DB" }} />
          <p className="text-sm text-gray-400 m-0">No {activeSubTab.toLowerCase()} addresses on file.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((addr) => (
            <AddressCard key={addr.id} address={addr} config={config} />
          ))}
        </div>
      )}
    </div>
  );
}

function AddressCard({
  address: a,
  config,
}: {
  address: BusinessAccountAddress;
  config: typeof activeBrandConfig;
}) {
  // Since API doesn't have label, isDefault, contactPerson, phone, email
  // We'll create fallback values or show what's available
  const label = a.addrType || 'Address';
  const isDefault = false; // API doesn't provide this info
  
  return (
    <div
      className="rounded-lg p-5"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
            {label}
          </span>
          {isDefault && (
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded"
              style={{ backgroundColor: "transparent", color: "#16A34A", border: "1px solid #16A34A" }}
            >
              Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isDefault && (
            <button
              className="text-[11px] font-medium px-2 py-1 rounded cursor-pointer border-none bg-transparent transition-colors"
              style={{ color: config.secondaryColor }}
              onMouseEnter={(e) => { e.currentTarget.style.color = config.primaryColor; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = config.secondaryColor; }}
            >
              <CheckCircleOutlined className="mr-1 text-[10px]" />
              Set Default
            </button>
          )}
          <button
            className="text-[11px] font-medium px-2 py-1 rounded cursor-pointer border-none bg-transparent transition-colors"
            style={{ color: config.secondaryColor }}
            onMouseEnter={(e) => { e.currentTarget.style.color = config.primaryColor; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = config.secondaryColor; }}
          >
            <EditOutlined className="mr-1 text-[10px]" />
            Edit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
        <div>
          <p className="text-sm m-0" style={{ color: "#374151" }}>
            {a.addrLine1}
            {a.addrLine2 && <>, {a.addrLine2}</>}
            {a.addrLine3 && <>, {a.addrLine3}</>}
          </p>
          <p className="text-sm m-0" style={{ color: "#374151" }}>
            {a.city}, {a.state} {a.zipCode}
          </p>
          <p className="text-xs m-0 mt-0.5" style={{ color: config.secondaryColor }}>
            {a.country}
          </p>
        </div>
        <div className="space-y-1">
          <SmallField label="Contact" value="Not specified" />
          <SmallField label="Phone" value="Not specified" />
          <SmallField label="Email" value="Not specified" />
        </div>
      </div>
    </div>
  );
}

function SmallField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] font-medium uppercase tracking-wider min-w-[48px]" style={{ color: "#9CA3AF" }}>
        {label}
      </span>
      <span className="text-xs" style={{ color: "#374151" }}>{value}</span>
    </div>
  );
}
