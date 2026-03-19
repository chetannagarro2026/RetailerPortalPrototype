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

// ── Promotion Evaluation ────────────────────────────────────────────

export interface EvaluatedPromotion {
  promotion: import("../data/catalogData").PromotionInfo;
  monetaryValue: number;
  /** For BXGY: how many free units the buyer earns */
  freeUnits: number;
  label: string;
}

/**
 * Evaluate all promotions for a product/SKU and return the best one.
 * Returns null if no promotion qualifies.
 */
export function evaluateBestPromotion(
  promotions: import("../data/catalogData").PromotionInfo[],
  quantity: number,
  unitPrice: number,
  variantId?: string,
): EvaluatedPromotion | null {
  if (!promotions || promotions.length === 0 || quantity <= 0) return null;

  const now = new Date();
  const candidates: EvaluatedPromotion[] = [];

  for (const promo of promotions) {
    // Filter: minQty
    if (promo.minQty && quantity < promo.minQty) continue;

    // Filter: validity window
    if (promo.validFrom && new Date(promo.validFrom) > now) continue;
    if (promo.validTo && new Date(promo.validTo) < now) continue;

    // Filter: eligible variants
    if (promo.eligibleVariantIds && variantId && !promo.eligibleVariantIds.includes(variantId)) continue;

    // Calculate monetary value
    let monetaryValue = 0;
    let freeUnits = 0;

    switch (promo.type) {
      case "discount": {
        const pct = promo.discountPercent ?? 0;
        monetaryValue = unitPrice * quantity * (pct / 100);
        break;
      }
      case "bogo":
      case "free-goods": {
        const qualQty = promo.qualifyingQty ?? 1;
        const freeQty = promo.freeQty ?? 1;
        freeUnits = Math.floor(quantity / qualQty) * freeQty;
        monetaryValue = freeUnits * unitPrice;
        break;
      }
    }

    if (monetaryValue > 0) {
      candidates.push({ promotion: promo, monetaryValue, freeUnits, label: promo.label });
    }
  }

  if (candidates.length === 0) return null;

  // Pick highest monetary value
  candidates.sort((a, b) => b.monetaryValue - a.monetaryValue);
  return candidates[0];
}

export function formatCurrency(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

/** Count total promotions available for a product family */
export function countProductPromotions(product: CatalogProduct): number {
  return (product.promotions || []).length;
}

/** Get up to N promotion labels for tooltip display */
export function getProductPromotionLabels(product: CatalogProduct, max = 3): string[] {
  return (product.promotions || []).slice(0, max).map((p) => p.label);
}
