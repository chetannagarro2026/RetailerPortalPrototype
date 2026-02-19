import { CloseOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { filterAttributeRegistry } from "../../data/catalogData";
import type { ActiveFilters, PriceRange } from "../../hooks/useCatalogState";

interface ActiveFilterChipsProps {
  activeFilters: ActiveFilters;
  priceRange: PriceRange | null;
  onRemoveValue: (key: string, value: string) => void;
  onRemoveFilter: (key: string) => void;
  onClearAll: () => void;
  onClearPriceRange: () => void;
}

export default function ActiveFilterChips({
  activeFilters,
  priceRange,
  onRemoveValue,
  onClearAll,
  onClearPriceRange,
}: ActiveFilterChipsProps) {
  const config = activeBrandConfig;

  const chips: Array<{ key: string; label: string; value: string }> = [];

  for (const [key, values] of Object.entries(activeFilters)) {
    if (values.length === 0) continue;
    const def = filterAttributeRegistry.find((d) => d.key === key);
    const label = def?.label || key;

    if (def?.filterType === "boolean") {
      chips.push({ key, label, value: "true" });
    } else {
      for (const v of values) {
        chips.push({ key, label, value: v });
      }
    }
  }

  const hasPriceFilter = priceRange !== null;
  const hasAny = chips.length > 0 || hasPriceFilter;

  if (!hasAny) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="text-[10px] font-semibold uppercase tracking-wider mr-1" style={{ color: config.secondaryColor }}>
        Applied:
      </span>

      {chips.map((chip) => (
        <span
          key={`${chip.key}-${chip.value}`}
          className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: config.cardBg,
            color: config.primaryColor,
            border: `1px solid ${config.borderColor}`,
          }}
        >
          <span style={{ color: config.secondaryColor }}>{chip.label}:</span>
          {chip.key === "hasDiscount" ? "Yes" : chip.value}
          <button
            onClick={() => onRemoveValue(chip.key, chip.value)}
            className="ml-0.5 cursor-pointer rounded-full hover:bg-gray-200 p-0.5 transition-colors"
            style={{ border: "none", background: "transparent", color: config.secondaryColor }}
          >
            <CloseOutlined className="text-[8px]" />
          </button>
        </span>
      ))}

      {hasPriceFilter && (
        <span
          className="inline-flex items-center gap-1 text-[11px] font-medium px-2.5 py-1 rounded-full"
          style={{
            backgroundColor: config.cardBg,
            color: config.primaryColor,
            border: `1px solid ${config.borderColor}`,
          }}
        >
          <span style={{ color: config.secondaryColor }}>Price:</span>
          ${priceRange!.min} – ${priceRange!.max}
          <button
            onClick={onClearPriceRange}
            className="ml-0.5 cursor-pointer rounded-full hover:bg-gray-200 p-0.5 transition-colors"
            style={{ border: "none", background: "transparent", color: config.secondaryColor }}
          >
            <CloseOutlined className="text-[8px]" />
          </button>
        </span>
      )}

      <button
        onClick={onClearAll}
        className="text-[10px] font-semibold px-2 py-1 rounded-full cursor-pointer transition-colors"
        style={{
          border: "none",
          background: "transparent",
          color: "#DC2626",
        }}
      >
        Clear All
      </button>
    </div>
  );
}
