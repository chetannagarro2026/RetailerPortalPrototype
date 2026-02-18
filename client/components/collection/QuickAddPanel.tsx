import { useState, useMemo, useCallback } from "react";
import { Link } from "react-router-dom";
import { InputNumber, Pagination } from "antd";
import { CloseOutlined, WarningOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { useOrder } from "../../context/OrderContext";
import { useCreditState } from "../../hooks/useCreditState";
import type { CatalogProduct, ProductVariant } from "../../data/catalogData";

const PAGE_SIZE = 20;

interface QuickAddPanelProps {
  product: CatalogProduct;
  familyLink: string;
  onClose: () => void;
}

export default function QuickAddPanel({
  product,
  familyLink,
  onClose,
}: QuickAddPanelProps) {
  const config = activeBrandConfig;
  const { addItems } = useOrder();
  const credit = useCreditState();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [page, setPage] = useState(1);

  const variants = product.variants || [];

  // Paginate variants
  const paginatedVariants = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return variants.slice(start, start + PAGE_SIZE);
  }, [variants, page]);

  // Collect dynamic attribute column names
  const attrColumns = useMemo(() => {
    const cols = new Set<string>();
    for (const v of variants) {
      for (const key of Object.keys(v.attributes)) {
        cols.add(key);
      }
    }
    return Array.from(cols);
  }, [variants]);

  // Selection summary
  const selectedEntries = useMemo(
    () => Object.entries(quantities).filter(([, q]) => q > 0),
    [quantities],
  );
  const selectedSkuCount = selectedEntries.length;
  const totalUnits = selectedEntries.reduce((s, [, q]) => s + q, 0);
  const subtotal = useMemo(() => {
    return selectedEntries.reduce((sum, [vid, qty]) => {
      const v = variants.find((vr) => vr.id === vid);
      return sum + (v ? v.price * qty : 0);
    }, 0);
  }, [selectedEntries, variants]);

  const wouldExceedCredit = credit.remainingAfterOrder - subtotal < 0 && subtotal > 0;

  const handleQtyChange = useCallback(
    (variantId: string, val: number | null, minQty: number, step: number) => {
      setQuantities((prev) => {
        const next = { ...prev };
        if (!val || val <= 0) {
          delete next[variantId];
        } else {
          const snapped = Math.max(minQty, Math.round(val / step) * step || step);
          next[variantId] = snapped;
        }
        return next;
      });
    },
    [],
  );

  const handleAddSelected = () => {
    if (selectedEntries.length === 0 || wouldExceedCredit) return;
    const items = selectedEntries
      .map(([vid, qty]) => {
        const v = variants.find((vr) => vr.id === vid);
        if (!v) return null;
        return {
          id: v.id,
          productId: product.id,
          productName: product.name,
          sku: v.sku,
          variantAttributes: v.attributes,
          quantity: qty,
          unitPrice: v.price,
          imageUrl: product.imageUrl,
        };
      })
      .filter(Boolean) as Parameters<typeof addItems>[0];

    addItems(items);
    setQuantities({});
  };

  const minQty = product.minOrderQty || 1;
  const step = product.casePackQty || 1;

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "#fff" }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between px-5 py-4 shrink-0"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        <div className="min-w-0">
          <h3
            className="text-sm font-semibold mb-0.5 truncate"
            style={{ color: config.primaryColor }}
          >
            {product.name}
          </h3>
          <div className="flex items-center gap-2 text-[11px]" style={{ color: config.secondaryColor }}>
            {product.brand && <span>{product.brand}</span>}
            <span>·</span>
            <span>{variants.length} SKUs</span>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md cursor-pointer transition-colors"
          style={{ border: "none", background: "transparent", color: config.secondaryColor }}
          aria-label="Close panel"
        >
          <CloseOutlined className="text-sm" />
        </button>
      </div>

      {/* SKU Table */}
      <div className="flex-1 overflow-auto">
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: config.cardBg }}>
              <th
                className="text-left px-3 py-2.5 font-semibold whitespace-nowrap sticky top-0"
                style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}`, backgroundColor: config.cardBg, zIndex: 1 }}
              >
                SKU
              </th>
              {attrColumns.map((col) => (
                <th
                  key={col}
                  className="text-left px-3 py-2.5 font-semibold whitespace-nowrap sticky top-0"
                  style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}`, backgroundColor: config.cardBg, zIndex: 1 }}
                >
                  {col}
                </th>
              ))}
              <th
                className="text-center px-3 py-2.5 font-semibold whitespace-nowrap sticky top-0"
                style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}`, backgroundColor: config.cardBg, zIndex: 1 }}
              >
                Stock
              </th>
              <th
                className="text-right px-3 py-2.5 font-semibold whitespace-nowrap sticky top-0"
                style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}`, backgroundColor: config.cardBg, zIndex: 1 }}
              >
                Price
              </th>
              <th
                className="text-center px-3 py-2.5 font-semibold whitespace-nowrap sticky top-0"
                style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}`, backgroundColor: config.cardBg, zIndex: 1 }}
              >
                Qty
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedVariants.map((v) => (
              <SkuRow
                key={v.id}
                variant={v}
                attrColumns={attrColumns}
                qty={quantities[v.id] || 0}
                minQty={minQty}
                step={step}
                onQtyChange={handleQtyChange}
              />
            ))}
          </tbody>
        </table>

        {variants.length > PAGE_SIZE && (
          <div className="flex justify-center py-3">
            <Pagination
              current={page}
              total={variants.length}
              pageSize={PAGE_SIZE}
              onChange={setPage}
              showSizeChanger={false}
              size="small"
            />
          </div>
        )}
      </div>

      {/* Credit warning */}
      {wouldExceedCredit && (
        <div
          className="flex items-center gap-2 px-5 py-2.5 text-[11px] font-medium shrink-0"
          style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
        >
          <WarningOutlined />
          Adding these items would exceed your available credit.
        </div>
      )}

      {/* Sticky footer */}
      <div
        className="px-5 py-4 shrink-0"
        style={{ borderTop: `1px solid ${config.borderColor}`, backgroundColor: config.cardBg }}
      >
        <div className="flex items-center justify-between text-[11px] mb-3" style={{ color: config.secondaryColor }}>
          <span><span className="font-semibold" style={{ color: config.primaryColor }}>{selectedSkuCount}</span> SKUs selected</span>
          <span><span className="font-semibold" style={{ color: config.primaryColor }}>{totalUnits}</span> units</span>
          <span className="font-semibold" style={{ color: config.primaryColor }}>${subtotal.toFixed(2)}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleAddSelected}
            disabled={selectedEntries.length === 0 || wouldExceedCredit}
            className="flex-1 text-[11px] font-semibold py-2 rounded-lg cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: config.primaryColor,
              color: "#fff",
              border: "none",
            }}
          >
            Add Selected to Cart
          </button>
          <Link
            to={familyLink}
            className="text-[11px] font-medium px-3 py-2 rounded-lg no-underline transition-colors"
            style={{
              border: `1px solid ${config.borderColor}`,
              color: config.primaryColor,
              backgroundColor: "#fff",
            }}
          >
            View Complete Detail
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── SKU Row ─────────────────────────────────────────────────────────

function SkuRow({
  variant,
  attrColumns,
  qty,
  minQty,
  step,
  onQtyChange,
}: {
  variant: ProductVariant;
  attrColumns: string[];
  qty: number;
  minQty: number;
  step: number;
  onQtyChange: (id: string, val: number | null, minQty: number, step: number) => void;
}) {
  const config = activeBrandConfig;
  const disabled = variant.availabilityStatus === "out-of-stock";

  return (
    <tr
      className="transition-colors"
      style={{ opacity: disabled ? 0.5 : 1 }}
      onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = config.cardBg; }}
      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
    >
      <td
        className="px-3 py-2 font-mono text-[10px] whitespace-nowrap"
        style={{ color: config.secondaryColor, borderBottom: `1px solid ${config.borderColor}` }}
      >
        {variant.sku}
      </td>
      {attrColumns.map((col) => (
        <td
          key={col}
          className="px-3 py-2 text-[11px] whitespace-nowrap"
          style={{ color: config.primaryColor, borderBottom: `1px solid ${config.borderColor}` }}
        >
          {variant.attributes[col] || "—"}
        </td>
      ))}
      <td
        className="px-3 py-2 text-center"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        <StockBadge status={variant.availabilityStatus} qty={variant.stockQty} />
      </td>
      <td
        className="px-3 py-2 text-right text-[11px] font-medium whitespace-nowrap"
        style={{ color: config.primaryColor, borderBottom: `1px solid ${config.borderColor}` }}
      >
        ${variant.price.toFixed(2)}
      </td>
      <td
        className="px-3 py-2 text-center"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        <InputNumber
          size="small"
          min={0}
          step={step}
          value={qty || undefined}
          placeholder="0"
          onChange={(v) => onQtyChange(variant.id, v, minQty, step)}
          disabled={disabled}
          className="w-[60px]"
          controls={false}
        />
      </td>
    </tr>
  );
}

function StockBadge({ status, qty }: { status: string; qty: number }) {
  if (status === "out-of-stock") {
    return (
      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>
        OOS
      </span>
    );
  }
  if (status === "low-stock") {
    return (
      <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#FFF7ED", color: "#9A3412" }}>
        {qty}
      </span>
    );
  }
  return <span className="text-[10px]" style={{ color: "#16A34A" }}>{qty}</span>;
}
