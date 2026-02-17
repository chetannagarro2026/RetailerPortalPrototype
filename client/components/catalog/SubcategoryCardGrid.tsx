import { activeBrandConfig } from "../../config/brandConfig";
import { type CatalogNode, getChildren } from "../../data/catalogData";
import CategoryCard from "./CategoryCard";

interface SubcategoryCardGridProps {
  node: CatalogNode;
}

export default function SubcategoryCardGrid({ node }: SubcategoryCardGridProps) {
  const config = activeBrandConfig;
  const children = getChildren(node.id);

  if (children.length === 0) return null;

  // Use hero variant for Level 0 (root → Level 1 cards)
  // Use thumbnail for deeper levels unless tenant overrides
  const variant = node.level === 0 ? config.categoryCardVariant : "thumbnail";

  // Grid columns: hero = 3 cols max, thumbnail = 4 cols max
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
