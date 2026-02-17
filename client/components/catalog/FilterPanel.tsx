import { useState } from "react";
import { DownOutlined, SearchOutlined } from "@ant-design/icons";
import { Checkbox, Slider, Switch } from "antd";
import { activeBrandConfig } from "../../config/brandConfig";
import type { ResolvedFilter, ActiveFilters, PriceRange } from "../../hooks/useCatalogState";

interface FilterPanelProps {
  resolvedFilters: ResolvedFilter[];
  activeFilters: ActiveFilters;
  priceRange: PriceRange | null;
  onFilterChange: (key: string, values: string[]) => void;
  onPriceRangeChange: (range: PriceRange | null) => void;
}

export default function FilterPanel({
  resolvedFilters,
  activeFilters,
  priceRange,
  onFilterChange,
  onPriceRangeChange,
}: FilterPanelProps) {
  const config = activeBrandConfig;
  const [openSections, setOpenSections] = useState<Set<string>>(
    () => new Set((resolvedFilters || []).slice(0, 3).map((f) => f.def.key)),
  );

  const toggle = (key: string) => {
    setOpenSections((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (resolvedFilters.length === 0) return null;

  return (
    <div className="space-y-1">
      <h4
        className="text-xs font-semibold uppercase tracking-wider mb-3"
        style={{ color: config.secondaryColor }}
      >
        Filters
      </h4>
      {resolvedFilters.map((rf) => {
        const isOpen = openSections.has(rf.def.key);
        const selectedCount = (activeFilters[rf.def.key] || []).length;

        return (
          <div
            key={rf.def.key}
            className="border-b"
            style={{ borderColor: config.borderColor }}
          >
            <button
              onClick={() => toggle(rf.def.key)}
              className="w-full flex items-center justify-between py-3 text-xs font-medium cursor-pointer bg-transparent border-none"
              style={{ color: config.primaryColor }}
            >
              <span className="flex items-center gap-1.5">
                {rf.def.label}
                {selectedCount > 0 && (
                  <span
                    className="text-[9px] font-semibold px-1.5 py-0.5 rounded-full"
                    style={{ backgroundColor: config.primaryColor, color: "#fff" }}
                  >
                    {selectedCount}
                  </span>
                )}
              </span>
              <DownOutlined
                className="text-[9px] transition-transform duration-200"
                style={{
                  color: config.secondaryColor,
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}
              />
            </button>
            {isOpen && (
              <div className="pb-3">
                {rf.def.filterType === "checkbox" && (
                  <CheckboxFilter
                    filterKey={rf.def.key}
                    options={rf.options}
                    selected={activeFilters[rf.def.key] || []}
                    onChange={onFilterChange}
                  />
                )}
                {rf.def.filterType === "range" && rf.range && (
                  <RangeFilter
                    range={rf.range}
                    activeRange={priceRange}
                    onChange={onPriceRangeChange}
                  />
                )}
                {rf.def.filterType === "boolean" && (
                  <BooleanFilter
                    filterKey={rf.def.key}
                    label={rf.def.label}
                    selected={activeFilters[rf.def.key] || []}
                    onChange={onFilterChange}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Checkbox Filter (with search for long lists) ────────────────────

function CheckboxFilter({
  filterKey,
  options,
  selected,
  onChange,
}: {
  filterKey: string;
  options: Array<{ value: string; count: number }>;
  selected: string[];
  onChange: (key: string, values: string[]) => void;
}) {
  const config = activeBrandConfig;
  const [search, setSearch] = useState("");
  const showSearch = options.length > 6;

  const filtered = search
    ? options.filter((o) => o.value.toLowerCase().includes(search.toLowerCase()))
    : options;

  const handleToggle = (value: string) => {
    const next = selected.includes(value)
      ? selected.filter((v) => v !== value)
      : [...selected, value];
    onChange(filterKey, next);
  };

  return (
    <div>
      {showSearch && (
        <div className="relative mb-2">
          <SearchOutlined
            className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px]"
            style={{ color: config.secondaryColor }}
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search..."
            className="w-full text-[11px] pl-6 pr-2 py-1.5 rounded-md outline-none"
            style={{
              border: `1px solid ${config.borderColor}`,
              color: config.primaryColor,
            }}
          />
        </div>
      )}
      <div className="space-y-1.5 max-h-[200px] overflow-y-auto">
        {filtered.map((opt) => (
          <label
            key={opt.value}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <Checkbox
              checked={selected.includes(opt.value)}
              onChange={() => handleToggle(opt.value)}
              className="text-xs"
            />
            <span className="text-[11px] flex-1 truncate" style={{ color: config.primaryColor }}>
              {opt.value}
            </span>
            <span className="text-[10px]" style={{ color: config.secondaryColor }}>
              {opt.count}
            </span>
          </label>
        ))}
        {filtered.length === 0 && (
          <p className="text-[10px] py-1" style={{ color: config.secondaryColor }}>
            No matches
          </p>
        )}
      </div>
    </div>
  );
}

// ── Range Filter (price slider) ─────────────────────────────────────

function RangeFilter({
  range,
  activeRange,
  onChange,
}: {
  range: PriceRange;
  activeRange: PriceRange | null;
  onChange: (range: PriceRange | null) => void;
}) {
  const config = activeBrandConfig;
  const currentMin = activeRange?.min ?? range.min;
  const currentMax = activeRange?.max ?? range.max;

  const handleChange = (values: number[]) => {
    const [min, max] = values;
    if (min === range.min && max === range.max) {
      onChange(null); // reset if full range
    } else {
      onChange({ min, max });
    }
  };

  return (
    <div className="px-1">
      <Slider
        range
        min={range.min}
        max={range.max}
        value={[currentMin, currentMax]}
        onChange={handleChange}
        tooltip={{ formatter: (v) => `$${v}` }}
      />
      <div className="flex justify-between text-[10px]" style={{ color: config.secondaryColor }}>
        <span>${currentMin}</span>
        <span>${currentMax}</span>
      </div>
    </div>
  );
}

// ── Boolean Filter (toggle) ─────────────────────────────────────────

function BooleanFilter({
  filterKey,
  label,
  selected,
  onChange,
}: {
  filterKey: string;
  label: string;
  selected: string[];
  onChange: (key: string, values: string[]) => void;
}) {
  const config = activeBrandConfig;
  const isOn = selected.includes("true");

  const handleToggle = (checked: boolean) => {
    onChange(filterKey, checked ? ["true"] : []);
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-[11px]" style={{ color: config.primaryColor }}>
        {label} only
      </span>
      <Switch size="small" checked={isOn} onChange={handleToggle} />
    </div>
  );
}
