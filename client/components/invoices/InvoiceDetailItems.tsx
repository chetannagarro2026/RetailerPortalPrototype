import { activeBrandConfig } from "../../config/brandConfig";
import type { InvoiceLineItem } from "../../data/invoices";

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

interface Props {
  items: InvoiceLineItem[];
}

export default function InvoiceDetailItems({ items }: Props) {
  const config = activeBrandConfig;
  const columns = "1.8fr 1fr 0.6fr 1fr 0.8fr 1fr";

  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const tax = items.reduce((s, i) => s + i.quantity * i.unitPrice * i.taxRate, 0);
  const total = subtotal + tax;

  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold m-0 mb-4" style={{ color: config.primaryColor }}>
        Invoice Items
      </h3>

      <div
        className="rounded-xl overflow-hidden"
        style={{ border: `1px solid ${config.borderColor}` }}
      >
        {/* Header */}
        <div
          className="grid gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider"
          style={{
            gridTemplateColumns: columns,
            backgroundColor: config.cardBg,
            color: config.secondaryColor,
            borderBottom: `1px solid ${config.borderColor}`,
          }}
        >
          <span>Product</span>
          <span>SKU</span>
          <span className="text-right">Qty</span>
          <span className="text-right">Unit Price</span>
          <span className="text-right">Tax</span>
          <span className="text-right">Subtotal</span>
        </div>

        {/* Rows */}
        {items.map((item, idx) => {
          const lineSubtotal = item.quantity * item.unitPrice;
          const lineTax = lineSubtotal * item.taxRate;
          return (
            <div
              key={item.id}
              className="grid gap-4 px-5 py-3 items-center"
              style={{
                gridTemplateColumns: columns,
                borderBottom: idx < items.length - 1 ? `1px solid ${config.borderColor}` : "none",
                backgroundColor: "#fff",
              }}
            >
              <span className="text-sm" style={{ color: config.primaryColor }}>
                {item.productName}
              </span>
              <span className="text-xs" style={{ color: config.secondaryColor }}>
                {item.sku}
              </span>
              <span className="text-sm text-right" style={{ color: config.primaryColor }}>
                {item.quantity}
              </span>
              <span className="text-sm text-right" style={{ color: config.primaryColor }}>
                {fmt(item.unitPrice)}
              </span>
              <span className="text-sm text-right" style={{ color: config.secondaryColor }}>
                {fmt(lineTax)}
              </span>
              <span className="text-sm font-medium text-right" style={{ color: config.primaryColor }}>
                {fmt(lineSubtotal + lineTax)}
              </span>
            </div>
          );
        })}
      </div>

      {/* Totals */}
      <div className="flex flex-col items-end mt-3 gap-1">
        <div className="flex items-center gap-6">
          <span className="text-xs" style={{ color: config.secondaryColor }}>Subtotal</span>
          <span className="text-sm font-medium w-28 text-right" style={{ color: config.primaryColor }}>{fmt(subtotal)}</span>
        </div>
        <div className="flex items-center gap-6">
          <span className="text-xs" style={{ color: config.secondaryColor }}>Tax</span>
          <span className="text-sm font-medium w-28 text-right" style={{ color: config.primaryColor }}>{fmt(tax)}</span>
        </div>
        <div className="flex items-center gap-6 mt-1 pt-2" style={{ borderTop: `1px solid ${config.borderColor}` }}>
          <span className="text-xs font-semibold" style={{ color: config.primaryColor }}>Total</span>
          <span className="text-sm font-bold w-28 text-right" style={{ color: config.primaryColor }}>{fmt(total)}</span>
        </div>
      </div>
    </div>
  );
}
