import { InfoCircleOutlined, InboxOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { useBusinessProfile } from "../../context/BusinessProfileContext";

const statusStyles: Record<string, { bg: string; color: string }> = {
  Active: { bg: "#F0FDF4", color: "#16A34A" },
  Inactive: { bg: "#F9FAFB", color: "#6B7280" },
  Pending: { bg: "#FFFBEB", color: "#D97706" },
};

export default function DistributorsTab() {
  const config = activeBrandConfig;
  const { businessAccount, loading } = useBusinessProfile();

  if (loading) {
    return (
      <div style={{ width: "100%" }}>
        <div className="animate-pulse space-y-5">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
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

  const linkedAccounts = businessAccount?.linkedAccounts || [];
  const distributorAccounts = linkedAccounts.filter(
    account => account.parentAccountType === 'DISTRIBUTOR'
  );

  return (
    <div style={{ width: "100%" }}>
      <h3 className="text-base font-semibold m-0 mb-2" style={{ color: config.primaryColor }}>
        Assigned Distributors
      </h3>

      <div className="flex items-center gap-1.5 mb-5">
        <InfoCircleOutlined className="text-[11px]" style={{ color: config.secondaryColor }} />
        <span className="text-[11px]" style={{ color: config.secondaryColor }}>
          You can place orders only to assigned distributors.
        </span>
      </div>

      {distributorAccounts.length === 0 ? (
        <div className="py-16 text-center">
          <InboxOutlined className="text-3xl mb-3" style={{ color: "#D1D5DB" }} />
          <p className="text-sm text-gray-400 m-0 mb-1">No distributors assigned</p>
          <p className="text-xs text-gray-300 m-0">Contact your account manager to get started.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm" style={{ borderCollapse: "collapse", tableLayout: "fixed" }}>
            <thead>
              <tr>
                <Th>Distributor ID</Th>
                <Th>Mapping ID</Th>
                <Th>Territory</Th>
                <Th>Assigned Brands</Th>
                <Th>Credit Terms</Th>
                <Th>Account Manager</Th>
                <Th>Contact</Th>
                <Th align="right">Status</Th>
              </tr>
            </thead>
            <tbody>
              {distributorAccounts.map((distributor) => {
                const status = distributor.active ? "Active" : "Inactive";
                const st = statusStyles[status] || statusStyles.Pending;
                return (
                  <tr
                    key={distributor.mappingId}
                    style={{ borderTop: `1px solid ${config.borderColor}` }}
                  >
                    <td className="py-3 text-xs font-semibold" style={{ color: config.primaryColor }}>
                      {distributor.parentAccountId}
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#374151" }}>
                      {distributor.mappingId}
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#374151" }}>
                      Not specified
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#374151", maxWidth: 180 }}>
                      {businessAccount?.brand || "Not specified"}
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#374151" }}>
                      {businessAccount?.contracts?.[0]?.pmtTerms || "Not specified"}
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#374151" }}>
                      Not specified
                    </td>
                    <td className="py-3 text-xs" style={{ color: config.secondaryColor }}>
                      Not specified
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className="text-[11px] font-medium px-2 py-0.5 rounded"
                        style={{ color: st.color, backgroundColor: "transparent", border: `1px solid ${st.color}` }}
                      >
                        {status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Additional Information */}
      {distributorAccounts.length > 0 && (
        <div
          className="mt-6 pt-5 text-xs text-gray-500 italic"
          style={{ borderTop: `1px solid ${config.borderColor}` }}
        >
          * Detailed distributor information (name, territory, contact details) is not available through the current API. Only account linkage information is shown. Use the distributor ID to contact your account manager for more details.
        </div>
      )}
    </div>
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
