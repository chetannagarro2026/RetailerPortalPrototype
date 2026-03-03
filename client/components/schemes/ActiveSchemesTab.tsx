import { getActiveSchemes } from "../../data/schemes";
import { activeBrandConfig } from "../../config/brandConfig";
import SchemeCard from "./SchemeCard";

export default function ActiveSchemesTab() {
  const config = activeBrandConfig;
  const schemes = getActiveSchemes();

  if (schemes.length === 0) {
    return (
      <div className="text-center py-16">
        <p className="text-sm" style={{ color: config.secondaryColor }}>
          No active schemes at the moment.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
      {schemes.map((scheme) => (
        <SchemeCard key={scheme.id} scheme={scheme} />
      ))}
    </div>
  );
}
