import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { useBusinessProfile } from "../../context/BusinessProfileContext";

const statusStyles: Record<string, { bg: string; color: string }> = {
  ACTIVE: { bg: "#F0FDF4", color: "#16A34A" },
  Active: { bg: "#F0FDF4", color: "#16A34A" },
  EXPIRED: { bg: "#FEF2F2", color: "#DC2626" },
  Expired: { bg: "#FEF2F2", color: "#DC2626" },
  "Renewal Required": { bg: "#FFFBEB", color: "#D97706" },
  PENDING: { bg: "#FFFBEB", color: "#D97706" },
  Pending: { bg: "#FFFBEB", color: "#D97706" },
};

const typeStyles: Record<string, { bg: string; color: string }> = {
  TRADE: { bg: "#EFF6FF", color: "#2563EB" },
  Trade: { bg: "#EFF6FF", color: "#2563EB" },
  SLA: { bg: "#F5F3FF", color: "#7C3AED" },
  PRICING: { bg: "#FFF7ED", color: "#C2410C" },
  Pricing: { bg: "#FFF7ED", color: "#C2410C" },
  COMMERCIAL: { bg: "#F0F9FF", color: "#0EA5E9" },
  Commercial: { bg: "#F0F9FF", color: "#0EA5E9" },
};

