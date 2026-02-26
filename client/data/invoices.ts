// ── Invoice Types ───────────────────────────────────────────────────

export type InvoiceStatus = "Paid" | "Partially Paid" | "Overdue" | "Upcoming";

export interface InvoiceLineItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
}

export interface InvoicePayment {
  ref: string;
  date: string;
  amount: number;
  mode: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  invoiceDate: string;
  dueDate: string;
  amount: number; // Grand total (subtotal + tax)
  paid: number;
  status: InvoiceStatus;
  linkedPO: string;
  items: InvoiceLineItem[];
  payments: InvoicePayment[];
}

// ── Helpers ─────────────────────────────────────────────────────────

/** Compute subtotal from line items (before tax) */
export function computeSubtotal(items: InvoiceLineItem[]): number {
  return items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
}

/** Compute total tax from line items */
export function computeTax(items: InvoiceLineItem[]): number {
  return items.reduce((s, i) => s + i.quantity * i.unitPrice * i.taxRate, 0);
}

/** Compute grand total from line items (subtotal + tax) */
export function computeGrandTotal(items: InvoiceLineItem[]): number {
  return computeSubtotal(items) + computeTax(items);
}

/** Outstanding balance = grand total - paid */
export function outstanding(inv: Invoice): number {
  return inv.amount - inv.paid;
}

/** Dynamic status label based on due date and outstanding */
export function getStatusLabel(inv: Invoice): { label: string; color: string } {
  const bal = outstanding(inv);
  if (bal <= 0) return { label: "Paid", color: "#16A34A" };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(inv.dueDate);
  due.setHours(0, 0, 0, 0);
  const diffMs = due.getTime() - today.getTime();
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return { label: `Overdue by ${Math.abs(diffDays)} days`, color: "#DC2626" };
  }
  if (diffDays === 0) {
    return { label: "Due today", color: "#D97706" };
  }
  return { label: `Due in ${diffDays} days`, color: "#6B7B99" };
}

// ── Mock Data ───────────────────────────────────────────────────────
// amount = grand total (subtotal + 10% tax), reconciles with line items

