import { Link } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { type CatalogNode, getAncestors, getSlugPath } from "../../data/catalogData";

interface CatalogBreadcrumbProps {
  node: CatalogNode;
}

export default function CatalogBreadcrumb({ node }: CatalogBreadcrumbProps) {
  const config = activeBrandConfig;
  const ancestors = getAncestors(node.id).filter((a) => a.level >= 0);

  const crumbs = [
    { label: "Home", href: "/" },
    { label: "Catalog", href: "/catalog" },
    ...ancestors
      .filter((a) => a.level >= 1)
      .map((a) => ({
        label: a.label,
        href: `/catalog/${getSlugPath(a.id).join("/")}`,
      })),
    { label: node.label, href: "" },
  ];

  return (
    <nav className="flex items-center gap-1.5 flex-wrap mb-4">
      {crumbs.map((crumb, i) => {
        const isLast = i === crumbs.length - 1;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && (
              <RightOutlined className="text-[8px]" style={{ color: config.secondaryColor }} />
            )}
            {isLast ? (
              <span
                className="text-xs font-medium"
                style={{ color: config.primaryColor }}
              >
                {crumb.label}
              </span>
            ) : (
              <Link
                to={crumb.href}
                className="text-xs no-underline transition-colors hover:underline"
                style={{ color: config.secondaryColor }}
              >
                {crumb.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
