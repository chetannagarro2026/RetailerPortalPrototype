import type { CatalogProduct, ProductVariant, PriceTier } from "../data/catalogData";

// ── Promotion Data Types ────────────────────────────────────────────

export interface PromotionInfo {
  label: string;
  /** Discount percentage (e.g. 10 for 10% OFF) — undefined for BOGO-type promos */
  discountPercent?: number;
  /** For BOGO: free quantity per qualifying quantity */
  freeQty?: number;
  /** For BOGO: qualifying quantity */
  qualifyingQty?: number;
  /** Min quantity required to activate */
  minQty?: number;
  /** Validity period */
  validFrom?: string;
  validTo?: string;
  /** Scope: "sku" or "family" */
  scope?: "sku" | "family";
}

// ── Pricing Resolution ──────────────────────────────────────────────

export interface ResolvedPricing {
  listPrice: number;
  specialPrice?: number;
  finalPrice: number;
  promotionLabel?: string;
  promotionInfo?: PromotionInfo;
  savings: number;
  savingsPercent: number;
  hasSpecialPrice: boolean;
  hasPromotion: boolean;
}

/** Resolve the effective pricing for a product or variant */
export function resolveProductPricing(product: CatalogProduct): ResolvedPricing {
  const listPrice = product.price;
  const specialPrice = product.specialPrice;
  const finalPrice = product.finalPrice ?? specialPrice ?? listPrice;
  const promotionLabel = product.promotionLabel;
  const promotionInfo = product.promotionInfo;

  const savings = listPrice - finalPrice;
  const savingsPercent = listPrice > 0 ? Math.round((savings / listPrice) * 100) : 0;

  return {
    listPrice,
    specialPrice,
    finalPrice,
    promotionLabel,
    promotionInfo,
    savings,
    savingsPercent,
    hasSpecialPrice: specialPrice !== undefined && specialPrice < listPrice,
    hasPromotion: !!promotionLabel,
  };
}

export function resolveVariantPricing(variant: ProductVariant, product: CatalogProduct): ResolvedPricing {
  const listPrice = variant.price;
  const specialPrice = variant.specialPrice ?? product.specialPrice;
  const finalPrice = variant.finalPrice ?? (specialPrice ?? listPrice);
  const promotionLabel = variant.promotionLabel ?? product.promotionLabel;
  const promotionInfo = variant.promotionInfo ?? product.promotionInfo;

  const actualSpecial = specialPrice !== undefined && specialPrice < listPrice ? specialPrice : undefined;
  const savings = listPrice - finalPrice;
  const savingsPercent = listPrice > 0 ? Math.round((savings / listPrice) * 100) : 0;

  return {
    listPrice,
    specialPrice: actualSpecial,
    finalPrice,
    promotionLabel,
    promotionInfo,
    savings,
    savingsPercent,
    hasSpecialPrice: actualSpecial !== undefined,
    hasPromotion: !!promotionLabel,
  };
}

/** Get final price range across all variants (for family card/table) */
export function getFinalPriceRange(product: CatalogProduct, isAuthenticated: boolean): { min: number; max: number; hasOffers: boolean } {
  const variants = product.variants || [];
  if (variants.length === 0) {
    const p = isAuthenticated ? (product.finalPrice ?? product.specialPrice ?? product.price) : product.price;
    return { min: p, max: p, hasOffers: !!product.promotionLabel };
  }

  let min = Infinity;
  let max = -Infinity;
  let hasOffers = !!product.promotionLabel;

  for (const v of variants) {
    const price = isAuthenticated
      ? (v.finalPrice ?? v.specialPrice ?? v.price)
      : v.price;
    if (price < min) min = price;
    if (price > max) max = price;
    if (v.promotionLabel) hasOffers = true;
  }

  return { min, max, hasOffers };
}

/** Check if different SKUs in a family have mixed promotion states */
export function hasMixedPromotions(product: CatalogProduct): boolean {
  const variants = product.variants || [];
  if (variants.length === 0) return false;

  const withPromo = variants.filter((v) => v.promotionLabel || product.promotionLabel);
  return withPromo.length > 0 && withPromo.length < variants.length;
}

/** Apply promotion to tier pricing (volume pricing reflects final price after promo) */
export function getEffectiveTierPricing(
  tiers: PriceTier[] | undefined,
  specialPriceRatio: number | undefined,
  discountPercent: number | undefined,
): PriceTier[] | undefined {
  if (!tiers || tiers.length === 0) return undefined;
  if (!specialPriceRatio && !discountPercent) return tiers;

  return tiers.map((tier) => {
    let price = tier.price;
    if (specialPriceRatio) price = Math.round(price * specialPriceRatio * 100) / 100;
    if (discountPercent) price = Math.round(price * (1 - discountPercent / 100) * 100) / 100;
    return { ...tier, price };
  });
}

export function formatCurrency(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
