// ── Catalog Node Model ──────────────────────────────────────────────
/** Dynamic label-value pair for industry-neutral meta display */
export interface MetaAttribute {
  label: string;
  value: string;
}

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
  /** Dynamic meta attributes for NodeCard display */
  metaAttributes?: MetaAttribute[];
}

/** A single pricing tier for volume/tier pricing */
export interface PriceTier {
  minQty: number;
  price: number;
}

/** Dynamic display attribute (industry-neutral) */
export interface DisplayAttribute {
  label: string;
  value: string;
}

export interface CatalogProduct {
  id: string;
  name: string;
  sku: string;
  imageUrl: string;
  price: number;
  /** Optional strike-through original price */
  originalPrice?: number;
  /** Dynamic badges — not hardcoded to specific types */
  badges?: Array<{ label: string; color?: string; bg?: string }>;
  /** Dynamic display attributes chosen per taxonomy config */
  primaryDisplayAttributes?: DisplayAttribute[];
  /** Availability status */
  availabilityStatus?: "in-stock" | "low-stock" | "out-of-stock" | "pre-order";
  /** Brand name (optional — not every industry uses brands) */
  brand?: string;
  /** Volume/tier pricing */
  tierPricing?: PriceTier[];
  /** Unit measure label (e.g. "per unit", "per case", "per meter") */
  unitMeasure?: string;
  /** Minimum order quantity */
  minOrderQty?: number;
  /** Case pack quantity (qty must be multiples of this) */
  casePackQty?: number;
  /** Catch-all attributes */
  attributes?: Record<string, string>;
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
  { id: "women", parentId: "root", slug: "women", label: "Women", level: 1, hasChildren: true, productCount: 0, heroImage: "https://images.pexels.com/photos/8031786/pexels-photo-8031786.jpeg?auto=compress&cs=tinysrgb&w=800", description: "Outerwear, dresses, tops, denim and more", metaAttributes: [{ label: "Brands", value: "14" }, { label: "SKUs", value: "209" }] },
  { id: "men", parentId: "root", slug: "men", label: "Men", level: 1, hasChildren: true, productCount: 0, heroImage: "https://images.pexels.com/photos/5264900/pexels-photo-5264900.jpeg?auto=compress&cs=tinysrgb&w=800", description: "Shirts, pants, suits, outerwear and activewear", metaAttributes: [{ label: "Brands", value: "12" }, { label: "SKUs", value: "161" }] },
  { id: "kids", parentId: "root", slug: "kids", label: "Kids", level: 1, hasChildren: true, productCount: 0, heroImage: "https://images.pexels.com/photos/7988715/pexels-photo-7988715.jpeg?auto=compress&cs=tinysrgb&w=800", description: "Boys, girls, baby & toddler collections", badge: "New", metaAttributes: [{ label: "Brands", value: "8" }, { label: "SKUs", value: "98" }] },
  { id: "accessories", parentId: "root", slug: "accessories", label: "Accessories", level: 1, hasChildren: true, productCount: 0, heroImage: "https://images.pexels.com/photos/1204464/pexels-photo-1204464.jpeg?auto=compress&cs=tinysrgb&w=800", description: "Bags, watches, jewelry and footwear", metaAttributes: [{ label: "Brands", value: "10" }, { label: "SKUs", value: "88" }] },
  { id: "entertainment", parentId: "root", slug: "entertainment", label: "Entertainment", level: 1, hasChildren: true, productCount: 0, heroImage: "https://images.pexels.com/photos/159400/television-camera-men-outdoors-ballgame-159400.jpeg?auto=compress&cs=tinysrgb&w=800", description: "Lifestyle, sports and heritage collections", metaAttributes: [{ label: "Brands", value: "6" }, { label: "SKUs", value: "45" }] },

