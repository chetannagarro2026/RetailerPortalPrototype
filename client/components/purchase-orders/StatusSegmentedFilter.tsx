import { activeBrandConfig } from "../../config/brandConfig";

interface Props {
  filters: string[];
  counts: Record<string, number>;
  active: string;
  onSelect: (filter: string) => void;
}

export default function StatusSegmentedFilter({ filters, counts, active, onSelect }: Props) {
  const config = activeBrandConfig;

  return (
    <div
      className="inline-flex rounded-lg overflow-hidden"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      {filters.map((f, idx) => {
        const isActive = f === active;
        return (
          <button
            key={f}
            onClick={() => onSelect(f)}
            className="px-4 py-2 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
            style={{
              backgroundColor: isActive ? config.primaryColor : "#fff",
              color: isActive ? "#fff" : config.secondaryColor,
              border: "none",
              borderRight: idx < filters.length - 1 ? `1px solid ${config.borderColor}` : "none",
            }}
          >
            {f === "Pending Credit Approval" ? "Pending" : f} ({counts[f] || 0})
          </button>
        );
      })}
    </div>
  );
}
