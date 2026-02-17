import { activeBrandConfig } from "../../config/brandConfig";
import { type CatalogNode, getChildren } from "../../data/catalogData";
import CategoryCard from "./CategoryCard";
import NodeCard from "./NodeCard";

interface SubcategoryCardGridProps {
  node: CatalogNode;
}

export default function SubcategoryCardGrid({ node }: SubcategoryCardGridProps) {
  const config = activeBrandConfig;
  const children = getChildren(node.id);

  if (children.length === 0) return null;

  // Level 0 → CategoryCard (hero/thumbnail per tenant config)
  // Level 1+ → NodeCard (mid-level subcategory display)
  if (node.level === 0) {
    const variant = config.categoryCardVariant;
    const gridCols =
      variant === "hero"
        ? "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4";
    const gap = variant === "hero" ? "gap-6" : "gap-4";

    return (
      <div className={`grid ${gridCols} ${gap}`}>
        {children.map((child) => (
          <CategoryCard key={child.id} node={child} variant={variant} />
        ))}
      </div>
    );
  }

  // Level 1+: NodeCard grid (3-4 cols, 24px gap)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {children.map((child) => (
        <NodeCard key={child.id} node={child} />
      ))}
    </div>
  );
}
