import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { InputNumber } from "antd";
import { CloseOutlined } from "@ant-design/icons";
import { App } from "antd";
import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogProduct, ProductVariant, VariantAttribute } from "../../data/catalogData";
import type { SkuFilters } from "./SkuFilterPanel";
import { useAuth } from "../../context/AuthContext";
import { useOrder } from "../../context/OrderContext";
import { resolveVariantPricing } from "../../utils/pricing";
import SkuTableGroup, { getColSpan } from "./SkuTableGroup";

interface SkuGroupedTablesProps {
  product: CatalogProduct;
  variants: ProductVariant[];
  variantAttributes: VariantAttribute[];
  activeFilters: SkuFilters;
  onRemoveFilter: (key: string, value: string) => void;
  onClearAll: () => void;
  expandedId: string | null;
  onToggleExpand: (id: string | null) => void;
}

interface VariantGroup {
  label: string;
  variants: ProductVariant[];
}

const AVAILABILITY_LABELS: Record<string, string> = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
  "pre-order": "Pre-Order",
};

export default function SkuGroupedTables({
  product,
  variants,
  variantAttributes,
  activeFilters,
  onRemoveFilter,
  onClearAll,
  expandedId,
  onToggleExpand,
}: SkuGroupedTablesProps) {
  const config = activeBrandConfig;
  const { isAuthenticated } = useAuth();
  const { addItems } = useOrder();
  const { message } = App.useApp();

  // ── Batch qty state ─────────────────────────────────────────────
  const [qtyMap, setQtyMap] = useState<Record<string, number>>({});
  const [headerQty, setHeaderQty] = useState<number | null>(null);

  // Reset qty map when variants change (e.g. filter change)
  useEffect(() => {
    setQtyMap({});
    setHeaderQty(null);
  }, [variants]);

  const handleQtyChange = useCallback((variantId: string, qty: number) => {
    setQtyMap((prev) => ({ ...prev, [variantId]: qty }));
  }, []);

  // "Set all to" — fills all rows across all groups
  const handleSetAllQty = useCallback(
    (val: number | null) => {
      const n = val ?? 0;
      setHeaderQty(val);
      setQtyMap((prev) => {
        const next = { ...prev };
        for (const v of variants) {
          const stock = v.stockQty ?? 0;
          if (stock === 0) {
            next[v.id] = 0;
          } else if (n > stock) {
            next[v.id] = stock;
          } else {
            next[v.id] = n;
          }
        }
        return next;
      });
    },
    [variants],
  );

  // ── Derived batch info ──────────────────────────────────────────
  const minQty = product.minOrderQty || 1;

  const stagedEntries = useMemo(() => {
    return Object.entries(qtyMap).filter(([, q]) => q > 0);
  }, [qtyMap]);

  const stagedCount = stagedEntries.length;
  const totalUnits = useMemo(() => stagedEntries.reduce((s, [, q]) => s + q, 0), [stagedEntries]);

  const totalPrice = useMemo(() => {
    let sum = 0;
    for (const [variantId, q] of stagedEntries) {
      const v = variants.find((vv) => vv.id === variantId);
      if (!v) continue;
      const pricing = resolveVariantPricing(v, product);
      const unitPrice = isAuthenticated ? pricing.finalPrice : pricing.listPrice;
      sum += unitPrice * q;
    }
    return sum;
  }, [stagedEntries, variants, product, isAuthenticated]);

  // Validation: find rows below minimum or above stock
  const belowMinRows = useMemo(() => {
    return stagedEntries.filter(([, q]) => q > 0 && q < minQty);
  }, [stagedEntries, minQty]);

  const aboveStockRows = useMemo(() => {
    return stagedEntries.filter(([variantId, q]) => {
      const v = variants.find((vv) => vv.id === variantId);
      const stock = v?.stockQty ?? 0;
      return q > 0 && stock > 0 && q > stock;
    });
  }, [stagedEntries, variants]);

  const hasInvalidRows = belowMinRows.length > 0 || aboveStockRows.length > 0;
  const showBar = stagedCount > 0;

  // ── Commit handler ─────────────────────────────────────────────
  const handleAddAll = useCallback(() => {
    if (hasInvalidRows) return;

    const itemsToAdd = stagedEntries
      .map(([variantId, q]) => {
        const v = variants.find((vv) => vv.id === variantId);
        if (!v) return null;
        const pricing = resolveVariantPricing(v, product);
        const unitPrice = isAuthenticated ? pricing.finalPrice : pricing.listPrice;
        return {
          id: v.id,
          productId: product.id,
          productName: product.name,
          sku: v.sku,
          variantAttributes: v.attributes,
          quantity: q,
          unitPrice,
          listPrice: pricing.listPrice,
          specialPrice: isAuthenticated ? pricing.specialPrice : undefined,
          promotionLabel: isAuthenticated ? pricing.promotionLabel : undefined,
          imageUrl: product.imageUrl,
        };
      })
      .filter(Boolean) as Parameters<typeof addItems>[0];

    if (itemsToAdd.length === 0) return;

    addItems(itemsToAdd);
    setQtyMap({});
    setHeaderQty(null);
  }, [hasInvalidRows, stagedEntries, variants, product, isAuthenticated, addItems]);

  const handleClearAllQty = useCallback(() => {
    setQtyMap({});
    setHeaderQty(null);
  }, []);

  // ── Grouping logic ─────────────────────────────────────────────
  const groupingAttr = variantAttributes.length >= 2 ? variantAttributes[0].name : null;

  const columns = useMemo(
    () => variantAttributes.filter((a) => a.name !== groupingAttr).map((a) => a.name),
    [variantAttributes, groupingAttr],
  );

  const totalColSpan = getColSpan(columns, isAuthenticated);

  const groups = useMemo<VariantGroup[]>(() => {
    if (!groupingAttr) {
      return [{ label: "", variants }];
    }
    const map = new Map<string, ProductVariant[]>();
    const attrDef = variantAttributes.find((a) => a.name === groupingAttr);
    if (attrDef) {
      for (const val of attrDef.values) map.set(val, []);
    }
    for (const v of variants) {
      const key = v.attributes[groupingAttr] || "Other";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(v);
    }
    return Array.from(map.entries())
      .filter(([, vs]) => vs.length > 0)
      .map(([label, vs]) => ({ label: `${groupingAttr}: ${label}`, variants: vs }));
  }, [variants, groupingAttr, variantAttributes]);

  // ── Filter chips ───────────────────────────────────────────────
  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; value: string; label: string }> = [];
    for (const [key, values] of Object.entries(activeFilters)) {
      for (const value of values) {
        const label =
          key === "_availability"
            ? `Availability: ${AVAILABILITY_LABELS[value] || value}`
            : `${key}: ${value}`;
        chips.push({ key, value, label });
      }
    }
    return chips;
  }, [activeFilters]);

  const fmt = (val: number) =>
    "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const thStyle = (align: string = "left") => ({
    color: config.secondaryColor,
    borderBottom: `2px solid ${config.borderColor}`,
    textAlign: align as any,
  });

  return (
    <div className="relative">
      {/* Filter Chips */}
      {activeChips.length > 0 && (
        <div className="flex flex-wrap items-center gap-2 mb-4">
          {activeChips.map((chip) => (
            <span
              key={`${chip.key}-${chip.value}`}
              className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full"
              style={{
                backgroundColor: config.cardBg,
                color: config.primaryColor,
                border: `1px solid ${config.borderColor}`,
              }}
            >
              {chip.label}
              <button
                onClick={() => onRemoveFilter(chip.key, chip.value)}
                className="ml-0.5 cursor-pointer bg-transparent border-none p-0 leading-none"
                style={{ color: config.secondaryColor }}
              >
                <CloseOutlined className="text-[8px]" />
              </button>
            </span>
          ))}
          <button
            onClick={onClearAll}
            className="text-[11px] font-medium cursor-pointer bg-transparent border-none"
            style={{ color: config.primaryColor }}
          >
            Clear All
          </button>
        </div>
      )}

      {/* SKU Count */}
      <p className="text-xs mb-4" style={{ color: config.secondaryColor }}>
        {variants.length} SKU{variants.length !== 1 ? "s" : ""}
        {activeChips.length > 0 && ` (filtered from ${product.variants?.length || 0})`}
      </p>

      {/* Empty State */}
      {variants.length === 0 ? (
        <div
          className="rounded-xl py-12 text-center"
          style={{ border: `1px solid ${config.borderColor}` }}
        >
          <p className="text-sm text-gray-400 mb-2">No SKUs match the selected filters.</p>
          <button
            onClick={onClearAll}
            className="text-xs font-medium cursor-pointer bg-transparent border-none"
            style={{ color: config.primaryColor }}
          >
            Clear all filters
          </button>
        </div>
      ) : (
        <>
          {/* ── Single Continuous Table ──────────────────────────── */}
          <div
            className="overflow-x-auto rounded-[10px]"
            style={{ border: `1px solid ${config.borderColor}` }}
          >
            <table className="w-full border-collapse text-xs">
              {/* Sticky Column Headers — appears once */}
              <thead>
                <tr style={{ backgroundColor: config.cardBg }}>
                  {/* Chevron */}
                  <th
                    className="w-8 px-2 py-2.5 text-[11px] font-semibold uppercase tracking-wider"
                    style={{ borderBottom: `2px solid ${config.borderColor}` }}
                  />

                  {/* Dynamic variant attribute columns */}
                  {columns.map((col) => (
                    <th
                      key={col}
                      className="text-left px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={thStyle("left")}
                    >
                      {col}
                    </th>
                  ))}

                  {/* SKU */}
                  <th
                    className="text-left px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={thStyle("left")}
                  >
                    SKU
                  </th>

                  {/* Stock */}
                  <th
                    className="text-center px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={thStyle("center")}
                  >
                    Stock
                  </th>

                  {/* List Price */}
                  <th
                    className="text-right px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                    style={thStyle("right")}
                  >
                    List Price
                  </th>

                  {/* Special Price — auth only */}
                  {isAuthenticated && (
                    <th
                      className="text-right px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={thStyle("right")}
                    >
                      Special Price
                    </th>
                  )}

                  {/* Promotions — auth only */}
                  {isAuthenticated && (
                    <th
                      className="text-center px-3 py-2.5 text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap"
                      style={thStyle("center")}
                    >
                      Promotions
                    </th>
                  )}

                  {/* Qty — single-line fused prefix input */}
                  <th className="px-2 py-2.5 text-center whitespace-nowrap" style={thStyle("center")}>
                    <div
                      className="inline-flex items-stretch overflow-hidden"
                      style={{
                        border: `1px solid ${config.borderColor}`,
                        borderRadius: 4,
                        backgroundColor: "#fff",
                      }}
                    >
                      <span
                        className="flex items-center text-[10px] font-semibold px-2 py-1"
                        style={{
                          color: config.secondaryColor,
                          backgroundColor: config.cardBg,
                          borderRight: `1px solid ${config.borderColor}`,
                        }}
                      >
                        QTY
                      </span>
                      <InputNumber
                        size="small"
                        min={0}
                        placeholder="All"
                        value={headerQty}
                        onChange={handleSetAllQty}
                        controls={false}
                        variant="borderless"
                        style={{ width: 40, fontSize: 11, textAlign: "center" }}
                      />
                    </div>
                  </th>
                </tr>
              </thead>

              {/* Table Body — groups interspersed with label rows */}
              <tbody>
                {groups.map((group) => (
                  <SkuTableGroup
                    key={group.label || "__ungrouped"}
                    groupLabel={group.label || null}
                    variants={group.variants}
                    columns={columns}
                    product={product}
                    expandedId={expandedId}
                    onToggleExpand={onToggleExpand}
                    qtyMap={qtyMap}
                    onQtyChange={handleQtyChange}
                    totalColSpan={totalColSpan}
                  />
                ))}
              </tbody>
            </table>
          </div>

          {/* Spacer so content isn't hidden behind sticky bar */}
          {showBar && <div style={{ height: 64 }} />}
        </>
      )}

      {/* ── Sticky Bottom Bar ──────────────────────────────────── */}
      <StickyBatchBar
        visible={showBar}
        stagedCount={stagedCount}
        totalUnits={totalUnits}
        totalPrice={totalPrice}
        belowMinCount={belowMinRows.length}
        aboveStockCount={aboveStockRows.length}
        onClear={handleClearAllQty}
        onAddAll={handleAddAll}
        disabled={hasInvalidRows}
        fmt={fmt}
      />
    </div>
  );
}

