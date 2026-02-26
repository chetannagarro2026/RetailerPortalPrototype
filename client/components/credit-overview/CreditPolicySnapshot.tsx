import { activeBrandConfig } from "../../config/brandConfig";

const policyData = [
  { label: "Payment Terms", value: "Net 30" },
  { label: "Grace Period", value: "7 days" },
  { label: "Interest on Overdue", value: "1.5% per month" },
  { label: "Credit Managed By", value: "Centric Brands Distribution" },
  { label: "Last Credit Review Date", value: "Nov 20, 2025" },
];

export default function CreditPolicySnapshot() {
  const config = activeBrandConfig;

  return (
    <div>
      <h3 className="text-base font-semibold m-0 mb-4" style={{ color: config.primaryColor }}>
        Credit Terms &amp; Policy
      </h3>
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
      >
        {policyData.map((row, idx) => (
          <div
            key={row.label}
            className="flex items-center justify-between px-5 py-3"
            style={{
              borderBottom: idx < policyData.length - 1 ? `1px solid ${config.borderColor}` : "none",
            }}
          >
            <span className="text-sm" style={{ color: config.secondaryColor }}>{row.label}</span>
            <span className="text-sm font-medium" style={{ color: config.primaryColor }}>{row.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
