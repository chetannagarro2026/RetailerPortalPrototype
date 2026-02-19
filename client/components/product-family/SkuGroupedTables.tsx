import { useMemo } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogProduct, ProductVariant, VariantAttribute } from "../../data/catalogData";
import type { SkuFilters } from "./SkuFilterPanel";
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

  // Determine grouping: use first attribute if 2+ attributes, otherwise no grouping
  const groupingAttr = variantAttributes.length >= 2 ? variantAttributes[0].name : null;

  // Columns: all attributes except the grouping attribute
  const columns = useMemo(
    () => variantAttributes.filter((a) => a.name !== groupingAttr).map((a) => a.name),
    [variantAttributes, groupingAttr],
  );

  // Group variants
  const groups = useMemo<VariantGroup[]>(() => {
    if (!groupingAttr) {
      return [{ label: "", variants }];
    }
    const map = new Map<string, ProductVariant[]>();
    // Preserve attribute order from definition
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

  // Collect active filter chips
  const activeChips = useMemo(() => {
    const chips: Array<{ key: string; value: string; label: string }> = [];
    for (const [key, values] of Object.entries(activeFilters)) {
      for (const value of values) {
        const label = key === "_availability"
          ? `Availability: ${AVAILABILITY_LABELS[value] || value}`
          : `${key}: ${value}`;
        chips.push({ key, value, label });
      }
    }
    return chips;
  }, [activeFilters]);

  return (
    <div>
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
        /* Grouped Tables */
        groups.map((group) => (
          <SkuTableGroup
            key={group.label || "__ungrouped"}
            groupLabel={group.label || null}
            variants={group.variants}
            columns={columns}
            product={product}
            expandedId={expandedId}
            onToggleExpand={onToggleExpand}
          />
        ))
      )}
    </div>
  );
}
