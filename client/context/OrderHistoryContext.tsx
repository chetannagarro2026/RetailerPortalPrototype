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

const ORDERS_KEY = "b2b_order_history_v2";
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

const DEFAULT_SHIPPING = { contactName: "Jane Cooper", companyName: "Acme Corp", address: "456 Commerce Blvd, Suite 200", city: "Chicago", state: "IL", zip: "60601", phone: "(312) 555-0199" };
const ALT_SHIPPING = { contactName: "Michael Chen", companyName: "Acme Corp", address: "789 Retail Ave", city: "New York", state: "NY", zip: "10001", phone: "(212) 555-0342" };

const SEED_ORDERS: PurchaseOrder[] = [
  {
    orderNumber: "PO-2026-0121",
    items: [
      { id: "i1", productId: "p1", productName: "Premium Cotton Polo – Navy", sku: "POL-NAV-L", variantAttributes: { Color: "Navy", Size: "L" }, quantity: 50, unitPrice: 124 },
      { id: "i2", productId: "p2", productName: "Premium Cotton Polo – White", sku: "POL-WHT-M", variantAttributes: { Color: "White", Size: "M" }, quantity: 50, unitPrice: 124 },
    ],
    totalUnits: 100,
    totalValue: 12400,
    shipping: DEFAULT_SHIPPING,
    paymentMethod: "Credit Account",
    status: "Confirmed",
    submittedAt: "2026-02-21T10:30:00Z",
  },
  {
    orderNumber: "PO-2026-0118",
    items: [
      { id: "i3", productId: "p3", productName: "Slim Fit Chinos – Khaki", sku: "CHI-KHK-32", variantAttributes: { Color: "Khaki", Size: "32" }, quantity: 40, unitPrice: 89 },
      { id: "i4", productId: "p4", productName: "Slim Fit Chinos – Black", sku: "CHI-BLK-34", variantAttributes: { Color: "Black", Size: "34" }, quantity: 30, unitPrice: 89 },
    ],
    totalUnits: 70,
    totalValue: 6230,
    shipping: DEFAULT_SHIPPING,
    paymentMethod: "Credit Account",
    status: "Delivered",
    submittedAt: "2026-02-14T14:15:00Z",
  },
  {
    orderNumber: "PO-2026-0112",
    items: [
      { id: "i5", productId: "p5", productName: "Merino Wool Blazer – Charcoal", sku: "BLZ-CHR-42", variantAttributes: { Color: "Charcoal", Size: "42" }, quantity: 20, unitPrice: 450 },
      { id: "i6", productId: "p6", productName: "Oxford Dress Shirt – Light Blue", sku: "SHR-LBL-M", variantAttributes: { Color: "Light Blue", Size: "M" }, quantity: 60, unitPrice: 98 },
    ],
    totalUnits: 80,
    totalValue: 14880,
    shipping: ALT_SHIPPING,
    paymentMethod: "Credit Account",
    status: "Delivered",
    submittedAt: "2026-02-08T09:00:00Z",
  },
  {
    orderNumber: "PO-2026-0105",
    items: [
      { id: "i7", productId: "p7", productName: "Cashmere Overcoat – Camel", sku: "COT-CML-L", variantAttributes: { Color: "Camel", Size: "L" }, quantity: 15, unitPrice: 1200 },
      { id: "i8", productId: "p8", productName: "Leather Belt – Brown", sku: "BLT-BRN-M", variantAttributes: { Color: "Brown", Size: "M" }, quantity: 100, unitPrice: 65 },
      { id: "i9", productId: "p9", productName: "Silk Tie – Burgundy", sku: "TIE-BRG-OS", variantAttributes: { Color: "Burgundy", Size: "OS" }, quantity: 50, unitPrice: 75 },
    ],
    totalUnits: 165,
    totalValue: 28250,
    shipping: DEFAULT_SHIPPING,
    paymentMethod: "Credit Account",
    status: "Delivered",
    submittedAt: "2026-01-22T16:45:00Z",
  },
  {
    orderNumber: "PO-2026-0098",
    items: [
      { id: "i10", productId: "p10", productName: "Performance Running Shoe – Black", sku: "SHO-BLK-10", variantAttributes: { Color: "Black", Size: "10" }, quantity: 25, unitPrice: 220 },
      { id: "i11", productId: "p11", productName: "Athletic Socks 3-Pack", sku: "SOC-MIX-M", variantAttributes: { Color: "Mixed", Size: "M" }, quantity: 80, unitPrice: 35 },
    ],
    totalUnits: 105,
    totalValue: 8300,
    shipping: DEFAULT_SHIPPING,
    paymentMethod: "Credit Account",
    status: "Delivered",
    submittedAt: "2026-01-15T11:00:00Z",
  },
  {
    orderNumber: "PO-2026-0092",
    items: [
      { id: "i12", productId: "p12", productName: "Denim Jacket – Indigo Wash", sku: "JKT-IND-M", variantAttributes: { Color: "Indigo", Size: "M" }, quantity: 30, unitPrice: 285 },
      { id: "i13", productId: "p13", productName: "Graphic Tee – Logo Print", sku: "TEE-LOG-L", variantAttributes: { Color: "White", Size: "L" }, quantity: 100, unitPrice: 45 },
    ],
    totalUnits: 130,
    totalValue: 13050,
    shipping: ALT_SHIPPING,
    paymentMethod: "Credit Account",
    status: "Delivered",
    submittedAt: "2026-01-05T10:00:00Z",
  },
  {
    orderNumber: "PO-2026-0085",
    items: [
      { id: "i14", productId: "p14", productName: "Down Puffer Vest – Navy", sku: "VST-NAV-L", variantAttributes: { Color: "Navy", Size: "L" }, quantity: 40, unitPrice: 310 },
      { id: "i15", productId: "p15", productName: "Fleece Hoodie – Grey", sku: "HOD-GRY-XL", variantAttributes: { Color: "Grey", Size: "XL" }, quantity: 50, unitPrice: 120 },
    ],
    totalUnits: 90,
    totalValue: 18400,
    shipping: DEFAULT_SHIPPING,
    paymentMethod: "Credit Account",
    status: "Shipped",
    submittedAt: "2025-12-12T14:30:00Z",
  },
  {
    orderNumber: "PO-2026-0078",
    items: [
      { id: "i16", productId: "p16", productName: "Linen Shorts – Olive", sku: "SHT-OLV-32", variantAttributes: { Color: "Olive", Size: "32" }, quantity: 60, unitPrice: 78 },
      { id: "i17", productId: "p17", productName: "Canvas Sneaker – White", sku: "SNK-WHT-9", variantAttributes: { Color: "White", Size: "9" }, quantity: 25, unitPrice: 134 },
    ],
    totalUnits: 85,
    totalValue: 8030,
    shipping: DEFAULT_SHIPPING,
    paymentMethod: "Credit Account",
    status: "Delivered",
    submittedAt: "2025-11-28T09:15:00Z",
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
