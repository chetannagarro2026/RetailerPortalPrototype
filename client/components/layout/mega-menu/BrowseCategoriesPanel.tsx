import { useMemo } from "react";
import { Link } from "react-router-dom";
import { RightOutlined } from "@ant-design/icons";
import { Spin } from "antd";
import { useQuery } from "@tanstack/react-query";
import { activeBrandConfig } from "../../../config/brandConfig";
import { fetchCategoriesByParent, type CategoryItem } from "../../../services/categoryService";

type CategoryWithChildren = {
  id: string;
  name: string;
  code?: string;
  children: CategoryItem[];
};

/**
 * Build a 2-level category structure (parents with children only)
 */
function buildTwoLevelStructure(items: CategoryItem[]): CategoryWithChildren[] {
  const map = new Map<string, CategoryItem>();
  
  // Create a map of all categories by ID
  items.forEach((item) => {
    if (item && item.id) {
      map.set(item.id, item);
    }
  });

  // Find root categories (those whose parent doesn't exist in the map)
  const roots: CategoryWithChildren[] = [];
  const childrenByParentId = new Map<string, CategoryItem[]>();

  items.forEach((item) => {
    if (!item || !item.id) return;

    const parentId = item.parentCategoryId;

    if (parentId && map.has(parentId)) {
      // This item has a parent in the map, so it's a child
      if (!childrenByParentId.has(parentId)) {
        childrenByParentId.set(parentId, []);
      }
      childrenByParentId.get(parentId)!.push(item);
    } else {
      // No parent in map, this is a root (level 1)
      roots.push({
        id: item.id,
        name: item.name,
        code: item.code,
        children: [],
      });
    }
  });

  // Attach children to their parents
  roots.forEach((root) => {
    root.children = childrenByParentId.get(root.id) || [];
  });

  return roots;
}

export default function BrowseCategoriesPanel({ onClose }: { onClose: () => void }) {
  const config = activeBrandConfig;
  
  // Use the same parent ID as CategoryTree component
  const parentId = "08d6ff04-11c5-4e5b-a1c8-11ac167e849b";

  const { data, isLoading, error } = useQuery({
    queryKey: ["categories", parentId],
    queryFn: () => fetchCategoriesByParent(parentId),
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
  });

  // Normalize API response to flat array
  const items: CategoryItem[] = useMemo(() => {
    if (!data) return [];
    if (Array.isArray(data)) return data as CategoryItem[];
    if ((data as any).content && Array.isArray((data as any).content)) {
      return (data as any).content;
    }
    return [];
  }, [data]);

  // Build 2-level structure
  const level1Categories = useMemo(() => buildTwoLevelStructure(items), [items]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spin />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 py-4">
        Failed to load categories. Please try again.
      </div>
    );
  }

  if (level1Categories.length === 0) {
    return (
      <div className="text-sm text-gray-500 py-4">
        No categories available.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-3 gap-4">
        {level1Categories.map((cat) => {
          const href = `/catalog/${cat.code || cat.id}`;
          const subCategories = cat.children;

          return (
            <div key={cat.id} className="mb-2">
              <Link
                to={href}
                onClick={onClose}
                className="text-sm font-semibold no-underline transition-colors hover:underline mb-2 block"
                style={{ color: config.primaryColor }}
              >
                {cat.name || cat.code || cat.id}
              </Link>
              <ul className="space-y-1.5">
                {subCategories.slice(0, 6).map((sub) => {
                  const subHref = `/catalog/${cat.code || cat.id}/${sub.code || sub.id}`;
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
                        {sub.name || sub.code || sub.id}
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
