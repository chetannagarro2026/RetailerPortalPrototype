// ── Catalog Node Model ──────────────────────────────────────────────
export interface CatalogNode {
  id: string;
  parentId: string | null;
  slug: string;
  label: string;
  level: number;
  hasChildren: boolean;
  productCount: number;
  metadata?: Record<string, string>;
  filtersAvailable?: string[];
  /** Optional hero image URL for card display */
  heroImage?: string;
  /** Optional short description */
  description?: string;
  /** Optional badge label (e.g. "New", "Updated") */
  badge?: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  brandName: string;
  itemCode: string;
  wholesalePrice: number;
  imageUrl: string;
  badge?: "New" | "Bestseller" | "Limited";
  attributes: Record<string, string>;
}

// ── Engine Config ───────────────────────────────────────────────────
export interface CatalogConfig {
  /** Level at which the left tree sidebar first appears */
  treeVisibilityStartLevel: number;
  /** Max products per page */
  pageSize: number;
}

export const catalogConfig: CatalogConfig = {
  treeVisibilityStartLevel: 2,
  pageSize: 12,
};

// ── Mock Taxonomy Tree ──────────────────────────────────────────────
export const catalogNodes: CatalogNode[] = [
  // Level 0 — Root (virtual, not rendered as a card)
  { id: "root", parentId: null, slug: "", label: "Full Catalog", level: 0, hasChildren: true, productCount: 0 },

  // Level 1 — Primary Categories
  { id: "women", parentId: "root", slug: "women", label: "Women", level: 1, hasChildren: true, productCount: 0, heroImage: "https://images.pexels.com/photos/8031786/pexels-photo-8031786.jpeg?auto=compress&cs=tinysrgb&w=800", description: "Outerwear, dresses, tops, denim and more" },
  { id: "men", parentId: "root", slug: "men", label: "Men", level: 1, hasChildren: true, productCount: 0, heroImage: "https://images.pexels.com/photos/5264900/pexels-photo-5264900.jpeg?auto=compress&cs=tinysrgb&w=800", description: "Shirts, pants, suits, outerwear and activewear" },
  { id: "kids", parentId: "root", slug: "kids", label: "Kids", level: 1, hasChildren: true, productCount: 0, heroImage: "https://images.pexels.com/photos/7988715/pexels-photo-7988715.jpeg?auto=compress&cs=tinysrgb&w=800", description: "Boys, girls, baby & toddler collections", badge: "New" },
  { id: "accessories", parentId: "root", slug: "accessories", label: "Accessories", level: 1, hasChildren: true, productCount: 0, heroImage: "https://images.pexels.com/photos/1204464/pexels-photo-1204464.jpeg?auto=compress&cs=tinysrgb&w=800", description: "Bags, watches, jewelry and footwear" },
  { id: "entertainment", parentId: "root", slug: "entertainment", label: "Entertainment", level: 1, hasChildren: true, productCount: 0, heroImage: "https://images.pexels.com/photos/159400/television-camera-men-outdoors-ballgame-159400.jpeg?auto=compress&cs=tinysrgb&w=800", description: "Lifestyle, sports and heritage collections" },

  // Level 2 — Women subcategories
  { id: "w-outerwear", parentId: "women", slug: "outerwear", label: "Outerwear", level: 2, hasChildren: true, productCount: 42, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "w-dresses", parentId: "women", slug: "dresses", label: "Dresses", level: 2, hasChildren: true, productCount: 38, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "w-tops", parentId: "women", slug: "tops", label: "Tops & Blouses", level: 2, hasChildren: false, productCount: 56, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "w-denim", parentId: "women", slug: "denim", label: "Denim", level: 2, hasChildren: false, productCount: 31, filtersAvailable: ["brand", "size", "color", "price", "fit"] },
  { id: "w-knitwear", parentId: "women", slug: "knitwear", label: "Knitwear", level: 2, hasChildren: false, productCount: 24, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "w-activewear", parentId: "women", slug: "activewear", label: "Activewear", level: 2, hasChildren: false, productCount: 18, filtersAvailable: ["brand", "size", "color", "price"] },

  // Level 3 — Women > Outerwear
  { id: "w-o-jackets", parentId: "w-outerwear", slug: "jackets", label: "Jackets", level: 3, hasChildren: false, productCount: 22, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "w-o-coats", parentId: "w-outerwear", slug: "coats", label: "Coats", level: 3, hasChildren: false, productCount: 14, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "w-o-vests", parentId: "w-outerwear", slug: "vests", label: "Vests", level: 3, hasChildren: false, productCount: 6, filtersAvailable: ["brand", "size", "color", "price"] },

  // Level 3 — Women > Dresses
  { id: "w-d-casual", parentId: "w-dresses", slug: "casual", label: "Casual Dresses", level: 3, hasChildren: false, productCount: 20, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "w-d-formal", parentId: "w-dresses", slug: "formal", label: "Formal Dresses", level: 3, hasChildren: false, productCount: 18, filtersAvailable: ["brand", "size", "color", "price"] },

  // Level 2 — Men subcategories
  { id: "m-shirts", parentId: "men", slug: "shirts", label: "Shirts", level: 2, hasChildren: true, productCount: 48, filtersAvailable: ["brand", "size", "color", "price", "fit"] },
  { id: "m-pants", parentId: "men", slug: "pants", label: "Pants & Chinos", level: 2, hasChildren: false, productCount: 35, filtersAvailable: ["brand", "size", "color", "price", "fit"] },
  { id: "m-outerwear", parentId: "men", slug: "outerwear", label: "Outerwear", level: 2, hasChildren: false, productCount: 28, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "m-denim", parentId: "men", slug: "denim", label: "Denim", level: 2, hasChildren: false, productCount: 22, filtersAvailable: ["brand", "size", "color", "price", "fit"] },
  { id: "m-activewear", parentId: "men", slug: "activewear", label: "Activewear", level: 2, hasChildren: false, productCount: 16, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "m-suits", parentId: "men", slug: "suits", label: "Suits & Blazers", level: 2, hasChildren: false, productCount: 12, filtersAvailable: ["brand", "size", "color", "price"] },

  // Level 3 — Men > Shirts
  { id: "m-s-dress", parentId: "m-shirts", slug: "dress-shirts", label: "Dress Shirts", level: 3, hasChildren: false, productCount: 20, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "m-s-casual", parentId: "m-shirts", slug: "casual-shirts", label: "Casual Shirts", level: 3, hasChildren: false, productCount: 16, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "m-s-polo", parentId: "m-shirts", slug: "polo-shirts", label: "Polo Shirts", level: 3, hasChildren: false, productCount: 12, filtersAvailable: ["brand", "size", "color", "price"] },

  // Level 2 — Kids subcategories
  { id: "k-boys", parentId: "kids", slug: "boys", label: "Boys", level: 2, hasChildren: true, productCount: 40, filtersAvailable: ["brand", "size", "color", "price", "age"] },
  { id: "k-girls", parentId: "kids", slug: "girls", label: "Girls", level: 2, hasChildren: false, productCount: 36, filtersAvailable: ["brand", "size", "color", "price", "age"] },
  { id: "k-baby", parentId: "kids", slug: "baby", label: "Baby & Toddler", level: 2, hasChildren: false, productCount: 22, filtersAvailable: ["brand", "size", "color", "price", "age"] },

  // Level 3 — Kids > Boys
  { id: "k-b-tops", parentId: "k-boys", slug: "tops", label: "Tops", level: 3, hasChildren: false, productCount: 18, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "k-b-bottoms", parentId: "k-boys", slug: "bottoms", label: "Bottoms", level: 3, hasChildren: false, productCount: 14, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "k-b-outerwear", parentId: "k-boys", slug: "outerwear", label: "Outerwear", level: 3, hasChildren: false, productCount: 8, filtersAvailable: ["brand", "size", "color", "price"] },

  // Level 2 — Accessories subcategories
  { id: "a-bags", parentId: "accessories", slug: "bags", label: "Bags & Handbags", level: 2, hasChildren: false, productCount: 30, filtersAvailable: ["brand", "color", "price", "material"] },
  { id: "a-watches", parentId: "accessories", slug: "watches", label: "Watches", level: 2, hasChildren: false, productCount: 18, filtersAvailable: ["brand", "price", "material"] },
  { id: "a-jewelry", parentId: "accessories", slug: "jewelry", label: "Jewelry", level: 2, hasChildren: false, productCount: 14, filtersAvailable: ["brand", "price", "material"] },
  { id: "a-footwear", parentId: "accessories", slug: "footwear", label: "Footwear", level: 2, hasChildren: false, productCount: 26, filtersAvailable: ["brand", "size", "color", "price"] },

  // Level 2 — Entertainment subcategories
  { id: "e-lifestyle", parentId: "entertainment", slug: "lifestyle", label: "Lifestyle", level: 2, hasChildren: false, productCount: 20, filtersAvailable: ["brand", "price"] },
  { id: "e-sports", parentId: "entertainment", slug: "sports", label: "Sports & Outdoor", level: 2, hasChildren: false, productCount: 15, filtersAvailable: ["brand", "price", "activity"] },
  { id: "e-heritage", parentId: "entertainment", slug: "heritage", label: "Heritage", level: 2, hasChildren: false, productCount: 10, filtersAvailable: ["brand", "price"] },
];

