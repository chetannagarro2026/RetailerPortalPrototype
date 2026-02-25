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
  status: "Pending Credit Approval" | "Accepted" | "Processing" | "Delivered" | "Rejected" | "Pending" | "Confirmed" | "Shipped";
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

// ── Seed orders for demo ────────────────────────────────────────────

const SEED_ORDERS: PurchaseOrder[] = [
  {
    orderNumber: "PO-2026-0121",
    items: [{ id: "i1", productId: "p1", productName: "Arrow Oxford Shirt", sku: "ARW-OX-001", variantAttributes: { Color: "White", Size: "M" }, quantity: 120, unitPrice: 28.5 }],
    totalUnits: 120,
    totalValue: 3420,
    shipping: { contactName: "Jane Cooper", companyName: "Acme Corp", address: "456 Commerce Blvd, Suite 200", city: "Chicago", state: "IL", zip: "60601", phone: "(312) 555-0199" },
    paymentMethod: "Credit Account",
    status: "Pending Credit Approval",
    submittedAt: "2026-02-21T10:30:00Z",
  },
  {
    orderNumber: "PO-2026-0118",
    items: [{ id: "i2", productId: "p2", productName: "Calvin Klein Slim Chinos", sku: "CK-SC-045", variantAttributes: { Color: "Navy", Size: "32" }, quantity: 80, unitPrice: 42 }],
    totalUnits: 80,
    totalValue: 3360,
    shipping: { contactName: "Jane Cooper", companyName: "Acme Corp", address: "456 Commerce Blvd, Suite 200", city: "Chicago", state: "IL", zip: "60601", phone: "(312) 555-0199" },
    paymentMethod: "Credit Account",
    status: "Pending Credit Approval",
    submittedAt: "2026-02-18T14:15:00Z",
  },
  {
    orderNumber: "PO-2026-0112",
    items: [{ id: "i3", productId: "p3", productName: "Tommy Hilfiger Polo", sku: "TH-PL-012", variantAttributes: { Color: "Red", Size: "L" }, quantity: 200, unitPrice: 32.5 }],
    totalUnits: 200,
    totalValue: 6500,
    shipping: { contactName: "Michael Chen", companyName: "Acme Corp", address: "789 Retail Ave", city: "New York", state: "NY", zip: "10001", phone: "(212) 555-0342" },
    paymentMethod: "Credit Account",
    status: "Pending Credit Approval",
    submittedAt: "2026-02-12T09:00:00Z",
  },
  {
    orderNumber: "PO-2026-0105",
    items: [{ id: "i4", productId: "p4", productName: "IZOD Performance Jacket", sku: "IZ-PJ-078", variantAttributes: { Color: "Black", Size: "XL" }, quantity: 50, unitPrice: 65 }],
    totalUnits: 50,
    totalValue: 3250,
    shipping: { contactName: "Jane Cooper", companyName: "Acme Corp", address: "456 Commerce Blvd, Suite 200", city: "Chicago", state: "IL", zip: "60601", phone: "(312) 555-0199" },
    paymentMethod: "Credit Account",
    status: "Pending Credit Approval",
    submittedAt: "2026-02-05T16:45:00Z",
  },
];

function getInitialOrders(): PurchaseOrder[] {
  const stored = loadFromStorage<PurchaseOrder[]>(ORDERS_KEY, []);
  if (stored.length > 0) return stored;
  saveToStorage(ORDERS_KEY, SEED_ORDERS);
  return SEED_ORDERS;
}

// ── Context ─────────────────────────────────────────────────────────

const OrderHistoryContext = createContext<OrderHistoryContextValue | null>(null);

export function OrderHistoryProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<PurchaseOrder[]>(getInitialOrders);
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
