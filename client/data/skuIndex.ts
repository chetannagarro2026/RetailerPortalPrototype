import {
  catalogNodes,
  getAllProductsForNode,
  type CatalogProduct,
  type ProductVariant,
} from "./catalogData";

// ── Types ───────────────────────────────────────────────────────────

export interface UpcLookupResult {
  product: CatalogProduct;
  variant: ProductVariant;
  nodeId: string;
}

export interface SearchResult {
  product: CatalogProduct;
  nodeId: string;
  matchType: "exact-upc" | "partial-upc" | "name" | "brand" | "attribute";
}

// ── Lazy-initialized caches ─────────────────────────────────────────

let _allProducts: Array<{ product: CatalogProduct; nodeId: string }> | null = null;
let _upcMap: Map<string, UpcLookupResult> | null = null;

function getLeafNodes() {
  return catalogNodes.filter((n) => n.productCount > 0);
}

function buildProductCache() {
  if (_allProducts) return _allProducts;
  const leaves = getLeafNodes();
  _allProducts = [];
  for (const node of leaves) {
    const products = getAllProductsForNode(node.id);
    for (const p of products) {
      _allProducts.push({ product: p, nodeId: node.id });
    }
  }
  return _allProducts;
}

function buildUpcMap(): Map<string, UpcLookupResult> {
  if (_upcMap) return _upcMap;
  _upcMap = new Map();
  const all = buildProductCache();
  for (const { product, nodeId } of all) {
    if (product.variants) {
      for (const v of product.variants) {
        _upcMap.set(v.upc.toUpperCase(), { product, variant: v, nodeId });
      }
    }
    // Also index the product-level UPC
    if (!_upcMap.has(product.upc.toUpperCase()) && product.variants?.[0]) {
      _upcMap.set(product.upc.toUpperCase(), {
        product,
        variant: product.variants[0],
        nodeId,
      });
    }
  }
  return _skuMap;
}

// ── Public API ──────────────────────────────────────────────────────

/** Find a specific variant by its exact UPC (case-insensitive) */
export function findVariantByUpc(upc: string): UpcLookupResult | null {
  const map = buildUpcMap();
  return map.get(upc.trim().toUpperCase()) || null;
}

/** Search products across the entire catalog by query */
export function searchCatalog(query: string, limit = 20): SearchResult[] {
  if (!query.trim()) return [];
  const q = query.trim().toUpperCase();
  const all = buildProductCache();
  const results: SearchResult[] = [];
  const seen = new Set<string>();

  // 1. Exact UPC match (highest priority)
  const upcMap = buildUpcMap();
  const exactMatch = upcMap.get(q);
  if (exactMatch && !seen.has(exactMatch.product.id)) {
    results.push({ product: exactMatch.product, nodeId: exactMatch.nodeId, matchType: "exact-upc" });
    seen.add(exactMatch.product.id);
  }

  // 2. Partial UPC match on product UPC
  for (const { product, nodeId } of all) {
    if (seen.has(product.id) || results.length >= limit) continue;
    if (product.upc.toUpperCase().includes(q)) {
      results.push({ product, nodeId, matchType: "partial-upc" });
      seen.add(product.id);
    }
  }

  // 3. Name match
  for (const { product, nodeId } of all) {
    if (seen.has(product.id) || results.length >= limit) continue;
    if (product.name.toUpperCase().includes(q)) {
      results.push({ product, nodeId, matchType: "name" });
      seen.add(product.id);
    }
  }

  // 4. Brand match
  for (const { product, nodeId } of all) {
    if (seen.has(product.id) || results.length >= limit) continue;
    if (product.brand?.toUpperCase().includes(q)) {
      results.push({ product, nodeId, matchType: "brand" });
      seen.add(product.id);
    }
  }

  // 5. Attribute match
  for (const { product, nodeId } of all) {
    if (seen.has(product.id) || results.length >= limit) continue;
    const attrMatch = product.primaryDisplayAttributes?.some(
      (a) => a.value.toUpperCase().includes(q) || a.label.toUpperCase().includes(q),
    );
    if (attrMatch) {
      results.push({ product, nodeId, matchType: "attribute" });
      seen.add(product.id);
    }
  }

  return results;
}
