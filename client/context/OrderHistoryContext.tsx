import { createContext, useContext, useCallback, useState, type ReactNode } from "react";

// ── Types ───────────────────────────────────────────────────────────

export interface SavedAddress {
  id: string;
  contactName: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  isDefault: boolean;
}

export interface PurchaseOrder {
  orderNumber: string;
  items: Array<{
    id: string;
    productId: string;
    productName: string;
    sku: string;
    variantAttributes: Record<string, string>;
    quantity: number;
    unitPrice: number;
    imageUrl?: string;
  }>;
  totalUnits: number;
  totalValue: number;
  shipping: Omit<SavedAddress, "id" | "isDefault">;
  paymentMethod: string;
  status: "Pending" | "Confirmed" | "Shipped" | "Delivered";
  submittedAt: string;
}

interface OrderHistoryContextValue {
  orders: PurchaseOrder[];
  addOrder: (order: PurchaseOrder) => void;
  addresses: SavedAddress[];
  defaultAddress: SavedAddress | null;
  addAddress: (addr: Omit<SavedAddress, "id">) => void;
  setDefaultAddress: (id: string) => void;
}

// ── Storage helpers ─────────────────────────────────────────────────

const ORDERS_KEY = "b2b_order_history";
const ADDRESSES_KEY = "b2b_saved_addresses";

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage full or unavailable
  }
}

// ── Default seed address ────────────────────────────────────────────

const SEED_ADDRESS: SavedAddress = {
  id: "addr-default",
  contactName: "Jane Cooper",
  companyName: "Acme Corp",
  address: "456 Commerce Blvd, Suite 200",
  city: "Chicago",
  state: "IL",
  zip: "60601",
  phone: "(312) 555-0199",
  isDefault: true,
};

function getInitialAddresses(): SavedAddress[] {
  const stored = loadFromStorage<SavedAddress[]>(ADDRESSES_KEY, []);
  if (stored.length > 0) return stored;
  saveToStorage(ADDRESSES_KEY, [SEED_ADDRESS]);
  return [SEED_ADDRESS];
}

// ── Context ─────────────────────────────────────────────────────────

const OrderHistoryContext = createContext<OrderHistoryContextValue | null>(null);

export function OrderHistoryProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<PurchaseOrder[]>(() =>
    loadFromStorage<PurchaseOrder[]>(ORDERS_KEY, []),
  );
  const [addresses, setAddresses] = useState<SavedAddress[]>(getInitialAddresses);

  const addOrder = useCallback((order: PurchaseOrder) => {
    setOrders((prev) => {
      const next = [order, ...prev];
      saveToStorage(ORDERS_KEY, next);
      return next;
    });
  }, []);

  const addAddress = useCallback((addr: Omit<SavedAddress, "id">) => {
    setAddresses((prev) => {
      const newAddr: SavedAddress = { ...addr, id: `addr-${Date.now()}` };
      let next = [...prev, newAddr];
      if (newAddr.isDefault) {
        next = next.map((a) => (a.id === newAddr.id ? a : { ...a, isDefault: false }));
      }
      saveToStorage(ADDRESSES_KEY, next);
      return next;
    });
  }, []);

  const setDefaultAddress = useCallback((id: string) => {
    setAddresses((prev) => {
      const next = prev.map((a) => ({ ...a, isDefault: a.id === id }));
      saveToStorage(ADDRESSES_KEY, next);
      return next;
    });
  }, []);

  const defaultAddress = addresses.find((a) => a.isDefault) || addresses[0] || null;

  return (
    <OrderHistoryContext.Provider
      value={{ orders, addOrder, addresses, defaultAddress, addAddress, setDefaultAddress }}
    >
      {children}
    </OrderHistoryContext.Provider>
  );
}

export function useOrderHistory(): OrderHistoryContextValue {
  const ctx = useContext(OrderHistoryContext);
  if (!ctx) throw new Error("useOrderHistory must be used inside <OrderHistoryProvider>");
  return ctx;
}
