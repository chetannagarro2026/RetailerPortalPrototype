import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CatalogNode } from "../data/catalogData";
import { apiConfig } from "../config/apiConfig";
import {
  fetchCategoriesByParent,
  buildCategoryTree,
  getNodeBySlugPath as getNodeBySlugPathUtil,
  getChildren as getChildrenUtil,
  getAncestors as getAncestorsUtil,
  getSlugPath as getSlugPathUtil,
  type CategoryTree,
} from "../services/categoryService";

// ── Enriched Node Type ─────────────────────────────────────────────
export interface EnrichedCatalogNode extends CatalogNode {
  /** Direct subcategory count */
  subcategoryCount: number;
  /** Total product count (aggregated from leaf categories) */
  totalProductCount: number;
  /** Product IDs at this node (if leaf) */
  productIds: string[];
}

export interface EnrichedCategoryTree {
  nodes: Map<string, EnrichedCatalogNode>;
  root: EnrichedCatalogNode;
}

// ── Context Value Type ─────────────────────────────────────────────
interface CategoryContextValue {
  /** The enriched category tree */
  tree: EnrichedCategoryTree | null;
  /** Loading state */
  isLoading: boolean;
  /** Error state */
  error: Error | null;
  /** Get a node by slug path */
  getNodeBySlugPath: (slugPath: string[]) => EnrichedCatalogNode | null;
  /** Get direct children of a node */
  getChildren: (nodeId: string) => EnrichedCatalogNode[];
  /** Get all ancestors of a node */
  getAncestors: (nodeId: string) => EnrichedCatalogNode[];
  /** Get slug path for a node */
  getSlugPath: (nodeId: string) => string[];
  /** Refresh the category tree */
  refresh: () => Promise<void>;
}

// ── Context ────────────────────────────────────────────────────────
const CategoryContext = createContext<CategoryContextValue | null>(null);

// ── Helper Functions ───────────────────────────────────────────────

/**
 * Calculate total product count for a node by aggregating from all descendant leaf nodes
 */
function calculateTotalProductCount(
  nodeId: string,
  nodes: Map<string, EnrichedCatalogNode>
): number {
  const node = nodes.get(nodeId);
  if (!node) return 0;

  // If this is a leaf node, return its product count
  if (!node.hasChildren) {
    return node.productIds.length;
  }

  // Otherwise, sum up all children's product counts
  // let total = node.productIds.length; // Include own products if any
  let total = 0;
  for (const child of nodes.values()) {
    if (child.parentId === nodeId) {
      total += calculateTotalProductCount(child.id, nodes);
    }
  }

  return total;
}

/**
 * Count direct subcategories of a node
 */
function countDirectSubcategories(
  nodeId: string,
  nodes: Map<string, EnrichedCatalogNode>
): number {
  let count = 0;
  for (const node of nodes.values()) {
    if (node.parentId === nodeId) {
      count++;
    }
  }
  return count;
}

/**
 * Build enriched category tree with subcategory counts and aggregated product counts
 */
function buildEnrichedTree(
  baseTree: CategoryTree,
  categories: Array<{ id: string; productIds: string[] }>
): EnrichedCategoryTree {
  const enrichedNodes = new Map<string, EnrichedCatalogNode>();
  
  // Create a map for quick product ID lookup
  const productIdsMap = new Map<string, string[]>();
  for (const cat of categories) {
    productIdsMap.set(cat.id, cat.productIds || []);
  }

  // First pass: Create enriched nodes with basic data
  for (const [id, node] of baseTree.nodes) {
    const enrichedNode: EnrichedCatalogNode = {
      ...node,
      subcategoryCount: 0,
      totalProductCount: 0,
      productIds: productIdsMap.get(id) || [],
    };
    enrichedNodes.set(id, enrichedNode);
  }

  // Second pass: Calculate subcategory counts
  for (const [id, node] of enrichedNodes) {
    node.subcategoryCount = countDirectSubcategories(id, enrichedNodes);
  }

  // Third pass: Calculate total product counts (bottom-up aggregation)
  for (const [id, node] of enrichedNodes) {
    node.totalProductCount = calculateTotalProductCount(id, enrichedNodes);
  }

  // Get enriched root
  const enrichedRoot = enrichedNodes.get("root")!;

  return {
    nodes: enrichedNodes,
    root: enrichedRoot,
  };
}

// ── Provider Component ─────────────────────────────────────────────
export function CategoryProvider({ children }: { children: ReactNode }) {
  const [tree, setTree] = useState<EnrichedCategoryTree | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const loadCategories = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const categories = await fetchCategoriesByParent(apiConfig.rootCategoryId);
      
      if (!categories || categories.length === 0) {
        throw new Error("No categories found");
      }

      // Build the base tree
      const baseTree = buildCategoryTree(categories, apiConfig.rootCategoryId);
      console.log("basetree", baseTree);
      
      
      // Enrich with additional data
      const enrichedTree = buildEnrichedTree(
        baseTree,
        categories.map((c) => ({ id: c.id, productIds: c.productIds }))
      );
        console.log("enrichedTree", enrichedTree);

      setTree(enrichedTree);
    } catch (err) {
      setError(err instanceof Error ? err : new Error("Failed to load categories"));
      console.error("Failed to load categories:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Helper functions that work with the enriched tree
  const getNodeBySlugPath = (slugPath: string[]): EnrichedCatalogNode | null => {
    if (!tree) return null;
    const node = getNodeBySlugPathUtil(tree as unknown as CategoryTree, slugPath);
    return node ? (tree.nodes.get(node.id) as EnrichedCatalogNode) : null;
  };

  const getChildren = (nodeId: string): EnrichedCatalogNode[] => {
    if (!tree) return [];
    const children = getChildrenUtil(tree as unknown as CategoryTree, nodeId);
    return children.map((c) => tree.nodes.get(c.id)!).filter(Boolean);
  };

  const getAncestors = (nodeId: string): EnrichedCatalogNode[] => {
    if (!tree) return [];
    const ancestors = getAncestorsUtil(tree as unknown as CategoryTree, nodeId);
    return ancestors.map((a) => tree.nodes.get(a.id)!).filter(Boolean);
  };

  const getSlugPath = (nodeId: string): string[] => {
    if (!tree) return [];
    return getSlugPathUtil(tree as unknown as CategoryTree, nodeId);
  };

  const value: CategoryContextValue = {
    tree,
    isLoading,
    error,
    getNodeBySlugPath,
    getChildren,
    getAncestors,
    getSlugPath,
    refresh: loadCategories,
  };

  return (
    <CategoryContext.Provider value={value}>
      {children}
    </CategoryContext.Provider>
  );
}

// ── Hook ───────────────────────────────────────────────────────────
export function useCategoryContext() {
  const context = useContext(CategoryContext);
  if (!context) {
    throw new Error("useCategoryContext must be used within a CategoryProvider");
  }
  return context;
}
