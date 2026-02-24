import { InfoCircleOutlined, InboxOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { distributors } from "../../data/businessProfileData";

const statusStyles: Record<string, { bg: string; color: string }> = {
  Active: { bg: "#F0FDF4", color: "#16A34A" },
  Inactive: { bg: "#F9FAFB", color: "#6B7280" },
  Pending: { bg: "#FFFBEB", color: "#D97706" },
};

export default function DistributorsTab() {
  const config = activeBrandConfig;

  return (
    <div>
      <h3 className="text-base font-semibold m-0 mb-2" style={{ color: config.primaryColor }}>
        Assigned Distributors
      </h3>

      <div className="flex items-center gap-1.5 mb-5">
        <InfoCircleOutlined className="text-[11px]" style={{ color: config.secondaryColor }} />
        <span className="text-[11px]" style={{ color: config.secondaryColor }}>
          You can place orders only to assigned distributors.
        </span>
      </div>

      {distributors.length === 0 ? (
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
                <Th>Distributor Name</Th>
                <Th>Territory</Th>
                <Th>Assigned Brands</Th>
                <Th>Credit Terms</Th>
                <Th>Account Manager</Th>
                <Th>Contact</Th>
                <Th align="right">Status</Th>
              </tr>
            </thead>
            <tbody>
              {distributors.map((d) => {
                const st = statusStyles[d.status] || statusStyles.Pending;
                return (
                  <tr
                    key={d.id}
                    style={{ borderTop: `1px solid ${config.borderColor}` }}
                  >
                    <td className="py-3 text-xs font-semibold" style={{ color: config.primaryColor }}>
                      {d.name}
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#374151" }}>
                      {d.territory}
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#374151", maxWidth: 180 }}>
                      {d.assignedBrands}
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#374151" }}>
                      {d.creditTerms}
                    </td>
                    <td className="py-3 text-xs" style={{ color: "#374151" }}>
                      {d.accountManager}
                    </td>
                    <td className="py-3 text-xs" style={{ color: config.secondaryColor }}>
                      {d.contactEmail}
                    </td>
                    <td className="py-3 text-right">
                      <span
                        className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                        style={{ color: st.color, backgroundColor: st.bg }}
                      >
                        {d.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
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
