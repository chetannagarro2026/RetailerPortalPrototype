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
  amount: number;
  paid: number;
  status: InvoiceStatus;
  linkedPO: string;
  items: InvoiceLineItem[];
  payments: InvoicePayment[];
}

// ── Helpers ─────────────────────────────────────────────────────────

function balance(inv: Invoice): number {
  return inv.amount - inv.paid;
}

export { balance };

// ── Mock Data ───────────────────────────────────────────────────────

export const INVOICES: Invoice[] = [
  {
    id: "1",
    invoiceNumber: "INV-44821",
    invoiceDate: "2026-02-24",
    dueDate: "2026-03-26",
    amount: 12400,
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
    amount: 6500,
    paid: 6500,
    status: "Paid",
    linkedPO: "PO-10041",
    items: [
      { id: "i3", productName: "Slim Fit Chinos – Khaki", sku: "CHI-KHK-32", quantity: 40, unitPrice: 89, taxRate: 0.1 },
      { id: "i4", productName: "Slim Fit Chinos – Black", sku: "CHI-BLK-34", quantity: 30, unitPrice: 89, taxRate: 0.1 },
    ],
    payments: [
      { ref: "PAY-10234", date: "2026-02-20", amount: 6500, mode: "Bank Transfer" },
    ],
  },
  {
    id: "3",
    invoiceNumber: "INV-44756",
    invoiceDate: "2026-02-12",
    dueDate: "2026-03-14",
    amount: 18900,
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
    amount: 34250,
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
    amount: 9800,
    paid: 9800,
    status: "Paid",
    linkedPO: "PO-10038",
    items: [
      { id: "i10", productName: "Performance Running Shoe – Black", sku: "SHO-BLK-10", quantity: 25, unitPrice: 220, taxRate: 0.1 },
      { id: "i11", productName: "Athletic Socks 3-Pack", sku: "SOC-MIX-M", quantity: 80, unitPrice: 35, taxRate: 0.1 },
    ],
    payments: [
      { ref: "PAY-10140", date: "2026-01-22", amount: 9800, mode: "Bank Transfer" },
    ],
  },
  {
    id: "6",
    invoiceNumber: "INV-44580",
    invoiceDate: "2026-01-10",
    dueDate: "2026-02-09",
    amount: 15200,
    paid: 15200,
    status: "Paid",
    linkedPO: "PO-10037",
    items: [
      { id: "i12", productName: "Denim Jacket – Indigo Wash", sku: "JKT-IND-M", quantity: 30, unitPrice: 285, taxRate: 0.1 },
      { id: "i13", productName: "Graphic Tee – Logo Print", sku: "TEE-LOG-L", quantity: 100, unitPrice: 45, taxRate: 0.1 },
    ],
    payments: [
      { ref: "PAY-10120", date: "2026-01-15", amount: 15200, mode: "Bank Transfer" },
    ],
  },
  {
    id: "7",
    invoiceNumber: "INV-44510",
    invoiceDate: "2025-12-18",
    dueDate: "2026-01-17",
    amount: 22400,
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
    amount: 8750,
    paid: 8750,
    status: "Paid",
    linkedPO: "PO-10035",
    items: [
      { id: "i16", productName: "Linen Shorts – Olive", sku: "SHT-OLV-32", quantity: 60, unitPrice: 78, taxRate: 0.1 },
      { id: "i17", productName: "Canvas Sneaker – White", sku: "SNK-WHT-9", quantity: 25, unitPrice: 135, taxRate: 0.1 },
    ],
    payments: [
      { ref: "PAY-10080", date: "2025-12-10", amount: 8750, mode: "Bank Transfer" },
    ],
  },
];
