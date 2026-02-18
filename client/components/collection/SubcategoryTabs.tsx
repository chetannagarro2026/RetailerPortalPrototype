import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogNode } from "../../data/catalogData";

interface SubcategoryTabsProps {
  children: CatalogNode[];
  activeTabId: string | null;
  onTabChange: (nodeId: string | null) => void;
}

export default function SubcategoryTabs({
  children,
  activeTabId,
  onTabChange,
}: SubcategoryTabsProps) {
  const config = activeBrandConfig;

  if (children.length === 0) return null;

  return (
    <div
      className="flex items-center gap-1 mb-5 overflow-x-auto pb-0.5"
      style={{ borderBottom: `1px solid ${config.borderColor}` }}
    >
      <TabButton
        label="All"
        count={null}
        isActive={activeTabId === null}
        onClick={() => onTabChange(null)}
      />
      {children.map((child) => (
        <TabButton
          key={child.id}
          label={child.label}
          count={child.productCount}
          isActive={activeTabId === child.id}
          onClick={() => onTabChange(child.id)}
        />
      ))}
    </div>
  );
}

function TabButton({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string;
  count: number | null;
  isActive: boolean;
  onClick: () => void;
}) {
  const config = activeBrandConfig;

  return (
    <button
      onClick={onClick}
      className="relative px-3.5 py-2.5 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
      style={{
        background: "none",
        border: "none",
        color: isActive ? config.primaryColor : config.secondaryColor,
        borderBottom: isActive ? `2px solid ${config.primaryColor}` : "2px solid transparent",
        marginBottom: "-1px",
      }}
    >
      {label}
      {count !== null && (
        <span
          className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full"
          style={{
            backgroundColor: isActive ? config.primaryColor : config.borderColor,
            color: isActive ? "#fff" : config.secondaryColor,
          }}
        >
          {count}
        </span>
      )}
    </button>
  );
}