// ── Helper Functions ────────────────────────────────────────────────

export function getNodeBySlugPath(slugPath: string[]): CatalogNode | null {
  if (slugPath.length === 0) return catalogNodes.find((n) => n.id === "root") || null;

  let currentParentId = "root";
  let found: CatalogNode | null = null;

  for (const slug of slugPath) {
    found = catalogNodes.find((n) => n.parentId === currentParentId && n.slug === slug) || null;
    if (!found) return null;
    currentParentId = found.id;
  }
  return found;
}

export function getChildren(nodeId: string): CatalogNode[] {
  return catalogNodes.filter((n) => n.parentId === nodeId);
}

export function getAncestors(nodeId: string): CatalogNode[] {
  const ancestors: CatalogNode[] = [];
  let current = catalogNodes.find((n) => n.id === nodeId);
  while (current && current.parentId) {
    const parent = catalogNodes.find((n) => n.id === current!.parentId);
    if (parent) ancestors.unshift(parent);
    current = parent;
  }
  return ancestors;
}

export function getSlugPath(nodeId: string): string[] {
  const ancestors = getAncestors(nodeId);
  const node = catalogNodes.find((n) => n.id === nodeId);
  if (!node) return [];
  return [...ancestors.filter((a) => a.level > 0).map((a) => a.slug), node.slug].filter(Boolean);
}

