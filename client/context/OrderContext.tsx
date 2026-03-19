import { createContext, useContext, useCallback, useState, useRef, type ReactNode } from "react";
import { App } from "antd";
import { getProductById } from "../data/catalogData";
import { evaluateBestPromotion } from "../utils/pricing";

// ── Types ───────────────────────────────────────────────────────────

export interface OrderLineItem {
  /** Unique variant ID or product ID */
  id: string;
  productId: string;
  productName: string;
  sku: string;
  /** Variant attribute values, e.g. { Size: "M", Color: "Red" } */
  variantAttributes: Record<string, string>;
  quantity: number;
  unitPrice: number;
  /** Original list price before any discounts */
  listPrice?: number;
  /** Negotiated special price (before promotion) */
  specialPrice?: number;
  /** Promotion label applied to this item */
  promotionLabel?: string;
  /** Whether this is a free item from a BOGO promotion */
  isFreeItem?: boolean;
  imageUrl?: string;
  /** ID of the parent line item that generated this free goods row */
  parentLineId?: string;
}

interface OrderContextValue {
  items: OrderLineItem[];
  /** Add or update a line item (deduplicates by id) */
  addItem: (item: Omit<OrderLineItem, "quantity"> & { quantity: number }) => void;
  /** Add multiple items at once */
  addItems: (items: Array<Omit<OrderLineItem, "quantity"> & { quantity: number }>) => void;
  /** Update quantity for a specific line item */
  updateQuantity: (id: string, quantity: number) => void;
  /** Remove a line item */
  removeItem: (id: string) => void;
  /** Clear all items */
  clearOrder: () => void;
  /** Total number of units across all line items */
  totalUnits: number;
  /** Total value of the order */
  totalValue: number;
  /** Number of distinct line items */
  lineCount: number;
}

// ── Helpers ─────────────────────────────────────────────────────────

/** Re-evaluate promotions for all items and manage free goods rows */
function applyPromotions(items: OrderLineItem[]): OrderLineItem[] {
  // Separate real items from free goods
  const realItems = items.filter((i) => !i.isFreeItem);
  const result: OrderLineItem[] = [];

  for (const item of realItems) {
    const product = getProductById(item.productId);
    const promotions = product?.promotions ?? [];

    const best = evaluateBestPromotion(promotions, item.quantity, item.listPrice ?? item.unitPrice, item.id);

    if (best) {
      // Apply promo label to the line item
      const updatedItem: OrderLineItem = {
        ...item,
        promotionLabel: best.label,
        // For discount promos, adjust unitPrice
        unitPrice:
          best.promotion.type === "discount" && best.promotion.discountPercent
            ? Math.round((item.listPrice ?? item.unitPrice) * (1 - best.promotion.discountPercent / 100) * 100) / 100
            : item.unitPrice,
      };
      result.push(updatedItem);

      // For BXGY: insert or update free goods row
      if (best.freeUnits > 0 && (best.promotion.type === "free-goods" || best.promotion.type === "bogo")) {
        result.push({
          id: `${item.id}__free`,
          productId: item.productId,
          productName: item.productName,
          sku: item.sku,
          variantAttributes: item.variantAttributes,
          quantity: best.freeUnits,
          unitPrice: 0,
          listPrice: item.listPrice ?? item.unitPrice,
          promotionLabel: best.label,
          isFreeItem: true,
          imageUrl: item.imageUrl,
          parentLineId: item.id,
        });
      }
    } else {
      // No promo qualifies — restore original price, clear label
      result.push({
        ...item,
        promotionLabel: undefined,
        unitPrice: item.specialPrice ?? item.listPrice ?? item.unitPrice,
      });
    }
  }

  return result;
}

