import { useState } from "react";
import {
  EnvironmentOutlined,
  PlusOutlined,
  EditOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { addresses, type Address } from "../../data/businessProfileData";

const subTabs = ["Billing", "Shipping", "Warehouse"] as const;
type SubTab = (typeof subTabs)[number];

export default function AddressesTab() {
  const config = activeBrandConfig;
  const [activeSubTab, setActiveSubTab] = useState<SubTab>("Billing");

  const filtered = addresses.filter((a) => a.type === activeSubTab);

  return (
    <div>
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
          const count = addresses.filter((a) => a.type === tab).length;
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
  address: Address;
  config: typeof activeBrandConfig;
}) {
  return (
    <div
      className="rounded-lg p-5"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
            {a.label}
          </span>
          {a.isDefault && (
            <span
              className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
              style={{ backgroundColor: "#F0FDF4", color: "#16A34A" }}
            >
              Default
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!a.isDefault && (
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
            {a.line1}
            {a.line2 && <>, {a.line2}</>}
          </p>
          <p className="text-sm m-0" style={{ color: "#374151" }}>
            {a.city}, {a.state} {a.zip}
          </p>
          <p className="text-xs m-0 mt-0.5" style={{ color: config.secondaryColor }}>
            {a.country}
          </p>
        </div>
        <div className="space-y-1">
          <SmallField label="Contact" value={a.contactPerson} />
          <SmallField label="Phone" value={a.phone} />
          <SmallField label="Email" value={a.email} />
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
