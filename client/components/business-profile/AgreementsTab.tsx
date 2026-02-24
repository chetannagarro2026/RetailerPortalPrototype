import { DownloadOutlined, ReloadOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { agreements } from "../../data/businessProfileData";

const statusStyles: Record<string, { bg: string; color: string }> = {
  Active: { bg: "#F0FDF4", color: "#16A34A" },
  Expired: { bg: "#FEF2F2", color: "#DC2626" },
  "Renewal Required": { bg: "#FFFBEB", color: "#D97706" },
};

const typeStyles: Record<string, { bg: string; color: string }> = {
  Trade: { bg: "#EFF6FF", color: "#2563EB" },
  SLA: { bg: "#F5F3FF", color: "#7C3AED" },
  Pricing: { bg: "#FFF7ED", color: "#C2410C" },
};

export default function AgreementsTab() {
  const config = activeBrandConfig;

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });

  const isExpiringSoon = (iso: string) => {
    const diff = new Date(iso).getTime() - Date.now();
    return diff > 0 && diff < 30 * 86400000;
  };

  return (
    <div>
      <h3 className="text-base font-semibold m-0 mb-5" style={{ color: config.primaryColor }}>
        Contracts & Agreements
      </h3>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <Th>Agreement</Th>
              <Th>Distributor / Brand</Th>
              <Th>Type</Th>
              <Th>Effective</Th>
              <Th>Expiry</Th>
              <Th>Status</Th>
              <Th align="right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {agreements.map((a) => {
              const st = statusStyles[a.status] || statusStyles.Active;
              const tp = typeStyles[a.type] || typeStyles.Trade;
              const expiringSoon = isExpiringSoon(a.expiryDate);

              return (
                <tr
                  key={a.id}
                  style={{ borderTop: `1px solid ${config.borderColor}` }}
                >
                  <td className="py-3 text-xs font-semibold" style={{ color: config.primaryColor }}>
                    {a.name}
                  </td>
                  <td className="py-3 text-xs" style={{ color: "#374151" }}>
                    {a.distributorBrand}
                  </td>
                  <td className="py-3">
                    <span
                      className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: tp.color, backgroundColor: tp.bg }}
                    >
                      {a.type}
                    </span>
                  </td>
                  <td className="py-3 text-xs" style={{ color: "#6B7280" }}>
                    {fmtDate(a.effectiveDate)}
                  </td>
                  <td className="py-3 text-xs" style={{ color: expiringSoon ? "#D97706" : "#6B7280" }}>
                    {fmtDate(a.expiryDate)}
                    {expiringSoon && (
                      <span
                        className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: "#FFFBEB", color: "#D97706" }}
                      >
                        Renewal Required
                      </span>
                    )}
                  </td>
                  <td className="py-3">
                    <span
                      className="text-[11px] font-semibold px-2 py-0.5 rounded-full"
                      style={{ color: st.color, backgroundColor: st.bg }}
                    >
                      {a.status}
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        className="text-[11px] font-medium px-1.5 py-0.5 rounded cursor-pointer border-none bg-transparent transition-colors"
                        style={{ color: config.secondaryColor }}
                        onMouseEnter={(e) => { e.currentTarget.style.color = config.primaryColor; }}
                        onMouseLeave={(e) => { e.currentTarget.style.color = config.secondaryColor; }}
                      >
                        <DownloadOutlined className="text-[10px]" />
                      </button>
                      {(a.status === "Expired" || a.status === "Renewal Required") && (
                        <button
                          className="text-[10px] font-medium px-2 py-1 rounded cursor-pointer border-none transition-colors"
                          style={{ backgroundColor: "#FFFBEB", color: "#D97706" }}
                          onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#FEF3C7"; }}
                          onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#FFFBEB"; }}
                        >
                          <ReloadOutlined className="text-[9px] mr-1" />
                          Request Renewal
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
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