export function getSiblings(nodeId: string): CatalogNode[] {
  const node = catalogNodes.find((n) => n.id === nodeId);
  if (!node || !node.parentId) return [];
  return catalogNodes.filter((n) => n.parentId === node.parentId);
}

// ── Mock Products ───────────────────────────────────────────────────
const productImages = [
  "https://images.pexels.com/photos/4260394/pexels-photo-4260394.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/10952730/pexels-photo-10952730.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/7764611/pexels-photo-7764611.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/19354617/pexels-photo-19354617.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/15615051/pexels-photo-15615051.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/27992044/pexels-photo-27992044.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/30229957/pexels-photo-30229957.jpeg?auto=compress&cs=tinysrgb&w=600",
  "https://images.pexels.com/photos/7256158/pexels-photo-7256158.jpeg?auto=compress&cs=tinysrgb&w=600",
];

const brandNames = ["Calvin Klein", "Tommy Hilfiger", "IZOD", "Buffalo David Bitton", "Nautica", "Arrow", "Jessica Simpson", "Joe's Jeans", "Frye", "Hervé Léger"];
const badges: (CatalogProduct["badge"] | undefined)[] = [undefined, "New", "Bestseller", undefined, "Limited", undefined, "New", undefined];

export function getProductsForNode(nodeId: string, page: number, pageSize: number): { products: CatalogProduct[]; total: number } {
  const node = catalogNodes.find((n) => n.id === nodeId);
  if (!node) return { products: [], total: 0 };

  const total = node.productCount || 12;
  const start = (page - 1) * pageSize;
  const count = Math.min(pageSize, total - start);
  if (count <= 0) return { products: [], total };

  const products: CatalogProduct[] = Array.from({ length: count }, (_, i) => {
    const idx = start + i;
    const brand = brandNames[idx % brandNames.length];
    return {
      id: `${nodeId}-p${idx}`,
      name: `${node.label} Style ${idx + 1}`,
      brandName: brand,
      itemCode: `${node.slug.toUpperCase().slice(0, 3)}-FT26-${String(100 + idx).padStart(3, "0")}`,
      wholesalePrice: 28 + ((idx * 17) % 120),
      imageUrl: productImages[idx % productImages.length],
      badge: badges[idx % badges.length],
      attributes: { brand, category: node.label },
    };
  });

  return { products, total };
}
