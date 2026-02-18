import { useState, useMemo } from "react";
import { Input, Checkbox } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { ProductVariant } from "../../data/catalogData";

export type SkuFilters = Record<string, string[]>;

interface SkuFilterPanelProps {
  variants: ProductVariant[];
  activeFilters: SkuFilters;
  onFilterChange: (key: string, values: string[]) => void;
  onClearAll: () => void;
}

interface FilterGroup {
  key: string;
  label: string;
  options: Array<{ value: string; count: number }>;
}

const AVAILABILITY_LABELS: Record<string, string> = {
  "in-stock": "In Stock",
  "low-stock": "Low Stock",
  "out-of-stock": "Out of Stock",
  "pre-order": "Pre-Order",
};

export default function SkuFilterPanel({
  variants,
  activeFilters,
  onFilterChange,
  onClearAll,
}: SkuFilterPanelProps) {
  const config = activeBrandConfig;

  const filterGroups = useMemo<FilterGroup[]>(() => {
    const groups: FilterGroup[] = [];

    // Collect all attribute keys
    const attrKeys = new Set<string>();
    for (const v of variants) {
      for (const key of Object.keys(v.attributes)) attrKeys.add(key);
    }

    // Build filter groups for each attribute
    for (const key of attrKeys) {
      const valueCounts = new Map<string, number>();
      for (const v of variants) {
        const val = v.attributes[key];
        if (val) valueCounts.set(val, (valueCounts.get(val) || 0) + 1);
      }
      if (valueCounts.size > 0) {
        groups.push({
          key,
          label: key,
          options: Array.from(valueCounts.entries())
            .map(([value, count]) => ({ value, count }))
            .sort((a, b) => b.count - a.count),
        });
      }
    }

    // Availability filter (only if there are multiple statuses)
    const availCounts = new Map<string, number>();
    for (const v of variants) {
      availCounts.set(v.availabilityStatus, (availCounts.get(v.availabilityStatus) || 0) + 1);
    }
    if (availCounts.size > 1) {
      groups.push({
        key: "_availability",
        label: "Availability",
        options: Array.from(availCounts.entries()).map(([value, count]) => ({ value, count })),
      });
    }

    return groups;
  }, [variants]);

  const hasActive = Object.values(activeFilters).some((v) => v.length > 0);

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: config.primaryColor }}
        >
          Filters
        </span>
        {hasActive && (
          <button
            onClick={onClearAll}
            className="text-[11px] font-medium cursor-pointer bg-transparent border-none"
            style={{ color: config.primaryColor }}
          >
            Clear All
          </button>
        )}
      </div>

      {filterGroups.map((group) => (
        <FilterSection
          key={group.key}
          group={group}
          selected={activeFilters[group.key] || []}
          onChange={(values) => onFilterChange(group.key, values)}
        />
      ))}
    </div>
  );
}

// ── Individual Filter Section ───────────────────────────────────────

function FilterSection({
  group,
  selected,
  onChange,
}: {
  group: FilterGroup;
  selected: string[];
  onChange: (values: string[]) => void;
}) {
  const config = activeBrandConfig;
  const [search, setSearch] = useState("");
  const showSearch = group.options.length > 8;

  const filtered = showSearch && search
    ? group.options.filter((o) => o.value.toLowerCase().includes(search.toLowerCase()))
    : group.options;

  const handleToggle = (value: string) => {
    onChange(
      selected.includes(value)
        ? selected.filter((v) => v !== value)
        : [...selected, value],
    );
  };

  return (
    <div>
      <p className="text-xs font-semibold mb-2" style={{ color: config.primaryColor }}>
        {group.label}
        {selected.length > 0 && (
          <span className="font-normal ml-1" style={{ color: config.secondaryColor }}>
            ({selected.length})
          </span>
        )}
      </p>

      {showSearch && (
        <Input
          size="small"
          placeholder={`Search ${group.label}...`}
          prefix={<SearchOutlined className="text-gray-400 text-[11px]" />}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mb-2"
          style={{ borderRadius: 6 }}
        />
      )}

      <div className="space-y-1 max-h-[180px] overflow-y-auto">
        {filtered.map((option) => (
          <label
            key={option.value}
            className="flex items-center gap-2 py-0.5 cursor-pointer text-xs"
            style={{ color: config.primaryColor }}
          >
            <Checkbox
              checked={selected.includes(option.value)}
              onChange={() => handleToggle(option.value)}
            />
            <span className="flex-1 truncate">
              {group.key === "_availability"
                ? AVAILABILITY_LABELS[option.value] || option.value
                : option.value}
            </span>
            <span className="text-[10px] shrink-0" style={{ color: config.secondaryColor }}>
              ({option.count})
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}

// ── Filter Application Logic ────────────────────────────────────────

/** Apply AND across attributes, OR within same attribute */
export function applySkuFilters(
  variants: ProductVariant[],
  filters: SkuFilters,
): ProductVariant[] {
  const activeKeys = Object.entries(filters).filter(([, v]) => v.length > 0);
  if (activeKeys.length === 0) return variants;

  return variants.filter((v) => {
    for (const [key, values] of activeKeys) {
      if (key === "_availability") {
        if (!values.includes(v.availabilityStatus)) return false;
      } else {
        const attrValue = v.attributes[key];
        if (!attrValue || !values.includes(attrValue)) return false;
      }
    }
    return true;
  });
}
