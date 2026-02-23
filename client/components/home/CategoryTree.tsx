// import React, { useMemo } from "react";
// import { Tree, Spin } from "antd";
// import { useQuery } from "@tanstack/react-query";
// import { fetchCategoriesByParent, type CategoryItem } from "../../services/categoryService";

// // Simple tree node type we use for the Antd Tree
// type TreeNode = {
//   key: string;
//   title: string;
//   children?: TreeNode[];
//   raw?: CategoryItem;
// };

// type Props = {
//   parentId?: string;
// };

// function buildTree(items: CategoryItem[]) {
//   const map = new Map<string, TreeNode>();

//   // Normalize items and build nodes
//   items.forEach((it) => {
//     if (!it || !it.id) return;
//     map.set(it.id, { key: it.id, title: it.name || it.code || it.id, raw: it, children: [] });
//   });

//   const roots: TreeNode[] = [];

//   // Attach children to parents
//   map.forEach((node) => {
//     const parentId = node.raw?.parentCategoryId;
//     // Guard: avoid self-parenting
//     if (parentId && parentId !== node.key && map.has(parentId)) {
//       const parent = map.get(parentId)!;
//       parent.children = parent.children || [];
//       parent.children.push(node);
//     } else {
//       // Parent doesn't exist in our map, so this is a root
//       roots.push(node);
//     }
//   });

//   return roots;
// }

// export default function CategoryTree({ parentId = "08d6ff04-11c5-4e5b-a1c8-11ac167e849b" }: Props) {
// <<<<<<< HEAD
//   const { data, isLoading, error } = useQuery({
//     queryKey: ["categories", parentId],
//     queryFn: () => fetchCategoriesByParent(parentId),
//     staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
//   });
// =======
//   const { data, isLoading, error } = useQuery({ queryKey: ["categories", parentId], queryFn: () => fetchCategoriesByParent(parentId) });
// >>>>>>> main

//   // API may return nested tree or flat array — normalize to flat array
//   const items: CategoryItem[] = useMemo(() => {
//     if (!data) return [];
//     // if data is an object with productPrice or other props, bail
//     if (Array.isArray(data)) return data as CategoryItem[];
//     // if API returned { content: [...] }
//     if ((data as any).content && Array.isArray((data as any).content)) return (data as any).content;
//     // otherwise try to coerce
//     return Array.isArray(data) ? (data as CategoryItem[]) : [];
//   }, [data]);

//   const treeData = useMemo(() => buildTree(items), [items]);

//   if (isLoading) return <Spin />;
//   if (error) return <div className="text-sm text-red-600">Failed to load categories</div>;

//   if (treeData.length === 0) return <div className="text-sm text-gray-500">No categories found.</div>;

//   return (
//     <div>
//       <h3 className="text-lg font-semibold mb-2">Categories</h3>
//       <Tree treeData={treeData as any} defaultExpandAll />
//     </div>
//   );
// }
