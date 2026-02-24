import { createContext, useContext, useCallback, useState, type ReactNode } from "react";
import { App } from "antd";

// ── Types ───────────────────────────────────────────────────────────

export interface OrderLineItem {
  /** Unique variant ID or product ID */
  id: string;
  productId: string;
  productName: string;
  upc: string;
  /** Variant attribute values, e.g. { Size: "M", Color: "Red" } */
  variantAttributes: Record<string, string>;
  quantity: number;
  unitPrice: number;
  imageUrl?: string;
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

// ── Context ─────────────────────────────────────────────────────────

const OrderContext = createContext<OrderContextValue | null>(null);

export function OrderProvider({ children }: { children: ReactNode }) {
  const { message } = App.useApp();
  const [items, setItems] = useState<OrderLineItem[]>([]);

  const addItem = useCallback(
    (newItem: Omit<OrderLineItem, "quantity"> & { quantity: number }) => {
      if (newItem.quantity <= 0) return;
      setItems((prev) => {
        const existing = prev.find((li) => li.id === newItem.id);
        if (existing) {
          return prev.map((li) =>
            li.id === newItem.id
              ? { ...li, quantity: li.quantity + newItem.quantity, unitPrice: newItem.unitPrice }
              : li,
          );
        }
        return [...prev, newItem as OrderLineItem];
      });
      message.success({ content: `${newItem.quantity}× ${newItem.productName} added`, duration: 2 });
    },
    [message],
  );

  const addItems = useCallback(
    (newItems: Array<Omit<OrderLineItem, "quantity"> & { quantity: number }>) => {
      const valid = newItems.filter((i) => i.quantity > 0);
      if (valid.length === 0) return;

      setItems((prev) => {
        const next = [...prev];
        for (const item of valid) {
          const idx = next.findIndex((li) => li.id === item.id);
          if (idx >= 0) {
            next[idx] = { ...next[idx], quantity: next[idx].quantity + item.quantity, unitPrice: item.unitPrice };
          } else {
            next.push(item as OrderLineItem);
          }
        }
        return next;
      });

      const totalQty = valid.reduce((s, i) => s + i.quantity, 0);
      message.success({ content: `${totalQty} units across ${valid.length} variants added to order`, duration: 2 });
    },
    [message],
  );

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((li) => li.id !== id));
    } else {
      setItems((prev) => prev.map((li) => (li.id === id ? { ...li, quantity } : li)));
    }
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((li) => li.id !== id));
  }, []);

  const clearOrder = useCallback(() => setItems([]), []);

  const totalUnits = items.reduce((s, li) => s + li.quantity, 0);
  const totalValue = items.reduce((s, li) => s + li.quantity * li.unitPrice, 0);

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
