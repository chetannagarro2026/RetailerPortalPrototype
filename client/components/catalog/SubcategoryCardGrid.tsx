import { activeBrandConfig } from "../../config/brandConfig";
import { type CatalogNode } from "../../data/catalogData";
import { type CategoryTree } from "../../services/categoryService";
import CategoryCard from "./CategoryCard";
import NodeCard from "./NodeCard";

interface SubcategoryCardGridProps {
  node: CatalogNode;
  children?: CatalogNode[];
  tree: CategoryTree;
}

export default function SubcategoryCardGrid({ node, children: childrenProp, tree }: SubcategoryCardGridProps) {
  const config = activeBrandConfig;
  
  // Use provided children if available (from API), otherwise fall back to empty array
  const children = childrenProp || [];

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
          <CategoryCard key={child.id} node={child} variant={variant} tree={tree} />
        ))}
      </div>
    );
  }

  // Level 1+: NodeCard grid (3-4 cols, 24px gap)
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {children.map((child) => (
        <NodeCard key={child.id} node={child} tree={tree} />
      ))}
    </div>
  );
}
