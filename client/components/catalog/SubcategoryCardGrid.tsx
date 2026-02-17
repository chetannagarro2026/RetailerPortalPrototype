import { Link } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { type CatalogNode, getChildren, getSlugPath } from "../../data/catalogData";

interface SubcategoryCardGridProps {
  node: CatalogNode;
}

export default function SubcategoryCardGrid({ node }: SubcategoryCardGridProps) {
  const config = activeBrandConfig;
  const children = getChildren(node.id);

  if (children.length === 0) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {children.map((child) => {
        const slugPath = getSlugPath(child.id);
        const href = `/catalog/${slugPath.join("/")}`;
        const childCount = getChildren(child.id).length;

        return (
          <Link
            key={child.id}
            to={href}
            className="group rounded-xl p-5 no-underline transition-shadow duration-200 hover:shadow-md flex flex-col justify-between"
            style={{
              border: `1px solid ${config.borderColor}`,
              backgroundColor: "#fff",
              minHeight: 120,
            }}
          >
            <div>
              <h3
                className="text-sm font-semibold mb-1 transition-colors group-hover:underline"
                style={{ color: config.primaryColor }}
              >
                {child.label}
              </h3>
              <p className="text-xs" style={{ color: config.secondaryColor }}>
                {child.hasChildren
                  ? `${childCount} subcategories`
                  : `${child.productCount} products`}
              </p>
            </div>
            <div className="flex items-center gap-1 mt-3">
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
          </Link>
        );
      })}
    </div>
  );
}
