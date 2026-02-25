import { activeBrandConfig } from "../../config/brandConfig";
import type { PurchaseOrder } from "../../context/OrderHistoryContext";

interface Props {
  shipping: PurchaseOrder["shipping"];
}

export default function OrderDetailShipping({ shipping }: Props) {
  const config = activeBrandConfig;

  return (
    <div
      className="rounded-xl p-5 mb-6"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-2" style={{ color: config.secondaryColor }}>
        Ship To
      </p>
      <p className="text-sm font-medium" style={{ color: config.primaryColor }}>
        {shipping.contactName}
        {shipping.companyName && ` — ${shipping.companyName}`}
      </p>
      <p className="text-xs mt-1" style={{ color: config.secondaryColor }}>
        {shipping.address}, {shipping.city}, {shipping.state} {shipping.zip}
      </p>
      {shipping.phone && (
        <p className="text-xs mt-0.5" style={{ color: config.secondaryColor }}>
          {shipping.phone}
        </p>
      )}
    </div>
  );
}
