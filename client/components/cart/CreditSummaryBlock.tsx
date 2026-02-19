import { ExclamationCircleOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { useCreditState } from "../../hooks/useCreditState";

export default function CreditSummaryBlock() {
  const config = activeBrandConfig;
  const credit = useCreditState();

  const fmt = (val: number) =>
    "$" + Math.abs(val).toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <div
      className="rounded-xl p-5"
      style={{
        border: `1px solid ${credit.isExceeded ? "#FCA5A5" : config.borderColor}`,
        backgroundColor: credit.isExceeded ? "#FFF5F5" : "#fff",
      }}
    >
      <h3 className="text-sm font-semibold mb-4" style={{ color: config.primaryColor }}>
        Credit Summary
      </h3>

      <div className="space-y-2.5">
        <CreditRow label="Credit Limit" value={fmt(credit.creditLimit)} config={config} />
        <CreditRow label="Credit Used" value={fmt(credit.creditUsed)} config={config} />
        <div className="border-t" style={{ borderColor: config.borderColor }} />
        <CreditRow label="Credit Remaining" value={fmt(credit.creditRemaining)} config={config} bold />
        <CreditRow label="Cart Total" value={fmt(credit.cartTotal)} config={config} />
        <div className="border-t" style={{ borderColor: config.borderColor }} />
        <CreditRow
          label="Remaining After Order"
          value={`${credit.remainingAfterOrder < 0 ? "-" : ""}${fmt(credit.remainingAfterOrder)}`}
          config={config}
          bold
          negative={credit.isExceeded}
        />
      </div>

      {credit.isExceeded && (
        <div className="rounded-lg px-3.5 py-3 mt-4" style={{ backgroundColor: "#FEF2F2" }}>
          <div className="flex items-start gap-2">
            <ExclamationCircleOutlined className="text-xs mt-0.5 shrink-0" style={{ color: "#DC2626" }} />
            <p className="text-[11px] leading-relaxed" style={{ color: "#991B1B" }}>
              Your order exceeds available credit. Remove items to proceed.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

function CreditRow({
  label,
  value,
  config,
  bold,
  negative,
}: {
  label: string;
  value: string;
  config: typeof activeBrandConfig;
  bold?: boolean;
  negative?: boolean;
}) {
  return (
    <div className="flex justify-between items-center">
      <span className={`text-xs ${bold ? "font-medium" : ""}`} style={{ color: config.secondaryColor }}>
        {label}
      </span>
      <span
        className={`text-xs ${bold ? "font-semibold" : "font-medium"}`}
        style={{ color: negative ? "#DC2626" : config.primaryColor }}
      >
        {value}
      </span>
    </div>
  );
}
