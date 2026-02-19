import { Link } from "react-router-dom";
import { RightOutlined, AppstoreOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { type CatalogNode, getChildren, getSlugPath } from "../../data/catalogData";

interface NodeCardProps {
  node: CatalogNode;
}

export default function NodeCard({ node }: NodeCardProps) {
  const config = activeBrandConfig;
  const slugPath = getSlugPath(node.id);
  const href = `/catalog/${slugPath.join("/")}`;
  const childCount = getChildren(node.id).length;

  return (
    <Link
      to={href}
      className="group rounded-xl overflow-hidden no-underline transition-all duration-200 hover:shadow-md flex flex-col bg-white"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      {/* Thumbnail image */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4/3" }}>
        {node.heroImage ? (
          <img
            src={node.heroImage}
            alt={node.label}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <NodeImageFallback label={node.label} />
        )}
        {node.badge && <NodeBadge label={node.badge} />}
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1">
        <h3
          className="text-sm font-semibold mb-1 transition-colors group-hover:underline"
          style={{ color: config.primaryColor }}
        >
          {node.label}
        </h3>

        {node.description && (
          <p
            className="text-xs mb-2 line-clamp-2"
            style={{ color: config.secondaryColor }}
          >
            {node.description}
          </p>
        )}

        <NodeMeta node={node} childCount={childCount} />
        <NodeMetaAttributes node={node} />

        <div className="flex items-center gap-1.5 mt-auto pt-3">
          <span
            className="text-xs font-medium"
            style={{ color: config.primaryColor }}
          >
            Explore
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

// ── Sub-components ──────────────────────────────────────────────────

function NodeMeta({ node, childCount }: { node: CatalogNode; childCount: number }) {
  const config = activeBrandConfig;
  const parts: string[] = [];
  if (node.hasChildren && childCount > 0) {
    parts.push(`${childCount} subcategories`);
  }
  if (node.productCount > 0) {
    parts.push(`${node.productCount} products`);
  }
  if (parts.length === 0) return null;

  return (
    <p className="text-xs mb-0" style={{ color: config.secondaryColor }}>
      {parts.join(" · ")}
    </p>
  );
}

function NodeMetaAttributes({ node }: { node: CatalogNode }) {
  const config = activeBrandConfig;
  if (!node.metaAttributes || node.metaAttributes.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1.5">
      {node.metaAttributes.map((attr) => (
        <span
          key={attr.label}
          className="text-[11px]"
          style={{ color: config.secondaryColor }}
        >
          <span className="font-medium">{attr.value}</span> {attr.label}
        </span>
      ))}
    </div>
  );
}

function NodeBadge({ label }: { label: string }) {
  return (
    <span
      className="absolute top-2 left-2 text-[10px] font-semibold px-2 py-0.5 rounded-full text-white"
      style={{ backgroundColor: "#1B2A4A" }}
    >
      {label}
    </span>
  );
}

function NodeImageFallback({ label }: { label: string }) {
  const config = activeBrandConfig;
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-2"
      style={{ backgroundColor: config.cardBg }}
    >
      <AppstoreOutlined
        className="text-3xl"
        style={{ color: config.secondaryColor, opacity: 0.4 }}
      />
      <span
        className="text-[11px] font-medium"
        style={{ color: config.secondaryColor, opacity: 0.4 }}
      >
        {label}
      </span>
    </div>
  );
}