// ── Context ─────────────────────────────────────────────────────────

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { message } = App.useApp();
  const [items, setItems] = useState<OrderLineItem[]>([]);
  const prevPromoMapRef = useRef<Map<string, string | undefined>>(new Map());

  /** Notify user about promo changes via toast */
  const notifyPromoChanges = useCallback(
    (prevItems: OrderLineItem[], nextItems: OrderLineItem[]) => {
      const prevMap = new Map(prevItems.filter((i) => !i.isFreeItem).map((i) => [i.id, i.promotionLabel]));
      for (const item of nextItems) {
        if (item.isFreeItem) continue;
        const prevLabel = prevMap.get(item.id);
        if (item.promotionLabel && !prevLabel) {
          message.success({ content: `${item.productName}: "${item.promotionLabel}" applied`, duration: 2.5 });
        } else if (!item.promotionLabel && prevLabel) {
          message.info({ content: `${item.productName}: promotion removed (no longer qualifies)`, duration: 2.5 });
        } else if (item.promotionLabel && prevLabel && item.promotionLabel !== prevLabel) {
          message.info({ content: `${item.productName}: switched to "${item.promotionLabel}"`, duration: 2.5 });
        }
      }
    },
    [message],
  );

  const addItem = useCallback(
    (newItem: Omit<OrderLineItem, "quantity"> & { quantity: number }) => {
      if (newItem.quantity <= 0) return;
      setItems((prev) => {
        let base: OrderLineItem[];
        const existing = prev.find((li) => li.id === newItem.id && !li.isFreeItem);
        if (existing) {
          base = prev
            .filter((li) => !li.isFreeItem) // strip old free goods to re-evaluate
            .map((li) =>
              li.id === newItem.id
                ? { ...li, quantity: li.quantity + newItem.quantity, unitPrice: newItem.listPrice ?? newItem.unitPrice ?? li.unitPrice }
                : li,
            );
        } else {
          base = [...prev.filter((li) => !li.isFreeItem), { ...newItem, unitPrice: newItem.listPrice ?? newItem.unitPrice } as OrderLineItem];
        }
        const next = applyPromotions(base);
        // Schedule toast outside of setState
        setTimeout(() => notifyPromoChanges(prev, next), 0);
        return next;
      });
      message.success({ content: `${newItem.quantity}× ${newItem.productName} added`, duration: 2 });
    },
    [message, notifyPromoChanges],
  );

  const addItems = useCallback(
    (newItems: Array<Omit<OrderLineItem, "quantity"> & { quantity: number }>) => {
      const valid = newItems.filter((i) => i.quantity > 0);
      if (valid.length === 0) return;

      setItems((prev) => {
        let base = prev.filter((li) => !li.isFreeItem);
        for (const item of valid) {
          const idx = base.findIndex((li) => li.id === item.id);
          if (idx >= 0) {
            base[idx] = { ...base[idx], quantity: base[idx].quantity + item.quantity, unitPrice: item.listPrice ?? item.unitPrice };
          } else {
            base = [...base, { ...item, unitPrice: item.listPrice ?? item.unitPrice } as OrderLineItem];
          }
        }
        const next = applyPromotions(base);
        setTimeout(() => notifyPromoChanges(prev, next), 0);
        return next;
      });

      const totalQty = valid.reduce((s, i) => s + i.quantity, 0);
      message.success({ content: `${totalQty} units across ${valid.length} variants added to order`, duration: 2 });
    },
    [message, notifyPromoChanges],
  );

  const updateQuantity = useCallback(
    (id: string, quantity: number) => {
      setItems((prev) => {
        if (quantity <= 0) {
          // Remove the item and its free goods
          const filtered = prev.filter((li) => li.id !== id && li.parentLineId !== id && !li.isFreeItem);
          return applyPromotions(filtered);
        }
        const base = prev
          .filter((li) => !li.isFreeItem)
          .map((li) => (li.id === id ? { ...li, quantity } : li));
        const next = applyPromotions(base);
        setTimeout(() => notifyPromoChanges(prev, next), 0);
        return next;
      });
    },
    [notifyPromoChanges],
  );

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const filtered = prev.filter((li) => li.id !== id && li.parentLineId !== id && !li.isFreeItem);
      return applyPromotions(filtered);
    });
  }, []);

  const clearOrder = useCallback(() => setItems([]), []);

  // Compute totals excluding free items
  const paidItems = items.filter((i) => !i.isFreeItem);
  const totalUnits = paidItems.reduce((s, li) => s + li.quantity, 0);
  const totalValue = paidItems.reduce((s, li) => s + li.quantity * li.unitPrice, 0);

  return (
    <OrderContext.Provider
      value={{
        items,
        addItem,
        addItems,
        updateQuantity,
        removeItem,
        clearOrder,
        totalUnits,
        totalValue,
        lineCount: items.length,
      }}
    >
      {children}
    </OrderContext.Provider>
  );
}

export function useOrder(): OrderContextValue {
  const ctx = useContext(OrderContext);
  if (!ctx) throw new Error("useOrder must be used inside <OrderProvider>");
  return ctx;
}
