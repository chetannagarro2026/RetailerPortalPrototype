import { Select } from "antd";
import { TableOutlined, AppstoreOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { SortKey } from "../../hooks/useCatalogState";

export type CollectionViewMode = "table" | "grid";

interface CollectionHeaderProps {
  title: string;
  familyCount: number;
  totalFamilies: number;
  subcategoryCount: number;
  hasActiveFilters: boolean;
  viewMode: CollectionViewMode;
  onViewModeChange: (mode: CollectionViewMode) => void;
  sortBy: SortKey;
  onSortChange: (sort: SortKey) => void;
}

export default function CollectionHeader({
  title,
  familyCount,
  totalFamilies,
  subcategoryCount,
  hasActiveFilters,
  viewMode,
  onViewModeChange,
  sortBy,
  onSortChange,
}: CollectionHeaderProps) {
  const config = activeBrandConfig;

  return (
    <div className="flex items-start justify-between mb-5">
      <div>
        <h1
          className="text-lg font-semibold mb-0.5"
          style={{ color: config.primaryColor }}
        >
          {title}
        </h1>
        <p className="text-xs" style={{ color: config.secondaryColor }}>
          {familyCount} Product Famil{familyCount !== 1 ? "ies" : "y"}
          {hasActiveFilters && ` (filtered from ${totalFamilies})`}
          {subcategoryCount > 0 && ` · ${subcategoryCount} Subcategories`}
        </p>
      </div>

      <div className="flex items-center gap-3">
        <ViewToggle mode={viewMode} onChange={onViewModeChange} />
        <Select
          value={sortBy}
          onChange={(val) => onSortChange(val as SortKey)}
          size="small"
          style={{ width: 180 }}
          options={[
            { value: "relevance", label: "Sort: Relevance" },
            { value: "price-asc", label: "Price: Low → High" },
            { value: "price-desc", label: "Price: High → Low" },
            { value: "alpha-asc", label: "Name: A → Z" },
            { value: "alpha-desc", label: "Name: Z → A" },
            { value: "newest", label: "Newest First" },
            { value: "bestselling", label: "Best Selling" },
          ]}
        />
      </div>
    </div>
  );
}

function ViewToggle({
  mode,
  onChange,
}: {
  mode: CollectionViewMode;
  onChange: (m: CollectionViewMode) => void;
}) {
  const config = activeBrandConfig;

  const items: { key: CollectionViewMode; label: string; icon: React.ReactNode }[] = [
    { key: "table", label: "Table", icon: <TableOutlined className="text-xs" /> },
    { key: "grid", label: "Grid", icon: <AppstoreOutlined className="text-xs" /> },
  ];

  return (
    <div
      className="flex rounded-lg overflow-hidden"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      {items.map((item, i) => (
        <button
          key={item.key}
          onClick={() => onChange(item.key)}
          className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-medium cursor-pointer transition-colors"
          style={{
            backgroundColor: mode === item.key ? config.primaryColor : "#fff",
            color: mode === item.key ? "#fff" : config.secondaryColor,
            border: "none",
            borderLeft: i > 0 ? `1px solid ${config.borderColor}` : "none",
          }}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
