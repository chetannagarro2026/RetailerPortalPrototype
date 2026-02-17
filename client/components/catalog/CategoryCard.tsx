import { Link } from "react-router-dom";
import { RightOutlined, AppstoreOutlined } from "@ant-design/icons";
import { activeBrandConfig, type CategoryCardVariant } from "../../config/brandConfig";
import { type CatalogNode, getChildren, getSlugPath } from "../../data/catalogData";

interface CategoryCardProps {
  node: CatalogNode;
  variant: CategoryCardVariant;
}

export default function CategoryCard({ node, variant }: CategoryCardProps) {
  return variant === "hero"
    ? <HeroCard node={node} />
    : <ThumbnailCard node={node} />;
}

// ── Variant A: Hero Card ────────────────────────────────────────────

function HeroCard({ node }: { node: CatalogNode }) {
  const config = activeBrandConfig;
  const slugPath = getSlugPath(node.id);
  const href = `/catalog/${slugPath.join("/")}`;
  const childCount = getChildren(node.id).length;

  return (
    <Link
      to={href}
      className="group rounded-xl overflow-hidden no-underline transition-all duration-200 hover:shadow-lg flex flex-col bg-white"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      {/* Image area */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/10" }}>
        {node.heroImage ? (
          <img
            src={node.heroImage}
            alt={node.label}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <ImageFallback label={node.label} />
        )}
        {node.badge && <Badge label={node.badge} />}
      </div>

      {/* Text area */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="text-base font-semibold mb-1 transition-colors group-hover:underline"
          style={{ color: config.primaryColor }}
        >
          {node.label}
        </h3>

        {node.description && (
          <p className="text-xs mb-2 line-clamp-2" style={{ color: config.secondaryColor }}>
            {node.description}
          </p>
        )}

        <MetaCounts node={node} childCount={childCount} />

        <div className="flex items-center gap-1.5 mt-auto pt-3">
          <span
            className="text-xs font-medium transition-colors"
            style={{ color: config.primaryColor }}
          >
            Browse
          </span>
          <RightOutlined
            className="text-[10px] transition-transform group-hover:translate-x-0.5"
            style={{ color: config.primaryColor }}
          />
        </div>
      </div>
    </Link>
  );
}

// ── Variant B: Thumbnail Card ───────────────────────────────────────

function ThumbnailCard({ node }: { node: CatalogNode }) {
  const config = activeBrandConfig;
  const slugPath = getSlugPath(node.id);
  const href = `/catalog/${slugPath.join("/")}`;
  const childCount = getChildren(node.id).length;

  return (
    <Link
      to={href}
      className="group rounded-lg overflow-hidden no-underline transition-all duration-200 hover:shadow-md flex flex-row items-stretch bg-white"
      style={{ border: `1px solid ${config.borderColor}`, minHeight: 100 }}
    >
      {/* Small thumbnail */}
      <div className="shrink-0 w-24 overflow-hidden relative">
        {node.heroImage ? (
          <img
            src={node.heroImage}
            alt={node.label}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <ImageFallback label={node.label} compact />
        )}
        {node.badge && <Badge label={node.badge} compact />}
      </div>

      {/* Text */}
      <div className="p-3 flex flex-col flex-1 justify-center">
        <h3
          className="text-sm font-semibold mb-0.5 transition-colors group-hover:underline"
          style={{ color: config.primaryColor }}
        >
          {node.label}
        </h3>

        <MetaCounts node={node} childCount={childCount} compact />

        <div className="flex items-center gap-1 mt-2">
          <span
            className="text-[11px] font-medium transition-colors"
            style={{ color: config.secondaryColor }}
          >
            Browse
          </span>
          <RightOutlined
            className="text-[9px] transition-transform group-hover:translate-x-0.5"
            style={{ color: config.secondaryColor }}
          />
        </div>
      </div>
    </Link>
  );
}

// ── Shared Sub-Components ───────────────────────────────────────────

function MetaCounts({
  node,
  childCount,
  compact,
}: {
  node: CatalogNode;
  childCount: number;
  compact?: boolean;
}) {
  const config = activeBrandConfig;
  const textSize = compact ? "text-[11px]" : "text-xs";

  const parts: string[] = [];
  if (node.hasChildren && childCount > 0) {
    parts.push(`${childCount} subcategories`);
  }
  if (node.productCount > 0) {
    parts.push(`${node.productCount} products`);
  }

  if (parts.length === 0) return null;

  return (
    <p className={`${textSize} mb-0`} style={{ color: config.secondaryColor }}>
      {parts.join(" · ")}
    </p>
  );
}

function Badge({ label, compact }: { label: string; compact?: boolean }) {
  return (
    <span
      className={`absolute top-2 left-2 rounded-full font-semibold text-white ${
        compact ? "text-[9px] px-1.5 py-0.5" : "text-[10px] px-2 py-0.5"
      }`}
      style={{ backgroundColor: "#1B2A4A" }}
    >
      {label}
    </span>
  );
}

function ImageFallback({ label, compact }: { label: string; compact?: boolean }) {
  const config = activeBrandConfig;
  return (
    <div
      className={`w-full h-full flex flex-col items-center justify-center ${
        compact ? "gap-1" : "gap-2"
      }`}
      style={{ backgroundColor: config.cardBg }}
    >
      <AppstoreOutlined
        className={compact ? "text-lg" : "text-3xl"}
        style={{ color: config.secondaryColor, opacity: 0.5 }}
      />
      {!compact && (
        <span className="text-[11px] font-medium" style={{ color: config.secondaryColor, opacity: 0.5 }}>
          {label}
        </span>
      )}
    </div>
  );
}
