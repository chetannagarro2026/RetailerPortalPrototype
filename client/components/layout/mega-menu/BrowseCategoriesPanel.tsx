import { Link } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../../config/brandConfig";
import { getChildren, getSlugPath } from "../../../data/catalogData";

export default function BrowseCategoriesPanel({ onClose }: { onClose: () => void }) {
  const config = activeBrandConfig;
  const level1Categories = getChildren("root");

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {level1Categories.map((cat) => {
          const slugPath = getSlugPath(cat.id);
          const href = `/catalog/${slugPath.join("/")}`;
          const subCategories = getChildren(cat.id);

          return (
            <div key={cat.id} className="mb-2">
              <Link
                to={href}
                onClick={onClose}
                className="text-sm font-semibold no-underline transition-colors hover:underline mb-2 block"
                style={{ color: config.primaryColor }}
              >
                {cat.label}
              </Link>
              <ul className="space-y-1.5">
                {subCategories.slice(0, 6).map((sub) => {
                  const subHref = `/catalog/${getSlugPath(sub.id).join("/")}`;
                  return (
                    <li key={sub.id}>
                      <Link
                        to={subHref}
                        onClick={onClose}
                        className="text-xs no-underline transition-colors block"
                        style={{ color: "#6B7280" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = config.primaryColor;
                          e.currentTarget.style.fontWeight = "500";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "#6B7280";
                          e.currentTarget.style.fontWeight = "400";
                        }}
                      >
                        {sub.label}
                      </Link>
                    </li>
                  );
                })}
                {subCategories.length > 6 && (
                  <li>
                    <Link
                      to={href}
                      onClick={onClose}
                      className="text-[11px] font-medium no-underline flex items-center gap-1"
                      style={{ color: config.secondaryColor }}
                    >
                      View all <RightOutlined className="text-[8px]" />
                    </Link>
                  </li>
                )}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