  // Level 2 — Women subcategories
  { id: "w-outerwear", parentId: "women", slug: "outerwear", label: "Outerwear", level: 2, hasChildren: true, productCount: 42, filtersAvailable: ["brand", "size", "color", "price"], heroImage: "https://images.pexels.com/photos/7679725/pexels-photo-7679725.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "w-dresses", parentId: "women", slug: "dresses", label: "Dresses", level: 2, hasChildren: true, productCount: 38, filtersAvailable: ["brand", "size", "color", "price"], heroImage: "https://images.pexels.com/photos/5418888/pexels-photo-5418888.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "w-tops", parentId: "women", slug: "tops", label: "Tops & Blouses", level: 2, hasChildren: false, productCount: 56, filtersAvailable: ["brand", "size", "color", "price"], heroImage: "https://images.pexels.com/photos/27523237/pexels-photo-27523237.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "w-denim", parentId: "women", slug: "denim", label: "Denim", level: 2, hasChildren: false, productCount: 31, filtersAvailable: ["brand", "size", "color", "price", "fit"], heroImage: "https://images.pexels.com/photos/603022/pexels-photo-603022.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "w-knitwear", parentId: "women", slug: "knitwear", label: "Knitwear", level: 2, hasChildren: false, productCount: 24, filtersAvailable: ["brand", "size", "color", "price"], heroImage: "https://images.pexels.com/photos/45982/pexels-photo-45982.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "w-activewear", parentId: "women", slug: "activewear", label: "Activewear", level: 2, hasChildren: false, productCount: 18, filtersAvailable: ["brand", "size", "color", "price"], heroImage: "https://images.pexels.com/photos/6339395/pexels-photo-6339395.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Level 3 — Women > Outerwear
  { id: "w-o-jackets", parentId: "w-outerwear", slug: "jackets", label: "Jackets", level: 3, hasChildren: false, productCount: 22, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "w-o-coats", parentId: "w-outerwear", slug: "coats", label: "Coats", level: 3, hasChildren: false, productCount: 14, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "w-o-vests", parentId: "w-outerwear", slug: "vests", label: "Vests", level: 3, hasChildren: false, productCount: 6, filtersAvailable: ["brand", "size", "color", "price"] },

  // Level 3 — Women > Dresses
  { id: "w-d-casual", parentId: "w-dresses", slug: "casual", label: "Casual Dresses", level: 3, hasChildren: false, productCount: 20, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "w-d-formal", parentId: "w-dresses", slug: "formal", label: "Formal Dresses", level: 3, hasChildren: false, productCount: 18, filtersAvailable: ["brand", "size", "color", "price"] },

  // Level 2 — Men subcategories
  { id: "m-shirts", parentId: "men", slug: "shirts", label: "Shirts", level: 2, hasChildren: true, productCount: 48, filtersAvailable: ["brand", "size", "color", "price", "fit"], heroImage: "https://images.pexels.com/photos/3735633/pexels-photo-3735633.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "m-pants", parentId: "men", slug: "pants", label: "Pants & Chinos", level: 2, hasChildren: false, productCount: 35, filtersAvailable: ["brand", "size", "color", "price", "fit"], heroImage: "https://images.pexels.com/photos/19071478/pexels-photo-19071478.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "m-outerwear", parentId: "men", slug: "outerwear", label: "Outerwear", level: 2, hasChildren: false, productCount: 28, filtersAvailable: ["brand", "size", "color", "price"], heroImage: "https://images.pexels.com/photos/5424909/pexels-photo-5424909.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "m-denim", parentId: "men", slug: "denim", label: "Denim", level: 2, hasChildren: false, productCount: 22, filtersAvailable: ["brand", "size", "color", "price", "fit"], heroImage: "https://images.pexels.com/photos/603022/pexels-photo-603022.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "m-activewear", parentId: "men", slug: "activewear", label: "Activewear", level: 2, hasChildren: false, productCount: 16, filtersAvailable: ["brand", "size", "color", "price"], heroImage: "https://images.pexels.com/photos/28758135/pexels-photo-28758135.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "m-suits", parentId: "men", slug: "suits", label: "Suits & Blazers", level: 2, hasChildren: false, productCount: 12, filtersAvailable: ["brand", "size", "color", "price"], heroImage: "https://images.pexels.com/photos/2813515/pexels-photo-2813515.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Level 3 — Men > Shirts
  { id: "m-s-dress", parentId: "m-shirts", slug: "dress-shirts", label: "Dress Shirts", level: 3, hasChildren: false, productCount: 20, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "m-s-casual", parentId: "m-shirts", slug: "casual-shirts", label: "Casual Shirts", level: 3, hasChildren: false, productCount: 16, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "m-s-polo", parentId: "m-shirts", slug: "polo-shirts", label: "Polo Shirts", level: 3, hasChildren: false, productCount: 12, filtersAvailable: ["brand", "size", "color", "price"] },

  // Level 2 — Kids subcategories
  { id: "k-boys", parentId: "kids", slug: "boys", label: "Boys", level: 2, hasChildren: true, productCount: 40, filtersAvailable: ["brand", "size", "color", "price", "age"], heroImage: "https://images.pexels.com/photos/2998987/pexels-photo-2998987.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "k-girls", parentId: "kids", slug: "girls", label: "Girls", level: 2, hasChildren: false, productCount: 36, filtersAvailable: ["brand", "size", "color", "price", "age"], heroImage: "https://images.pexels.com/photos/7988715/pexels-photo-7988715.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "k-baby", parentId: "kids", slug: "baby", label: "Baby & Toddler", level: 2, hasChildren: false, productCount: 22, filtersAvailable: ["brand", "size", "color", "price", "age"], heroImage: "https://images.pexels.com/photos/34121886/pexels-photo-34121886.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Level 3 — Kids > Boys
  { id: "k-b-tops", parentId: "k-boys", slug: "tops", label: "Tops", level: 3, hasChildren: false, productCount: 18, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "k-b-bottoms", parentId: "k-boys", slug: "bottoms", label: "Bottoms", level: 3, hasChildren: false, productCount: 14, filtersAvailable: ["brand", "size", "color", "price"] },
  { id: "k-b-outerwear", parentId: "k-boys", slug: "outerwear", label: "Outerwear", level: 3, hasChildren: false, productCount: 8, filtersAvailable: ["brand", "size", "color", "price"] },

  // Level 2 — Accessories subcategories
  { id: "a-bags", parentId: "accessories", slug: "bags", label: "Bags & Handbags", level: 2, hasChildren: false, productCount: 30, filtersAvailable: ["brand", "color", "price", "material"], heroImage: "https://images.pexels.com/photos/9327162/pexels-photo-9327162.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "a-watches", parentId: "accessories", slug: "watches", label: "Watches", level: 2, hasChildren: false, productCount: 18, filtersAvailable: ["brand", "price", "material"], heroImage: "https://images.pexels.com/photos/33451773/pexels-photo-33451773.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "a-jewelry", parentId: "accessories", slug: "jewelry", label: "Jewelry", level: 2, hasChildren: false, productCount: 14, filtersAvailable: ["brand", "price", "material"], heroImage: "https://images.pexels.com/photos/5865384/pexels-photo-5865384.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "a-footwear", parentId: "accessories", slug: "footwear", label: "Footwear", level: 2, hasChildren: false, productCount: 26, filtersAvailable: ["brand", "size", "color", "price"], heroImage: "https://images.pexels.com/photos/5264896/pexels-photo-5264896.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Level 2 — Entertainment subcategories
  { id: "e-lifestyle", parentId: "entertainment", slug: "lifestyle", label: "Lifestyle", level: 2, hasChildren: false, productCount: 20, filtersAvailable: ["brand", "price"], heroImage: "https://images.pexels.com/photos/15124841/pexels-photo-15124841.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "e-sports", parentId: "entertainment", slug: "sports", label: "Sports & Outdoor", level: 2, hasChildren: false, productCount: 15, filtersAvailable: ["brand", "price", "activity"], heroImage: "https://images.pexels.com/photos/34087791/pexels-photo-34087791.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "e-heritage", parentId: "entertainment", slug: "heritage", label: "Heritage", level: 2, hasChildren: false, productCount: 10, filtersAvailable: ["brand", "price"], heroImage: "https://images.pexels.com/photos/175724/pexels-photo-175724.jpeg?auto=compress&cs=tinysrgb&w=600" },
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

// ── Category-Specific Product Images ────────────────────────────────
const categoryProductImages: Record<string, string[]> = {
  women: [
    "https://images.pexels.com/photos/21897127/pexels-photo-21897127.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/19289551/pexels-photo-19289551.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/18182283/pexels-photo-18182283.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/8801098/pexels-photo-8801098.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/2245035/pexels-photo-2245035.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/31443915/pexels-photo-31443915.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/20868118/pexels-photo-20868118.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/24847162/pexels-photo-24847162.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  men: [
    "https://images.pexels.com/photos/18153495/pexels-photo-18153495.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/23915302/pexels-photo-23915302.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/19566191/pexels-photo-19566191.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/10429317/pexels-photo-10429317.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/10004179/pexels-photo-10004179.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/29346389/pexels-photo-29346389.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/31438911/pexels-photo-31438911.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/7741187/pexels-photo-7741187.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  kids: [
    "https://images.pexels.com/photos/590498/pexels-photo-590498.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/18785376/pexels-photo-18785376.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/5791337/pexels-photo-5791337.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/34043973/pexels-photo-34043973.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/2998987/pexels-photo-2998987.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/7988715/pexels-photo-7988715.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  accessories: [
    "https://images.pexels.com/photos/29096397/pexels-photo-29096397.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/2373730/pexels-photo-2373730.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/4550884/pexels-photo-4550884.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/6540947/pexels-photo-6540947.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/22434773/pexels-photo-22434773.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/9327162/pexels-photo-9327162.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  entertainment: [
    "https://images.pexels.com/photos/7309739/pexels-photo-7309739.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/3892900/pexels-photo-3892900.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/4452399/pexels-photo-4452399.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/15124841/pexels-photo-15124841.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/175724/pexels-photo-175724.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/34087791/pexels-photo-34087791.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
};

const fallbackImages = categoryProductImages.women;

/** Resolves the Level-1 ancestor ID for any node to pick the right image pool */
function getCategoryImagePool(nodeId: string): string[] {
  const ancestors = getAncestors(nodeId);
  const level1 = ancestors.find((a) => a.level === 1);
  const key = level1?.id ?? nodeId;
  return categoryProductImages[key] || fallbackImages;
}

const brandNames = ["Calvin Klein", "Tommy Hilfiger", "IZOD", "Buffalo David Bitton", "Nautica", "Arrow", "Jessica Simpson", "Joe's Jeans", "Frye", "Hervé Léger"];
type BadgeEntry = { label: string; color?: string; bg?: string } | undefined;
const badges: BadgeEntry[] = [
  undefined,
  { label: "New", bg: "#EEF2FF", color: "#4338CA" },
  { label: "Bestseller", bg: "#F0FDF4", color: "#166534" },
  undefined,
  { label: "Limited Stock", bg: "#FFF7ED", color: "#9A3412" },
  undefined,
  { label: "New", bg: "#EEF2FF", color: "#4338CA" },
  undefined,
];

const displayAttrs: DisplayAttribute[][] = [
  [{ label: "Fit", value: "Regular" }, { label: "Fabric", value: "Cotton Blend" }],
  [{ label: "Fit", value: "Slim" }, { label: "Fabric", value: "100% Cotton" }],
  [{ label: "Fit", value: "Relaxed" }, { label: "Fabric", value: "Linen" }],
  [{ label: "Fit", value: "Oversized" }, { label: "Fabric", value: "Polyester" }],
];

export function getProductsForNode(nodeId: string, page: number, pageSize: number): { products: CatalogProduct[]; total: number } {
  const node = catalogNodes.find((n) => n.id === nodeId);
  if (!node) return { products: [], total: 0 };

  const total = node.productCount || 12;
  const start = (page - 1) * pageSize;
  const count = Math.min(pageSize, total - start);
  if (count <= 0) return { products: [], total };

  const images = getCategoryImagePool(nodeId);

  const products: CatalogProduct[] = Array.from({ length: count }, (_, i) => {
    const idx = start + i;
    const brand = brandNames[idx % brandNames.length];
    const basePrice = 28 + ((idx * 17) % 120);
    const badge = badges[idx % badges.length];
    return {
      id: `${nodeId}-p${idx}`,
      name: `${node.label} Style ${idx + 1}`,
      sku: `${node.slug.toUpperCase().slice(0, 3)}-FT26-${String(100 + idx).padStart(3, "0")}`,
      price: basePrice,
      originalPrice: idx % 5 === 0 ? Math.round(basePrice * 1.3) : undefined,
      imageUrl: images[idx % images.length],
      badges: badge ? [badge] : undefined,
      brand,
      primaryDisplayAttributes: displayAttrs[idx % displayAttrs.length],
      availabilityStatus: idx % 7 === 0 ? "low-stock" : "in-stock",
      tierPricing: idx % 4 === 0
        ? [{ minQty: 1, price: basePrice }, { minQty: 12, price: Math.round(basePrice * 0.9) }, { minQty: 48, price: Math.round(basePrice * 0.8) }]
        : undefined,
      unitMeasure: "per unit",
      minOrderQty: idx % 3 === 0 ? 6 : 1,
      casePackQty: idx % 5 === 0 ? 6 : undefined,
      attributes: { brand, category: node.label },
    };
  });

  return { products, total };
}