export default function AgreementsTab() {
  const config = activeBrandConfig;
  const { businessAccount, loading } = useBusinessProfile();

  const fmtDate = (iso: string | null) => {
    if (!iso) return "Not specified";
    return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const isExpiringSoon = (iso: string | null) => {
    if (!iso) return false;
    const diff = new Date(iso).getTime() - Date.now();
    return diff > 0 && diff < 30 * 86400000;
  };

  if (loading) {
    return (
      <div style={{ width: "100%" }}>
        <div className="animate-pulse space-y-5">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="space-y-4">
            <div className="flex space-x-4 border-b pb-2">
              {Array.from({ length: 7 }).map((_, i) => (
                <div key={i} className="h-4 bg-gray-200 rounded flex-1"></div>
              ))}
            </div>
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="flex space-x-4 py-3">
                {Array.from({ length: 7 }).map((_, j) => (
                  <div key={j} className="h-4 bg-gray-200 rounded flex-1"></div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const contracts = businessAccount?.contracts || [];

  return (
    <div style={{ width: "100%" }}>
      <h3 className="text-base font-semibold m-0 mb-5" style={{ color: config.primaryColor }}>
        Contracts & Agreements
      </h3>

      {contracts.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-sm text-gray-400 m-0 mb-1">No contracts on file</p>
          <p className="text-xs text-gray-300 m-0">Contact your account manager to set up agreements.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr>
                <Th>Agreement</Th>
                <Th>Distributor / Brand</Th>
                <Th>Type</Th>
                <Th>Effective</Th>
                <Th>Expiry</Th>
                <Th>Status</Th>
                <Th>Currency</Th>
                <Th>Payment</Th>
                <Th align="right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => {
                const st = statusStyles[contract.status] || statusStyles.Active;
                const tp = typeStyles[contract.contractType] || typeStyles.Trade;
                const expiringSoon = isExpiringSoon(contract.expiryDate);
                const isExpiredOrRenewal = contract.status === "EXPIRED" || contract.status === "Expired" || expiringSoon;

                return (
                  <tr
                    key={contract.contractId}
                    style={{ borderTop: `1px solid ${config.borderColor}` }}
                  >
                    <td className="py-3 text-xs font-semibold" style={{ color: config.primaryColor }}>
                      {contract.contractTitle}
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#374151" }}>
                      {businessAccount?.brand || "Not specified"}
                    </td>
                    <td className="py-3">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded"
                        style={{ color: tp.color, backgroundColor: "transparent", border: `1px solid ${tp.color}` }}
                      >
                        {contract.contractType}
                      </span>
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#6B7280" }}>
                      {fmtDate(contract.effectiveDate)}
                    </td>
                    <td className="py-3 text-xs" style={{ color: expiringSoon ? "#D97706" : "#6B7280" }}>
                      {fmtDate(contract.expiryDate)}
                    </td>
                    <td className="py-3">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded"
                        style={{ color: st.color, backgroundColor: "transparent", border: `1px solid ${st.color}` }}
                      >
                        {contract.status}
                      </span>
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#6B7280" }}>
                      {contract.currency}
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#6B7280" }}>
                      {contract.pmtFreq}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {isExpiredOrRenewal && (
                          <button
                            className="text-[11px] font-medium px-1.5 py-0.5 rounded cursor-pointer border-none bg-transparent transition-colors"
                            style={{ color: config.secondaryColor }}
                            title="Request Renewal"
                            onMouseEnter={(e) => { e.currentTarget.style.color = config.primaryColor; }}
                            onMouseLeave={(e) => { e.currentTarget.style.color = config.secondaryColor; }}
                          >
                            <ReloadOutlined style={{ fontSize: 16 }} />
                          </button>
                        )}
                        <button
                          className="text-[11px] font-medium px-1.5 py-0.5 rounded cursor-pointer border-none bg-transparent transition-colors"
                          style={{ color: config.secondaryColor }}
                          title="Download Contract"
                          onMouseEnter={(e) => { e.currentTarget.style.color = config.primaryColor; }}
                          onMouseLeave={(e) => { e.currentTarget.style.color = config.secondaryColor; }}
                        >
                          <DownloadOutlined style={{ fontSize: 16 }} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Contract Details */}
      {contracts.length > 0 && (
        <div
          className="mt-6 pt-5"
          style={{ borderTop: `1px solid ${config.borderColor}` }}
        >
          <h4 className="text-sm font-semibold mb-4" style={{ color: config.primaryColor }}>
            Contract Details
          </h4>
          <div className="space-y-4">
            {contracts.map((contract) => (
              <div
                key={contract.contractId}
                className="rounded-lg p-4"
                style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#F8F9FB" }}
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label>Contract Number</Label>
                    <Value>{contract.contractNumber}</Value>
                  </div>
                  <div>
                    <Label>Customer Tier</Label>
                    <Value>{contract.customerTier}</Value>
                  </div>
                  <div>
                    <Label>Renewal Type</Label>
                    <Value>{contract.renewalType}</Value>
                  </div>
                  <div>
                    <Label>Payment Terms</Label>
                    <Value>{contract.pmtTerms}</Value>
                  </div>
                  <div>
                    <Label>Signed By</Label>
                    <Value>{contract.signedBy}</Value>
                  </div>
                  <div>
                    <Label>Renewal Period</Label>
                    <Value>{contract.renewalPeriod} year(s)</Value>
                  </div>
                </div>
                {contract.description && (
                  <div className="mt-3">
                    <Label>Description</Label>
                    <Value>{contract.description}</Value>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Note about limited document features */}
      {contracts.length > 0 && (
        <div
          className="mt-6 pt-5 text-xs text-gray-500 italic"
          style={{ borderTop: `1px solid ${config.borderColor}` }}
        >
          * Document download features are not available through the current API. Contract data is shown from the business account information.
        </div>
      )}
    </div>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[10px] font-medium uppercase tracking-wider" style={{ color: "#9CA3AF" }}>
      {children}
    </span>
  );
}

function Value({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-sm m-0 mt-0.5" style={{ color: "#374151" }}>
      {children}
    </p>
  );
}

function Th({ children, align = "left" }: { children: React.ReactNode; align?: string }) {
  return (
    <th
      className="text-[10px] font-semibold uppercase tracking-wider pb-2.5 text-left"
      style={{ color: "#9CA3AF", textAlign: align as any }}
    >
      {children}
    </th>
  );
}
