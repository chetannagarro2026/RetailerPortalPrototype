import { activeBrandConfig } from "../../config/brandConfig";
import type { InvoiceLineItem, OrderDiscount } from "../../data/invoices";
import {
  lineBaseTotal,
  lineDiscountAmount,
  discountedLineTotal,
  computeSubtotalBeforeDiscount,
  computeTotalLineDiscounts,
  computeOrderDiscountAmount,
  computeNetSubtotal,
  computeTotalDiscount,
  computeTax,
  computeGrandTotal,
} from "../../data/invoices";

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function formatDiscountLabel(item: InvoiceLineItem): string {
  if (!item.discount) return "";
  if (item.discount.type === "percentage") return `${item.discount.value}%`;
  if (item.discount.type === "volume") return item.discount.label || "Volume Promotion";
  return `–${fmt(item.discount.value)}`;
}

interface Props {
  items: InvoiceLineItem[];
  orderDiscount?: OrderDiscount;
}

export default function InvoiceDetailItems({ items, orderDiscount }: Props) {
  const config = activeBrandConfig;
  const hasLineDiscounts = items.some((i) => i.discount);
  const hasOrderDiscount = !!orderDiscount;

  const columns = hasLineDiscounts
    ? "1.8fr 0.9fr 0.5fr 0.9fr 0.9fr 1fr"
    : "2fr 1fr 0.6fr 1fr 1fr";

  const subtotalBefore = computeSubtotalBeforeDiscount(items);
  const totalLineDisc = computeTotalLineDiscounts(items);
  const orderDiscAmt = computeOrderDiscountAmount(items, orderDiscount);
  const netSubtotal = computeNetSubtotal(items, orderDiscount);
  const totalDiscount = computeTotalDiscount(items, orderDiscount);
  const hasAnyDiscount = totalDiscount > 0;
  const tax = computeTax(items, orderDiscount);
  const grandTotal = computeGrandTotal(items, orderDiscount);

  return (
    <div className="mb-6">
      <h3 className="text-base font-semibold m-0 mb-2" style={{ color: config.primaryColor }}>
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
          {hasLineDiscounts && <span className="text-right">Discount</span>}
          <span className="text-right">Line Total</span>
        </div>

        {/* Rows */}
        {items.map((item, idx) => {
          const base = lineBaseTotal(item);
          const disc = lineDiscountAmount(item);
          const total = discountedLineTotal(item);
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
              <a
                href={`/product/${item.sku}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium no-underline hover:underline"
                style={{ color: config.primaryColor }}
              >
                {item.productName}
              </a>
              <span className="text-xs" style={{ color: config.secondaryColor }}>
                {item.sku}
              </span>
              <span className="text-sm text-right" style={{ color: config.primaryColor }}>
                {item.quantity}
              </span>
              <span className="text-sm text-right" style={{ color: config.primaryColor }}>
                {fmt(item.unitPrice)}
              </span>
              {hasLineDiscounts && (
                <span className="text-sm text-right" style={{ color: disc > 0 ? "#DC2626" : config.secondaryColor }}>
                  {disc > 0 ? (
                    <span title={`–${fmt(disc)}`}>
                      {formatDiscountLabel(item)}
                    </span>
                  ) : (
                    "—"
                  )}
                </span>
              )}
              <span className="text-sm font-medium text-right" style={{ color: config.primaryColor }}>
                {fmt(total)}
              </span>
            </div>
          );
        })}

        {/* Footer Summary — inside card, not as table rows */}
        <div
          className="px-5 py-4"
          style={{ borderTop: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
        >
          <div className="flex flex-col items-end gap-1">
            <SummaryRow label="Subtotal" value={fmt(subtotalBefore)} config={config} />

            {hasAnyDiscount && (
              <>
                {totalLineDisc > 0 && (
                  <SummaryRow label="Line Discounts" value={`–${fmt(totalLineDisc)}`} config={config} valueColor="#DC2626" />
                )}
                {hasOrderDiscount && (
                  <SummaryRow label={orderDiscount!.label} value={`–${fmt(orderDiscAmt)}`} config={config} valueColor="#DC2626" />
                )}
                <SummaryRow label="Net Subtotal" value={fmt(netSubtotal)} config={config} />
              </>
            )}

            <SummaryRow label="Tax" value={fmt(tax)} config={config} />
            <div
              className="flex items-center gap-6 mt-1 pt-2"
              style={{ borderTop: `1px solid ${config.borderColor}` }}
            >
              <span className="text-xs font-semibold" style={{ color: config.primaryColor }}>
                Grand Total
              </span>
              <span className="text-sm font-bold w-28 text-right" style={{ color: config.primaryColor }}>
                {fmt(grandTotal)}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  config,
  valueColor,
}: {
  label: string;
  value: string;
  config: typeof activeBrandConfig;
  valueColor?: string;
}) {
  return (
    <div className="flex items-center gap-6">
      <span className="text-xs" style={{ color: config.secondaryColor }}>{label}</span>
      <span className="text-sm font-medium w-28 text-right" style={{ color: valueColor || config.primaryColor }}>
        {value}
      </span>
    </div>
  );
}
