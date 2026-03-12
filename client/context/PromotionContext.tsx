import { createContext, useContext, useCallback, useState, type ReactNode } from "react";
import type { PromotionInfo } from "../data/catalogData";

interface AppliedPromotion {
  variantId: string;
  promotion: PromotionInfo;
}

interface PromotionContextValue {
  /** Map of variantId → applied PromotionInfo */
  appliedPromotions: Record<string, PromotionInfo>;
  /** Apply a promotion to a specific variant */
  applyPromotion: (variantId: string, promotion: PromotionInfo) => void;
  /** Remove applied promotion from a variant */
  removePromotion: (variantId: string) => void;
  /** Get the applied promotion for a variant (if any) */
  getAppliedPromotion: (variantId: string) => PromotionInfo | undefined;
  /** Compute the final price for a variant given its base price and applied promo */
  computeFinalPrice: (variantId: string, basePrice: number) => number;
  /** Compute savings per unit for a variant */
  computeSavingsPerUnit: (variantId: string, basePrice: number) => number;
}

const PromotionContext = createContext<PromotionContextValue | null>(null);

export function PromotionProvider({ children }: { children: ReactNode }) {
  const [applied, setApplied] = useState<Record<string, PromotionInfo>>({});

  const applyPromotion = useCallback((variantId: string, promotion: PromotionInfo) => {
    setApplied((prev) => ({ ...prev, [variantId]: promotion }));
  }, []);

  const removePromotion = useCallback((variantId: string) => {
    setApplied((prev) => {
      const next = { ...prev };
      delete next[variantId];
      return next;
    });
  }, []);

  const getAppliedPromotion = useCallback(
    (variantId: string) => applied[variantId],
    [applied],
  );

  const computeFinalPriceFn = useCallback(
    (variantId: string, basePrice: number): number => {
      const promo = applied[variantId];
      if (!promo) return basePrice;
      if (promo.type === "discount" && promo.discountPercent) {
        return Math.round(basePrice * (1 - promo.discountPercent / 100) * 100) / 100;
      }
      // For BOGO/free-goods, the unit price doesn't change — free items are separate
      return basePrice;
    },
    [applied],
  );

  const computeSavingsPerUnit = useCallback(
    (variantId: string, basePrice: number): number => {
      const promo = applied[variantId];
      if (!promo) return 0;
      if (promo.type === "discount" && promo.discountPercent) {
        return Math.round(basePrice * (promo.discountPercent / 100) * 100) / 100;
      }
      if ((promo.type === "bogo" || promo.type === "free-goods") && promo.freeQty && promo.qualifyingQty) {
        // Effective discount: freeQty / (qualifyingQty + freeQty)
        const effectiveDiscount = promo.freeQty / (promo.qualifyingQty + promo.freeQty);
        return Math.round(basePrice * effectiveDiscount * 100) / 100;
      }
      return 0;
    },
    [applied],
  );

  return (
    <PromotionContext.Provider
      value={{
        appliedPromotions: applied,
        applyPromotion,
        removePromotion,
        getAppliedPromotion,
        computeFinalPrice: computeFinalPriceFn,
        computeSavingsPerUnit,
      }}
    >
      {children}
    </PromotionContext.Provider>
  );
}

export function usePromotions(): PromotionContextValue {
  const ctx = useContext(PromotionContext);
  if (!ctx) throw new Error("usePromotions must be used inside <PromotionProvider>");
  return ctx;
}

/** Helper: get promotions available for a specific variant */
export function getVariantPromotions(
  variantId: string,
  product: { promotions?: PromotionInfo[] },
): PromotionInfo[] {
  const promos = product.promotions || [];
  return promos.filter((p) => {
    if (!p.eligibleVariantIds) return true; // family-wide
    return p.eligibleVariantIds.includes(variantId);
  });
}

/** Helper: count total unique promotions across all variants in a product */
export function countProductPromotions(product: { promotions?: PromotionInfo[] }): number {
  return (product.promotions || []).length;
}
