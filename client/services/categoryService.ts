import { apiConfig } from "../config/apiConfig";
import { apiGet } from "./api";
import type { CatalogNode } from "../data/catalogData";

export type CategoryItem = {
  createdBy: string | null;
  createdOn: string | null;
  updatedBy: string | null;
  updatedOn: string | null;
  id: string;
  name: string;
  code: string;
  isActive: boolean | null;
  isDeleted: boolean | null;
  parentCategoryId: string | null;
  productIds: string[];
  leafNode: boolean;
  approvalStatus: string | null;
  labels: Record<string, string>;
  assetId: string | null;
  imageUrl: string | null;
};

export interface CategoryTree {
  nodes: Map<string, CatalogNode>;
  root: CatalogNode;
}

const imageBaseUrl = import.meta.env.VITE_PIM_IMAGE_BASE_URL || "https://ndomsdevstorageacc.blob.core.windows.net";

/**
 * Build a complete tree structure from API categories with calculated levels
 */
export function buildCategoryTree(categories: CategoryItem[], rootParentId: string): CategoryTree {
  const nodes = new Map<string, CatalogNode>();
  
  // First pass: Create all nodes
  categories.forEach(category => {
    const childCount = categories.filter(c => c.parentCategoryId === category.id).length;
    
    // Map categories with parentCategoryId === rootParentId to have parentId "root"
    const parentId = category.parentCategoryId === rootParentId ? "root" : category.parentCategoryId;
    
    const node: CatalogNode = {
      id: category.id,
      parentId: parentId,
      slug: category.code.toLowerCase(),
      label: category.name,
      level: 0, // Will be calculated below
      hasChildren: childCount > 0,
      productCount: category.productIds?.length || 0,
      heroImage: imageBaseUrl + category.imageUrl || undefined,
      description: category.labels?.en || undefined,
    };
    
    nodes.set(category.id, node);
  });
  
  // Second pass: Calculate levels
  const calculateLevel = (nodeId: string, visited = new Set<string>()): number => {
    if (visited.has(nodeId)) return 0; // Prevent infinite loops
    visited.add(nodeId);
    
    const node = nodes.get(nodeId);
    if (!node) return 0;
    
    if (node.parentId === rootParentId || !node.parentId) {
      return 1; // Direct children of root are level 1
    }
    
    const parent = nodes.get(node.parentId);
    if (!parent) return 1;
    
    return calculateLevel(node.parentId, visited) + 1;
  };
  
  // Update all node levels
  nodes.forEach((node, id) => {
    node.level = calculateLevel(id);
  });
  
  // Create virtual root node
  const root: CatalogNode = {
    id: "root",
    parentId: null,
    slug: "",
    label: "Full Catalog",
    level: 0,
    hasChildren: true,
    productCount: 0,
  };
  
  nodes.set("root", root);
  
  return { nodes, root };
}

/**
 * Find a node by traversing a slug path
 */
export function getNodeBySlugPath(tree: CategoryTree, slugPath: string[]): CatalogNode | null {
  if (slugPath.length === 0) return tree.root;
  
  let currentParentId = "root";
  let found: CatalogNode | null = null;
  
  for (const slug of slugPath) {
    found = null;
    for (const node of tree.nodes.values()) {
      if (node.parentId === currentParentId && node.slug === slug) {
        found = node;
        break;
      }
    }
    if (!found) return null;
    currentParentId = found.id;
  }
  
  return found;
}

/**
 * Get all direct children of a node
 */
export function getChildren(tree: CategoryTree, nodeId: string): CatalogNode[] {
  const children: CatalogNode[] = [];
  
  for (const node of tree.nodes.values()) {
    if (node.parentId === nodeId) {
      children.push(node);
    }
  }
  
  // Sort by label for consistent display
  return children.sort((a, b) => a.label.localeCompare(b.label));
}

/**
 * Get all ancestors of a node (from root to parent)
 */
export function getAncestors(tree: CategoryTree, nodeId: string): CatalogNode[] {
  const ancestors: CatalogNode[] = [];
  let current = tree.nodes.get(nodeId);
  
  while (current && current.parentId) {
    const parent = tree.nodes.get(current.parentId);
    if (parent) {
      ancestors.unshift(parent);
    }
    current = parent;
  }
  
  return ancestors;
}

/**
 * Get slug path for a node (for building URLs)
 */
export function getSlugPath(tree: CategoryTree, nodeId: string): string[] {
  const ancestors = getAncestors(tree, nodeId);
  const node = tree.nodes.get(nodeId);
  if (!node) return [];
  
  return [
    ...ancestors.filter((a) => a.level > 0).map((a) => a.slug),
    node.slug
  ].filter(Boolean);
}

/**
 * Fetch categories under a parent id. The API may return a flat list; UI builds tree.
 */
export function fetchCategoriesByParent(parentId: string) {
  const endpoint = apiConfig.endpoints.categoriesTreeByParent(parentId);
  return apiGet<CategoryItem[]>(endpoint);
}