// ── Sticky Batch Bar ────────────────────────────────────────────────

function StickyBatchBar({
  visible,
  stagedCount,
  totalUnits,
  totalPrice,
  belowMinCount,
  aboveStockCount,
  onClear,
  onAddAll,
  disabled,
  fmt,
}: {
  visible: boolean;
  stagedCount: number;
  totalUnits: number;
  totalPrice: number;
  belowMinCount: number;
  aboveStockCount: number;
  onClear: () => void;
  onAddAll: () => void;
  disabled: boolean;
  fmt: (val: number) => string;
}) {
  const config = activeBrandConfig;
  const barRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (visible) {
      setMounted(true);
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true));
      });
    } else {
      setAnimateIn(false);
      const timer = setTimeout(() => setMounted(false), 150);
      return () => clearTimeout(timer);
    }
  }, [visible]);

  if (!mounted) return null;

  return (
    <div
      ref={barRef}
      className="fixed bottom-0 left-0 right-0 z-50 rounded-t-xl"
      style={{
        backgroundColor: config.primaryColor,
        transform: animateIn ? "translateY(0)" : "translateY(100%)",
        transition: animateIn
          ? "transform 200ms ease-out"
          : "transform 150ms ease-in",
      }}
    >
      <div className="max-w-content mx-auto px-6 py-3.5 flex items-center justify-between">
        {/* Left */}
        <div>
          <span className="text-sm font-semibold text-white">
            {stagedCount} SKU{stagedCount !== 1 ? "s" : ""} selected
          </span>
          <span className="text-xs ml-3" style={{ color: "#8b9cc0" }}>
            {totalUnits} units · {fmt(totalPrice)}
          </span>
          {belowMinCount > 0 && (
            <span className="text-xs ml-3" style={{ color: "#FCA5A5" }}>
              {belowMinCount} SKU{belowMinCount !== 1 ? "s" : ""} below minimum order
            </span>
          )}
          {aboveStockCount > 0 && (
            <span className="text-xs ml-3" style={{ color: "#FCA5A5" }}>
              {aboveStockCount} SKU{aboveStockCount !== 1 ? "s" : ""} exceeds available stock
            </span>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-4">
          <button
            onClick={onClear}
            className="text-xs bg-transparent border-none cursor-pointer"
            style={{ color: "#8b9cc0" }}
          >
            Clear all
          </button>
          <button
            onClick={onAddAll}
            disabled={disabled}
            className="text-sm font-semibold rounded-lg px-5 py-2 border-none cursor-pointer transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor: "#fff",
              color: config.primaryColor,
            }}
          >
            Add All to Cart
          </button>
        </div>
      </div>
    </div>
  );
}
