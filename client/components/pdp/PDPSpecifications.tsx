import { activeBrandConfig } from "../../config/brandConfig";

interface PDPSpecificationsProps {
  specifications: Array<{ label: string; value: string }>;
}

export default function PDPSpecifications({ specifications }: PDPSpecificationsProps) {
  const config = activeBrandConfig;

  return (
    <div
      className="rounded-xl p-5"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <h2 className="text-sm font-semibold mb-3" style={{ color: config.primaryColor }}>
        Specifications
      </h2>
      <div className="divide-y" style={{ borderColor: config.borderColor }}>
        {specifications.map((spec, i) => (
          <div
            key={spec.label}
            className="flex items-center py-2.5 text-xs"
            style={{ borderColor: config.borderColor }}
          >
            <span className="w-36 shrink-0 font-medium" style={{ color: config.secondaryColor }}>
              {spec.label}
            </span>
            <span style={{ color: config.primaryColor }}>{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
