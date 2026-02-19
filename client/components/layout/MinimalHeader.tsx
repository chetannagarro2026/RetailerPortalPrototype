import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";

export default function MinimalHeader() {
  const config = activeBrandConfig;

  return (
    <header
      className="sticky top-0 z-50 w-full bg-white"
      style={{
        height: "var(--header-height)",
        borderBottom: `1px solid ${config.borderColor}`,
      }}
    >
      <div className="h-full flex items-center justify-center px-6">
        <Link to="/" className="flex items-center gap-3 shrink-0 no-underline">
          {config.logoUrl ? (
            <img src={config.logoUrl} alt={config.brandName} className="h-8 w-auto" />
          ) : (
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-semibold"
                style={{ backgroundColor: config.primaryColor }}
              >
                {config.brandName.charAt(0)}
              </div>
              <span className="text-base font-semibold tracking-tight" style={{ color: config.primaryColor }}>
                {config.brandName}
              </span>
              <span className="text-xs text-gray-400 ml-1 font-normal tracking-wide uppercase">
                {config.portalTitle}
              </span>
            </div>
          )}
        </Link>
      </div>
    </header>
  );
}