export const INVOICES: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-44821",
    invoiceDate: "2026-02-24",
    dueDate: "2026-03-26",
    amount: 13640, // (50*124 + 50*124) * 1.1
    paid: 0,
    status: "Upcoming",
    linkedPO: "PO-10042",
    items: [
      { id: "i1", productName: "Premium Cotton Polo – Navy", sku: "POL-NAV-L", quantity: 50, unitPrice: 124, taxRate: 0.1 },
      { id: "i2", productName: "Premium Cotton Polo – White", sku: "POL-WHT-M", quantity: 50, unitPrice: 124, taxRate: 0.1 },
    ],
    payments: [],
  },
  {
    id: "2",
    invoiceNumber: "INV-44798",
    invoiceDate: "2026-02-18",
    dueDate: "2026-03-20",
    amount: 6853, // (40*89 + 30*89) * 1.1
    paid: 6853,
    status: "Paid",
    linkedPO: "PO-10041",
    items: [
      { id: "i3", productName: "Slim Fit Chinos – Khaki", sku: "CHI-KHK-32", quantity: 40, unitPrice: 89, taxRate: 0.1 },
      { id: "i4", productName: "Slim Fit Chinos – Black", sku: "CHI-BLK-34", quantity: 30, unitPrice: 89, taxRate: 0.1 },
    ],
    payments: [
      { ref: "PAY-10234", date: "2026-02-20", amount: 6853, mode: "Bank Transfer" },
    ],
  },
  {
    id: "3",
    invoiceNumber: "INV-44756",
    invoiceDate: "2026-02-12",
    dueDate: "2026-03-14",
    amount: 16368, // (20*450 + 60*98) * 1.1
    paid: 8500,
    status: "Partially Paid",
    linkedPO: "PO-10040",
    items: [
      { id: "i5", productName: "Merino Wool Blazer – Charcoal", sku: "BLZ-CHR-42", quantity: 20, unitPrice: 450, taxRate: 0.1 },
      { id: "i6", productName: "Oxford Dress Shirt – Light Blue", sku: "SHR-LBL-M", quantity: 60, unitPrice: 98, taxRate: 0.1 },
    ],
    payments: [
      { ref: "PAY-10198", date: "2026-02-10", amount: 8500, mode: "Bank Transfer" },
    ],
  },
  {
    id: "4",
    invoiceNumber: "INV-44690",
    invoiceDate: "2026-01-28",
    dueDate: "2026-02-20",
    amount: 31075, // (15*1200 + 100*65 + 50*75) * 1.1
    paid: 20000,
    status: "Overdue",
    linkedPO: "PO-10039",
    items: [
      { id: "i7", productName: "Cashmere Overcoat – Camel", sku: "COT-CML-L", quantity: 15, unitPrice: 1200, taxRate: 0.1 },
      { id: "i8", productName: "Leather Belt – Brown", sku: "BLT-BRN-M", quantity: 100, unitPrice: 65, taxRate: 0.1 },
      { id: "i9", productName: "Silk Tie – Burgundy", sku: "TIE-BRG-OS", quantity: 50, unitPrice: 75, taxRate: 0.1 },
    ],
    payments: [
      { ref: "PAY-10155", date: "2026-01-25", amount: 12000, mode: "Bank Transfer" },
      { ref: "PAY-10170", date: "2026-02-05", amount: 8000, mode: "Credit Note" },
    ],
  },
  {
    id: "5",
    invoiceNumber: "INV-44612",
    invoiceDate: "2026-01-20",
    dueDate: "2026-02-19",
    amount: 9130, // (25*220 + 80*35) * 1.1
    paid: 9130,
    status: "Paid",
    linkedPO: "PO-10038",
    items: [
      { id: "i10", productName: "Performance Running Shoe – Black", sku: "SHO-BLK-10", quantity: 25, unitPrice: 220, taxRate: 0.1 },
      { id: "i11", productName: "Athletic Socks 3-Pack", sku: "SOC-MIX-M", quantity: 80, unitPrice: 35, taxRate: 0.1 },
    ],
    payments: [
      { ref: "PAY-10140", date: "2026-01-22", amount: 9130, mode: "Bank Transfer" },
    ],
  },
  {
    id: "6",
    invoiceNumber: "INV-44580",
    invoiceDate: "2026-01-10",
    dueDate: "2026-02-09",
    amount: 14355, // (30*285 + 100*45) * 1.1
    paid: 14355,
    status: "Paid",
    linkedPO: "PO-10037",
    items: [
      { id: "i12", productName: "Denim Jacket – Indigo Wash", sku: "JKT-IND-M", quantity: 30, unitPrice: 285, taxRate: 0.1 },
      { id: "i13", productName: "Graphic Tee – Logo Print", sku: "TEE-LOG-L", quantity: 100, unitPrice: 45, taxRate: 0.1 },
    ],
    payments: [
      { ref: "PAY-10120", date: "2026-01-15", amount: 14355, mode: "Bank Transfer" },
    ],
  },
  {
    id: "7",
    invoiceNumber: "INV-44510",
    invoiceDate: "2025-12-18",
    dueDate: "2026-01-17",
    amount: 20240, // (40*310 + 50*120) * 1.1
    paid: 10000,
    status: "Overdue",
    linkedPO: "PO-10036",
    items: [
      { id: "i14", productName: "Down Puffer Vest – Navy", sku: "VST-NAV-L", quantity: 40, unitPrice: 310, taxRate: 0.1 },
      { id: "i15", productName: "Fleece Hoodie – Grey", sku: "HOD-GRY-XL", quantity: 50, unitPrice: 120, taxRate: 0.1 },
    ],
    payments: [
      { ref: "PAY-10095", date: "2025-12-28", amount: 10000, mode: "Bank Transfer" },
    ],
  },
  {
    id: "8",
    invoiceNumber: "INV-44481",
    invoiceDate: "2025-12-05",
    dueDate: "2026-01-04",
    amount: 8855, // (60*78 + 25*135) * 1.1 ≈ 8860.50, rounded
    paid: 8855,
    status: "Paid",
    linkedPO: "PO-10035",
    items: [
      { id: "i16", productName: "Linen Shorts – Olive", sku: "SHT-OLV-32", quantity: 60, unitPrice: 78, taxRate: 0.1 },
      { id: "i17", productName: "Canvas Sneaker – White", sku: "SNK-WHT-9", quantity: 25, unitPrice: 134, taxRate: 0.1 },
    ],
    payments: [
      { ref: "PAY-10080", date: "2025-12-10", amount: 8855, mode: "Bank Transfer" },
    ],
  },
];
