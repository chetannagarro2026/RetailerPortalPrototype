import { useMemo, useState, useCallback, useEffect, useRef } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { App } from "antd";
import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogProduct, ProductVariant, VariantAttribute } from "../../data/catalogData";
import type { SkuFilters } from "./SkuFilterPanel";
import { useAuth } from "../../context/AuthContext";
import { useOrder } from "../../context/OrderContext";
import { resolveVariantPricing } from "../../utils/pricing";
import SkuTableGroup from "./SkuTableGroup";

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

  // Reset qty map when variants change (e.g. filter change)
  useEffect(() => {
    setQtyMap({});
  }, [variants]);

  const handleQtyChange = useCallback((variantId: string, qty: number) => {
    setQtyMap((prev) => ({ ...prev, [variantId]: qty }));
  }, []);

  const handleSetAllQty = useCallback(
    (variantIds: string[], qty: number, stockMap: Record<string, number>) => {
      setQtyMap((prev) => {
        const next = { ...prev };
        for (const id of variantIds) {
          const stock = stockMap[id] ?? 0;
          if (stock === 0) {
            next[id] = 0; // skip OOS
          } else if (qty > stock) {
            next[id] = stock; // cap at available stock
          } else {
            next[id] = qty;
          }
        }
        return next;
      });
    },
    [],
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
  }, [hasInvalidRows, stagedEntries, variants, product, isAuthenticated, addItems]);

  const handleClearAll = useCallback(() => {
    setQtyMap({});
  }, []);

  // ── Grouping logic ─────────────────────────────────────────────
  const groupingAttr = variantAttributes.length >= 2 ? variantAttributes[0].name : null;

  const columns = useMemo(
    () => variantAttributes.filter((a) => a.name !== groupingAttr).map((a) => a.name),
    [variantAttributes, groupingAttr],
  );

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
          {/* Grouped Tables */}
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
              onSetAllQty={handleSetAllQty}
            />
          ))}

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
        onClear={handleClearAll}
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
      // Trigger slide-up on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setAnimateIn(true));
      });
    } else {
      setAnimateIn(false);
      // Wait for slide-down animation before unmounting
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
