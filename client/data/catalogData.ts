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

/** Variant-defining attribute definition */
export interface VariantAttribute {
  name: string;        // e.g. "Size", "Color", "Voltage"
  values: string[];    // e.g. ["S", "M", "L", "XL"]
}

/** A single purchasable variant (one cell in the matrix) */
export interface ProductVariant {
  id: string;
  sku: string;
  /** Map of attribute name → value for this variant */
  attributes: Record<string, string>;
  price: number;
  availabilityStatus: "in-stock" | "low-stock" | "out-of-stock" | "pre-order";
  stockQty: number;
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
  /** Variant-defining attributes (determines matrix dimensions) */
  variantAttributes?: VariantAttribute[];
  /** All purchasable variants */
  variants?: ProductVariant[];
  /** Gallery images for PDP */
  galleryImages?: string[];
  /** Long description for PDP */
  description?: string;
  /** Specification key-value pairs */
  specifications?: Array<{ label: string; value: string }>;
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
  { id: "w-outerwear", parentId: "women", slug: "outerwear", label: "Outerwear", level: 2, hasChildren: true, productCount: 42, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/7679725/pexels-photo-7679725.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "w-dresses", parentId: "women", slug: "dresses", label: "Dresses", level: 2, hasChildren: true, productCount: 38, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/5418888/pexels-photo-5418888.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "w-tops", parentId: "women", slug: "tops", label: "Tops & Blouses", level: 2, hasChildren: false, productCount: 56, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/27523237/pexels-photo-27523237.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "w-denim", parentId: "women", slug: "denim", label: "Denim", level: 2, hasChildren: false, productCount: 31, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/2245035/pexels-photo-2245035.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "w-knitwear", parentId: "women", slug: "knitwear", label: "Knitwear", level: 2, hasChildren: false, productCount: 24, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/45982/pexels-photo-45982.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "w-activewear", parentId: "women", slug: "activewear", label: "Activewear", level: 2, hasChildren: false, productCount: 18, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/6339395/pexels-photo-6339395.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Level 3 — Women > Outerwear
  { id: "w-o-jackets", parentId: "w-outerwear", slug: "jackets", label: "Jackets", level: 3, hasChildren: false, productCount: 22, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/7871149/pexels-photo-7871149.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "w-o-coats", parentId: "w-outerwear", slug: "coats", label: "Coats", level: 3, hasChildren: false, productCount: 14, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/35114785/pexels-photo-35114785.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "w-o-vests", parentId: "w-outerwear", slug: "vests", label: "Vests", level: 3, hasChildren: false, productCount: 6, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/30603543/pexels-photo-30603543.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Level 3 — Women > Dresses
  { id: "w-d-casual", parentId: "w-dresses", slug: "casual", label: "Casual Dresses", level: 3, hasChildren: false, productCount: 20, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/3756941/pexels-photo-3756941.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "w-d-formal", parentId: "w-dresses", slug: "formal", label: "Formal Dresses", level: 3, hasChildren: false, productCount: 18, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/35511824/pexels-photo-35511824.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Level 2 — Men subcategories
  { id: "m-shirts", parentId: "men", slug: "shirts", label: "Shirts", level: 2, hasChildren: true, productCount: 48, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/3735633/pexels-photo-3735633.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "m-pants", parentId: "men", slug: "pants", label: "Pants & Chinos", level: 2, hasChildren: false, productCount: 35, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/19071478/pexels-photo-19071478.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "m-outerwear", parentId: "men", slug: "outerwear", label: "Outerwear", level: 2, hasChildren: false, productCount: 28, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/5424909/pexels-photo-5424909.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "m-denim", parentId: "men", slug: "denim", label: "Denim", level: 2, hasChildren: false, productCount: 22, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/7679722/pexels-photo-7679722.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "m-activewear", parentId: "men", slug: "activewear", label: "Activewear", level: 2, hasChildren: false, productCount: 16, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/28758135/pexels-photo-28758135.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "m-suits", parentId: "men", slug: "suits", label: "Suits & Blazers", level: 2, hasChildren: false, productCount: 12, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/2813515/pexels-photo-2813515.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Level 3 — Men > Shirts
  { id: "m-s-dress", parentId: "m-shirts", slug: "dress-shirts", label: "Dress Shirts", level: 3, hasChildren: false, productCount: 20, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/30875764/pexels-photo-30875764.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "m-s-casual", parentId: "m-shirts", slug: "casual-shirts", label: "Casual Shirts", level: 3, hasChildren: false, productCount: 16, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/5163400/pexels-photo-5163400.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "m-s-polo", parentId: "m-shirts", slug: "polo-shirts", label: "Polo Shirts", level: 3, hasChildren: false, productCount: 12, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/11751211/pexels-photo-11751211.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Level 2 — Kids subcategories
  { id: "k-boys", parentId: "kids", slug: "boys", label: "Boys", level: 2, hasChildren: true, productCount: 40, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/2998987/pexels-photo-2998987.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "k-girls", parentId: "kids", slug: "girls", label: "Girls", level: 2, hasChildren: false, productCount: 36, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/17086870/pexels-photo-17086870.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "k-baby", parentId: "kids", slug: "baby", label: "Baby & Toddler", level: 2, hasChildren: false, productCount: 22, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/34121886/pexels-photo-34121886.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Level 3 — Kids > Boys
  { id: "k-b-tops", parentId: "k-boys", slug: "tops", label: "Tops", level: 3, hasChildren: false, productCount: 18, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/16642458/pexels-photo-16642458.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "k-b-bottoms", parentId: "k-boys", slug: "bottoms", label: "Bottoms", level: 3, hasChildren: false, productCount: 14, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/15914001/pexels-photo-15914001.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "k-b-outerwear", parentId: "k-boys", slug: "outerwear", label: "Outerwear", level: 3, hasChildren: false, productCount: 8, filtersAvailable: ["brand", "fit", "fabric", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/10725439/pexels-photo-10725439.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Level 2 — Accessories subcategories
  { id: "a-bags", parentId: "accessories", slug: "bags", label: "Bags & Handbags", level: 2, hasChildren: false, productCount: 30, filtersAvailable: ["brand", "material", "style", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/9327162/pexels-photo-9327162.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "a-watches", parentId: "accessories", slug: "watches", label: "Watches", level: 2, hasChildren: false, productCount: 18, filtersAvailable: ["brand", "movement", "caseMaterial", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/33451773/pexels-photo-33451773.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "a-jewelry", parentId: "accessories", slug: "jewelry", label: "Jewelry", level: 2, hasChildren: false, productCount: 14, filtersAvailable: ["brand", "material", "stone", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/5865384/pexels-photo-5865384.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "a-footwear", parentId: "accessories", slug: "footwear", label: "Footwear", level: 2, hasChildren: false, productCount: 26, filtersAvailable: ["brand", "fit", "material", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/5264896/pexels-photo-5264896.jpeg?auto=compress&cs=tinysrgb&w=600" },

  // Level 2 — Entertainment subcategories
  { id: "e-lifestyle", parentId: "entertainment", slug: "lifestyle", label: "Lifestyle", level: 2, hasChildren: false, productCount: 20, filtersAvailable: ["brand", "type", "material", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/15124841/pexels-photo-15124841.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "e-sports", parentId: "entertainment", slug: "sports", label: "Sports & Outdoor", level: 2, hasChildren: false, productCount: 15, filtersAvailable: ["brand", "activity", "material", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/34087791/pexels-photo-34087791.jpeg?auto=compress&cs=tinysrgb&w=600" },
  { id: "e-heritage", parentId: "entertainment", slug: "heritage", label: "Heritage", level: 2, hasChildren: false, productCount: 10, filtersAvailable: ["brand", "era", "material", "price", "availability", "hasDiscount"], heroImage: "https://images.pexels.com/photos/175724/pexels-photo-175724.jpeg?auto=compress&cs=tinysrgb&w=600" },
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

// ── Subcategory-Specific Product Images ─────────────────────────────
// Each subcategory (Level 2) and leaf (Level 3) gets its own distinct image pool.
// Products always display images relevant to their specific subcategory.
const subcategoryProductImages: Record<string, string[]> = {
  // ── Women ─────────────────────────────────────────────────────────
  "w-outerwear": [
    "https://images.pexels.com/photos/16480587/pexels-photo-16480587.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/19289551/pexels-photo-19289551.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/20868118/pexels-photo-20868118.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/3393793/pexels-photo-3393793.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "w-dresses": [
    "https://images.pexels.com/photos/21897127/pexels-photo-21897127.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/18898990/pexels-photo-18898990.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/30418852/pexels-photo-30418852.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/24847162/pexels-photo-24847162.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "w-tops": [
    "https://images.pexels.com/photos/18182283/pexels-photo-18182283.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/24960096/pexels-photo-24960096.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/27523237/pexels-photo-27523237.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/31443915/pexels-photo-31443915.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "w-denim": [
    "https://images.pexels.com/photos/2245035/pexels-photo-2245035.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/31571020/pexels-photo-31571020.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/603022/pexels-photo-603022.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/10133274/pexels-photo-10133274.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "w-knitwear": [
    "https://images.pexels.com/photos/8801098/pexels-photo-8801098.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/14553511/pexels-photo-14553511.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/45982/pexels-photo-45982.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/20868118/pexels-photo-20868118.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "w-activewear": [
    "https://images.pexels.com/photos/31443915/pexels-photo-31443915.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/10112444/pexels-photo-10112444.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/6339395/pexels-photo-6339395.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/29346389/pexels-photo-29346389.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],

  // ── Men ───────────────────────────────────────────────────────────
  "m-shirts": [
    "https://images.pexels.com/photos/34913434/pexels-photo-34913434.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/7276000/pexels-photo-7276000.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/18153495/pexels-photo-18153495.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/31438911/pexels-photo-31438911.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "m-pants": [
    "https://images.pexels.com/photos/11990110/pexels-photo-11990110.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/19566191/pexels-photo-19566191.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/19071478/pexels-photo-19071478.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/23915302/pexels-photo-23915302.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "m-outerwear": [
    "https://images.pexels.com/photos/10429317/pexels-photo-10429317.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/20267215/pexels-photo-20267215.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/5424909/pexels-photo-5424909.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/7741187/pexels-photo-7741187.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "m-denim": [
    "https://images.pexels.com/photos/10004179/pexels-photo-10004179.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/10133274/pexels-photo-10133274.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/7679722/pexels-photo-7679722.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/603022/pexels-photo-603022.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "m-activewear": [
    "https://images.pexels.com/photos/29346389/pexels-photo-29346389.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/18359425/pexels-photo-18359425.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/28758135/pexels-photo-28758135.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/31443915/pexels-photo-31443915.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "m-suits": [
    "https://images.pexels.com/photos/23915302/pexels-photo-23915302.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/13939386/pexels-photo-13939386.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/2813515/pexels-photo-2813515.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/30875764/pexels-photo-30875764.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],

  // ── Kids ──────────────────────────────────────────────────────────
  "k-boys": [
    "https://images.pexels.com/photos/590498/pexels-photo-590498.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/16642458/pexels-photo-16642458.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/34043973/pexels-photo-34043973.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/10725439/pexels-photo-10725439.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "k-girls": [
    "https://images.pexels.com/photos/18785376/pexels-photo-18785376.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/17086870/pexels-photo-17086870.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/7988715/pexels-photo-7988715.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/2998987/pexels-photo-2998987.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "k-baby": [
    "https://images.pexels.com/photos/5791337/pexels-photo-5791337.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/34121886/pexels-photo-34121886.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/590498/pexels-photo-590498.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/34043973/pexels-photo-34043973.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],

  // ── Accessories ───────────────────────────────────────────────────
  "a-bags": [
    "https://images.pexels.com/photos/29096397/pexels-photo-29096397.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/22434773/pexels-photo-22434773.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/9327162/pexels-photo-9327162.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/1204464/pexels-photo-1204464.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "a-watches": [
    "https://images.pexels.com/photos/2373730/pexels-photo-2373730.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/31123762/pexels-photo-31123762.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/33451773/pexels-photo-33451773.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/2813515/pexels-photo-2813515.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "a-jewelry": [
    "https://images.pexels.com/photos/4550884/pexels-photo-4550884.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/5865384/pexels-photo-5865384.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/21897127/pexels-photo-21897127.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/1204464/pexels-photo-1204464.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "a-footwear": [
    "https://images.pexels.com/photos/6540947/pexels-photo-6540947.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/5264896/pexels-photo-5264896.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/19566191/pexels-photo-19566191.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/29096397/pexels-photo-29096397.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],

  // ── Entertainment ─────────────────────────────────────────────────
  "e-lifestyle": [
    "https://images.pexels.com/photos/7309739/pexels-photo-7309739.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/15124841/pexels-photo-15124841.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/4452399/pexels-photo-4452399.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/24847162/pexels-photo-24847162.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "e-sports": [
    "https://images.pexels.com/photos/3892900/pexels-photo-3892900.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/34087791/pexels-photo-34087791.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/29346389/pexels-photo-29346389.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/18359425/pexels-photo-18359425.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "e-heritage": [
    "https://images.pexels.com/photos/4452399/pexels-photo-4452399.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/175724/pexels-photo-175724.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/5865384/pexels-photo-5865384.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/31123762/pexels-photo-31123762.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],

  // ── Level 3: Women > Outerwear ────────────────────────────────────
  "w-o-jackets": [
    "https://images.pexels.com/photos/12544466/pexels-photo-12544466.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/26011846/pexels-photo-26011846.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/16480587/pexels-photo-16480587.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/7871149/pexels-photo-7871149.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "w-o-coats": [
    "https://images.pexels.com/photos/35114786/pexels-photo-35114786.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/5119921/pexels-photo-5119921.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/3393793/pexels-photo-3393793.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/35114785/pexels-photo-35114785.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "w-o-vests": [
    "https://images.pexels.com/photos/34329607/pexels-photo-34329607.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/17597081/pexels-photo-17597081.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/14688509/pexels-photo-14688509.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/30603543/pexels-photo-30603543.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],

  // ── Level 3: Women > Dresses ──────────────────────────────────────
  "w-d-casual": [
    "https://images.pexels.com/photos/1140908/pexels-photo-1140908.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/7627840/pexels-photo-7627840.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/35262853/pexels-photo-35262853.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/3756941/pexels-photo-3756941.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "w-d-formal": [
    "https://images.pexels.com/photos/16890870/pexels-photo-16890870.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/29886212/pexels-photo-29886212.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/14940765/pexels-photo-14940765.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/35511824/pexels-photo-35511824.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],

  // ── Level 3: Men > Shirts ─────────────────────────────────────────
  "m-s-dress": [
    "https://images.pexels.com/photos/161030/pexels-photo-161030.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/5083017/pexels-photo-5083017.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/3214788/pexels-photo-3214788.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/30875764/pexels-photo-30875764.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "m-s-casual": [
    "https://images.pexels.com/photos/4062841/pexels-photo-4062841.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/6995732/pexels-photo-6995732.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/17251247/pexels-photo-17251247.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/5163400/pexels-photo-5163400.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "m-s-polo": [
    "https://images.pexels.com/photos/17987934/pexels-photo-17987934.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/7648278/pexels-photo-7648278.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/28640734/pexels-photo-28640734.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/11751211/pexels-photo-11751211.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],

  // ── Level 3: Kids > Boys ──────────────────────────────────────────
  "k-b-tops": [
    "https://images.pexels.com/photos/9661972/pexels-photo-9661972.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/8385026/pexels-photo-8385026.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/5724960/pexels-photo-5724960.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/16642458/pexels-photo-16642458.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "k-b-bottoms": [
    "https://images.pexels.com/photos/5560019/pexels-photo-5560019.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/15179149/pexels-photo-15179149.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/1620753/pexels-photo-1620753.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/15914001/pexels-photo-15914001.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
  "k-b-outerwear": [
    "https://images.pexels.com/photos/15268261/pexels-photo-15268261.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/15237057/pexels-photo-15237057.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/7026778/pexels-photo-7026778.jpeg?auto=compress&cs=tinysrgb&w=600",
    "https://images.pexels.com/photos/10725439/pexels-photo-10725439.jpeg?auto=compress&cs=tinysrgb&w=600",
  ],
};

/**
 * Resolves the best image pool for a node:
 * 1. Exact match on nodeId (subcategory-specific)
 * 2. Parent node match (Level 3 inherits from Level 2 parent)
 * 3. Fallback to Level-1 generic pool
 */
function getCategoryImagePool(nodeId: string): string[] {
  // Direct match — subcategory has its own pool
  if (subcategoryProductImages[nodeId]) return subcategoryProductImages[nodeId];

  // Try parent (Level 3 nodes use parent Level 2 pool)
  const node = catalogNodes.find((n) => n.id === nodeId);
  if (node?.parentId && subcategoryProductImages[node.parentId]) {
    return subcategoryProductImages[node.parentId];
  }

  // Fallback: walk up to find any ancestor with a pool
  const ancestors = getAncestors(nodeId);
  for (let i = ancestors.length - 1; i >= 0; i--) {
    if (subcategoryProductImages[ancestors[i].id]) {
      return subcategoryProductImages[ancestors[i].id];
    }
  }

  return subcategoryProductImages["w-outerwear"]; // ultimate fallback
}

// ── Variant Attribute Pools (industry-neutral) ─────────────────────
const variantAttrPools: VariantAttribute[][] = [
  // 2D: Size × Color (apparel-style)
  [
    { name: "Size", values: ["XS", "S", "M", "L", "XL"] },
    { name: "Color", values: ["Black", "Navy", "White", "Red"] },
  ],
  // 1D: Size only
  [
    { name: "Size", values: ["S", "M", "L", "XL", "XXL"] },
  ],
  // 2D: Width × Length
  [
    { name: "Width", values: ["30", "32", "34", "36"] },
    { name: "Length", values: ["30", "32", "34"] },
  ],
  // 1D: Color only
  [
    { name: "Color", values: ["Black", "Brown", "Tan", "White", "Navy"] },
  ],
  // 3D: Size × Color × Pack Size
  [
    { name: "Size", values: ["S", "M", "L"] },
    { name: "Color", values: ["Black", "White"] },
    { name: "Pack Size", values: ["3-Pack", "6-Pack"] },
  ],
];

const specPools: Array<Array<{ label: string; value: string }>> = [
  [
    { label: "Material", value: "100% Cotton" },
    { label: "Weight", value: "180 GSM" },
    { label: "Care", value: "Machine wash cold" },
    { label: "Origin", value: "Imported" },
  ],
  [
    { label: "Material", value: "Cotton/Polyester Blend" },
    { label: "Weight", value: "220 GSM" },
    { label: "Care", value: "Dry clean recommended" },
    { label: "Origin", value: "Made in USA" },
  ],
  [
    { label: "Material", value: "Premium Leather" },
    { label: "Closure", value: "Zipper" },
    { label: "Lining", value: "Satin" },
    { label: "Origin", value: "Italy" },
  ],
];

/** Generate variants for a product based on its variant attributes */
function generateVariants(
  productId: string,
  skuPrefix: string,
  basePrice: number,
  attrs: VariantAttribute[],
): ProductVariant[] {
  const variants: ProductVariant[] = [];
  const dimensions = attrs.map((a) => a.values);

  function recurse(depth: number, combo: Record<string, string>) {
    if (depth === attrs.length) {
      const idx = variants.length;
      const priceMod = 1 + (idx % 5) * 0.02; // slight variation
      const stockVal = ((idx * 37 + 11) % 200);
      const status: ProductVariant["availabilityStatus"] =
        stockVal === 0 ? "out-of-stock" : stockVal < 15 ? "low-stock" : "in-stock";
      variants.push({
        id: `${productId}-v${idx}`,
        sku: `${skuPrefix}-${Object.values(combo).map((v) => v.replace(/\s+/g, "").slice(0, 3).toUpperCase()).join("-")}`,
        attributes: { ...combo },
        price: Math.round(basePrice * priceMod * 100) / 100,
        availabilityStatus: status,
        stockQty: stockVal,
      });
      return;
    }
    for (const val of dimensions[depth]) {
      recurse(depth + 1, { ...combo, [attrs[depth].name]: val });
    }
  }

  recurse(0, {});
  return variants;
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

// ── Category-Specific Display Attributes ────────────────────────────
// Each category gets attributes relevant to its domain.
// Clothing uses Fit+Fabric, Watches use Movement+Case Material, etc.

const categoryDisplayAttrs: Record<string, DisplayAttribute[][]> = {
  // ── Clothing (Women, Men, Kids) — Fit + Fabric ────────────────────
  "_clothing_default": [
    [{ label: "Fit", value: "Regular" }, { label: "Fabric", value: "Cotton Blend" }],
    [{ label: "Fit", value: "Slim" }, { label: "Fabric", value: "100% Cotton" }],
    [{ label: "Fit", value: "Relaxed" }, { label: "Fabric", value: "Linen" }],
    [{ label: "Fit", value: "Oversized" }, { label: "Fabric", value: "Polyester" }],
  ],
  // ── Bags & Handbags — Material + Style ─────────────────────────────
  "a-bags": [
    [{ label: "Material", value: "Leather" }, { label: "Style", value: "Tote" }],
    [{ label: "Material", value: "Canvas" }, { label: "Style", value: "Crossbody" }],
    [{ label: "Material", value: "Nylon" }, { label: "Style", value: "Backpack" }],
    [{ label: "Material", value: "Vegan Leather" }, { label: "Style", value: "Clutch" }],
  ],
  // ── Watches — Movement + Case Material ─────────────────────────────
  "a-watches": [
    [{ label: "Movement", value: "Automatic" }, { label: "Case Material", value: "Stainless Steel" }],
    [{ label: "Movement", value: "Quartz" }, { label: "Case Material", value: "Titanium" }],
    [{ label: "Movement", value: "Mechanical" }, { label: "Case Material", value: "Gold" }],
    [{ label: "Movement", value: "Solar" }, { label: "Case Material", value: "Ceramic" }],
  ],
  // ── Jewelry — Material + Stone ────────────────────────────────────
  "a-jewelry": [
    [{ label: "Material", value: "Gold" }, { label: "Stone", value: "Diamond" }],
    [{ label: "Material", value: "Silver" }, { label: "Stone", value: "Ruby" }],
    [{ label: "Material", value: "Platinum" }, { label: "Stone", value: "Sapphire" }],
    [{ label: "Material", value: "Rose Gold" }, { label: "Stone", value: "Emerald" }],
  ],
  // ── Footwear — Fit + Material ─────────────────────────────────────
  "a-footwear": [
    [{ label: "Fit", value: "Regular" }, { label: "Material", value: "Leather" }],
    [{ label: "Fit", value: "Wide" }, { label: "Material", value: "Suede" }],
    [{ label: "Fit", value: "Narrow" }, { label: "Material", value: "Canvas" }],
    [{ label: "Fit", value: "Regular" }, { label: "Material", value: "Synthetic" }],
  ],
  // ── Lifestyle — Type + Material ───────────────────────────────────
  "e-lifestyle": [
    [{ label: "Type", value: "Home Decor" }, { label: "Material", value: "Ceramic" }],
    [{ label: "Type", value: "Fragrance" }, { label: "Material", value: "Glass" }],
    [{ label: "Type", value: "Candle" }, { label: "Material", value: "Soy Wax" }],
    [{ label: "Type", value: "Stationery" }, { label: "Material", value: "Paper" }],
  ],
  // ── Sports & Outdoor — Activity + Material ────────────────────────
  "e-sports": [
    [{ label: "Activity", value: "Running" }, { label: "Material", value: "Polyester" }],
    [{ label: "Activity", value: "Yoga" }, { label: "Material", value: "Spandex" }],
    [{ label: "Activity", value: "Hiking" }, { label: "Material", value: "Nylon" }],
    [{ label: "Activity", value: "Swimming" }, { label: "Material", value: "Chlorine-Resistant" }],
  ],
  // ── Heritage — Era + Material ─────────────────────────────────────
  "e-heritage": [
    [{ label: "Era", value: "1920s" }, { label: "Material", value: "Silk" }],
    [{ label: "Era", value: "1950s" }, { label: "Material", value: "Wool" }],
    [{ label: "Era", value: "1970s" }, { label: "Material", value: "Leather" }],
    [{ label: "Era", value: "1990s" }, { label: "Material", value: "Denim" }],
  ],
};

/**
 * Resolves the display attribute pool for a given node.
 * Checks exact nodeId → parent → ancestors → clothing default.
 */
function getCategoryDisplayAttrs(nodeId: string): DisplayAttribute[][] {
  if (categoryDisplayAttrs[nodeId]) return categoryDisplayAttrs[nodeId];

  const node = catalogNodes.find((n) => n.id === nodeId);
  if (node?.parentId && categoryDisplayAttrs[node.parentId]) {
    return categoryDisplayAttrs[node.parentId];
  }

  const ancestors = getAncestors(nodeId);
  for (let i = ancestors.length - 1; i >= 0; i--) {
    if (categoryDisplayAttrs[ancestors[i].id]) {
      return categoryDisplayAttrs[ancestors[i].id];
    }
  }

  return categoryDisplayAttrs["_clothing_default"];
}

export function getProductsForNode(nodeId: string, page: number, pageSize: number): { products: CatalogProduct[]; total: number } {
  const node = catalogNodes.find((n) => n.id === nodeId);
  if (!node) return { products: [], total: 0 };

  const total = node.productCount || 12;
  const start = (page - 1) * pageSize;
  const count = Math.min(pageSize, total - start);
  if (count <= 0) return { products: [], total };

  const images = getCategoryImagePool(nodeId);
  const displayAttrs = getCategoryDisplayAttrs(nodeId);

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

      // Variant data — deterministic per product
      variantAttributes: variantAttrPools[idx % variantAttrPools.length],
      variants: generateVariants(
        `${nodeId}-p${idx}`,
        `${node.slug.toUpperCase().slice(0, 3)}-FT26-${String(100 + idx).padStart(3, "0")}`,
        basePrice,
        variantAttrPools[idx % variantAttrPools.length],
      ),
      galleryImages: [
        images[idx % images.length],
        images[(idx + 1) % images.length],
        images[(idx + 2) % images.length],
        images[(idx + 3) % images.length],
      ],
      description: `Premium quality ${node.label} piece from ${brand}. Crafted with attention to detail and built for lasting comfort and style. Part of the latest collection designed for the modern buyer.`,
      specifications: specPools[idx % specPools.length],
    };
  });

  return { products, total };
}

// ── Filter Attribute Registry ────────────────────────────────────────
// Defines how each attribute is used for filtering: type, label, filterable flag.

export type FilterType = "checkbox" | "range" | "boolean";

export interface FilterAttributeDef {
  key: string;
  label: string;
  filterType: FilterType;
  /** Extracts value(s) from a product for this filter */
  extract: (p: CatalogProduct) => string | string[] | number | undefined;
  isFilterable: boolean;
}

/** Registry of all filterable attributes — industry-neutral */
export const filterAttributeRegistry: FilterAttributeDef[] = [
  {
    key: "brand",
    label: "Brand",
    filterType: "checkbox",
    extract: (p) => p.brand,
    isFilterable: true,
  },
  {
    key: "fit",
    label: "Fit",
    filterType: "checkbox",
    extract: (p) => p.primaryDisplayAttributes?.find((a) => a.label === "Fit")?.value,
    isFilterable: true,
  },
  {
    key: "fabric",
    label: "Fabric",
    filterType: "checkbox",
    extract: (p) => p.primaryDisplayAttributes?.find((a) => a.label === "Fabric")?.value,
    isFilterable: true,
  },
  {
    key: "price",
    label: "Price",
    filterType: "range",
    extract: (p) => p.price,
    isFilterable: true,
  },
  {
    key: "availability",
    label: "Availability",
    filterType: "checkbox",
    extract: (p) => p.availabilityStatus || "in-stock",
    isFilterable: true,
  },
  {
    key: "hasDiscount",
    label: "On Sale",
    filterType: "boolean",
    extract: (p) => (p.originalPrice ? "true" : "false"),
    isFilterable: true,
  },
  // ── Category-Specific Filter Attributes ──────────────────────────
  {
    key: "material",
    label: "Material",
    filterType: "checkbox",
    extract: (p) => p.primaryDisplayAttributes?.find((a) => a.label === "Material")?.value,
    isFilterable: true,
  },
  {
    key: "movement",
    label: "Movement",
    filterType: "checkbox",
    extract: (p) => p.primaryDisplayAttributes?.find((a) => a.label === "Movement")?.value,
    isFilterable: true,
  },
  {
    key: "caseMaterial",
    label: "Case Material",
    filterType: "checkbox",
    extract: (p) => p.primaryDisplayAttributes?.find((a) => a.label === "Case Material")?.value,
    isFilterable: true,
  },
  {
    key: "style",
    label: "Style",
    filterType: "checkbox",
    extract: (p) => p.primaryDisplayAttributes?.find((a) => a.label === "Style")?.value,
    isFilterable: true,
  },
  {
    key: "stone",
    label: "Stone",
    filterType: "checkbox",
    extract: (p) => p.primaryDisplayAttributes?.find((a) => a.label === "Stone")?.value,
    isFilterable: true,
  },
  {
    key: "activity",
    label: "Activity",
    filterType: "checkbox",
    extract: (p) => p.primaryDisplayAttributes?.find((a) => a.label === "Activity")?.value,
    isFilterable: true,
  },
  {
    key: "type",
    label: "Type",
    filterType: "checkbox",
    extract: (p) => p.primaryDisplayAttributes?.find((a) => a.label === "Type")?.value,
    isFilterable: true,
  },
  {
    key: "era",
    label: "Era",
    filterType: "checkbox",
    extract: (p) => p.primaryDisplayAttributes?.find((a) => a.label === "Era")?.value,
    isFilterable: true,
  },
];

/** Get ALL products for a node (no pagination) — for filtering/sorting */
export function getAllProductsForNode(nodeId: string): CatalogProduct[] {
  const node = catalogNodes.find((n) => n.id === nodeId);
  if (!node) return [];

  const total = node.productCount || 12;
  const images = getCategoryImagePool(nodeId);
  const displayAttrs = getCategoryDisplayAttrs(nodeId);

  return Array.from({ length: total }, (_, i) => {
    const idx = i;
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
      availabilityStatus: (idx % 7 === 0 ? "low-stock" : "in-stock") as CatalogProduct["availabilityStatus"],
      tierPricing: idx % 4 === 0
        ? [{ minQty: 1, price: basePrice }, { minQty: 12, price: Math.round(basePrice * 0.9) }, { minQty: 48, price: Math.round(basePrice * 0.8) }]
        : undefined,
      unitMeasure: "per unit",
      minOrderQty: idx % 3 === 0 ? 6 : 1,
      casePackQty: idx % 5 === 0 ? 6 : undefined,
      attributes: { brand, category: node.label },
      variantAttributes: variantAttrPools[idx % variantAttrPools.length],
      variants: generateVariants(
        `${nodeId}-p${idx}`,
        `${node.slug.toUpperCase().slice(0, 3)}-FT26-${String(100 + idx).padStart(3, "0")}`,
        basePrice,
        variantAttrPools[idx % variantAttrPools.length],
      ),
      galleryImages: [
        images[idx % images.length],
        images[(idx + 1) % images.length],
        images[(idx + 2) % images.length],
        images[(idx + 3) % images.length],
      ],
      description: `Premium quality ${node.label} piece from ${brand}. Crafted with attention to detail and built for lasting comfort and style. Part of the latest collection designed for the modern buyer.`,
      specifications: specPools[idx % specPools.length],
    };
  });
}

/** Brand info for brand cards on the home page */
export interface BrandInfo {
  name: string;
  slug: string;
  skuCount: number;
  categoryCount: number;
  logoUrl?: string;
}

/** Get ALL products across the entire catalog (all leaf nodes) */
export function getAllCatalogProducts(): CatalogProduct[] {
  const leafNodes = catalogNodes.filter((n) => n.productCount > 0);
  const allProducts: CatalogProduct[] = [];
  for (const node of leafNodes) {
    const products = getAllProductsForNode(node.id);
    // Tag each product with its category for display in global/brand mode
    for (const p of products) {
      if (!p.attributes) p.attributes = {};
      p.attributes.category = node.label;
      // Store the node ID so we can resolve the category path later
      p.attributes._nodeId = node.id;
    }
    allProducts.push(...products);
  }
  return allProducts;
}

/** Brand logo URLs — maps brand name to a logo image */
const brandLogoUrls: Record<string, string> = {
  "Calvin Klein": "https://www.google.com/s2/favicons?domain=calvinklein.com&sz=128",
  "Tommy Hilfiger": "https://www.google.com/s2/favicons?domain=tommy.com&sz=128",
  "IZOD": "https://www.google.com/s2/favicons?domain=izod.com&sz=128",
  "Buffalo David Bitton": "https://www.google.com/s2/favicons?domain=buffalojeans.com&sz=128",
  "Nautica": "https://www.google.com/s2/favicons?domain=nautica.com&sz=128",
  "Arrow": "https://cdn.builder.io/api/v1/image/assets%2F0f4e56209ef24b2d922b97ec1205a84f%2F4839d9c7498b4ed7ad34a5f2c068ad0e",
  "Jessica Simpson": "https://cdn.builder.io/api/v1/file/assets%2F0f4e56209ef24b2d922b97ec1205a84f%2F39ce543361e24b3d9cfbd7f29d831e6b",
  "Joe's Jeans": "https://www.google.com/s2/favicons?domain=joesjeans.com&sz=128",
  "Frye": "https://www.google.com/s2/favicons?domain=thefryecompany.com&sz=128",
  "Hervé Léger": "https://www.google.com/s2/favicons?domain=herveleger.com&sz=128",
};

/** Get all unique brands with aggregate stats */
export function getAllBrands(): BrandInfo[] {
  const brandMap = new Map<string, { categories: Set<string>; skuCount: number }>();

  const leafNodes = catalogNodes.filter((n) => n.productCount > 0);
  for (const node of leafNodes) {
    const products = getAllProductsForNode(node.id);
    for (const p of products) {
      const brand = p.brand || "Unknown";
      if (!brandMap.has(brand)) {
        brandMap.set(brand, { categories: new Set(), skuCount: 0 });
      }
      const entry = brandMap.get(brand)!;
      entry.categories.add(node.label);
      entry.skuCount += (p.variants?.length || 1);
    }
  }

  return Array.from(brandMap.entries()).map(([name, data]) => ({
    name,
    slug: name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""),
    skuCount: data.skuCount,
    categoryCount: data.categories.size,
    logoUrl: brandLogoUrls[name],
  }));
}

/** Get the Level-1 category nodes (for global tree display) */
export function getLevel1Nodes(): CatalogNode[] {
  return catalogNodes.filter((n) => n.level === 1);
}

/** Get a single product by its ID */
export function getProductById(productId: string): CatalogProduct | null {
  // Parse nodeId from productId format: "nodeId-pN"
  const match = productId.match(/^(.+)-p(\d+)$/);
  if (!match) return null;
  const [, nodeId, indexStr] = match;
  const idx = parseInt(indexStr, 10);
  const node = catalogNodes.find((n) => n.id === nodeId);
  if (!node) return null;

  // Generate just this one product
  const { products } = getProductsForNode(nodeId, 1, node.productCount || 12);
  return products.find((p) => p.id === productId) || null;
}
