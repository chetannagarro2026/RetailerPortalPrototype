// ── Invoice Types ───────────────────────────────────────────────────

export type InvoiceStatus = "Paid" | "Partially Paid" | "Overdue" | "Upcoming";

export type DiscountType = "percentage" | "fixed" | "volume";

export interface LineDiscount {
  type: DiscountType;
  value: number; // percentage (e.g. 10) or fixed amount (e.g. 500)
  label?: string; // e.g. "Volume Offer Applied"
}

export interface InvoiceLineItem {
  id: string;
  productName: string;
  sku: string;
  quantity: number;
  unitPrice: number;
  taxRate: number;
  discount?: LineDiscount;
}

export interface OrderDiscount {
  type: DiscountType;
  value: number;
  label: string; // e.g. "Trade Discount 5%"
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
  amount: number; // Grand total (after discounts + tax)
  paid: number;
  status: InvoiceStatus;
  linkedPO: string;
  items: InvoiceLineItem[];
  payments: InvoicePayment[];
  orderDiscount?: OrderDiscount;
}

// ── Calculation Helpers ─────────────────────────────────────────────

/** Line base total before discount */
export function lineBaseTotal(item: InvoiceLineItem): number {
  return item.quantity * item.unitPrice;
}

/** Line discount amount */
export function lineDiscountAmount(item: InvoiceLineItem): number {
  if (!item.discount) return 0;
  const base = lineBaseTotal(item);
  if (item.discount.type === "percentage") return base * (item.discount.value / 100);
  return item.discount.value; // fixed or volume
}

/** Discounted line total (after line discount, before tax) */
export function discountedLineTotal(item: InvoiceLineItem): number {
  return lineBaseTotal(item) - lineDiscountAmount(item);
}

/** Subtotal before any discounts */
export function computeSubtotalBeforeDiscount(items: InvoiceLineItem[]): number {
  return items.reduce((s, i) => s + lineBaseTotal(i), 0);
}

/** Total line-level discounts */
export function computeTotalLineDiscounts(items: InvoiceLineItem[]): number {
  return items.reduce((s, i) => s + lineDiscountAmount(i), 0);
}

/** Subtotal after line discounts */
export function computeSubtotalAfterLineDiscounts(items: InvoiceLineItem[]): number {
  return items.reduce((s, i) => s + discountedLineTotal(i), 0);
}

/** Order-level discount amount */
export function computeOrderDiscountAmount(items: InvoiceLineItem[], orderDiscount?: OrderDiscount): number {
  if (!orderDiscount) return 0;
  const afterLine = computeSubtotalAfterLineDiscounts(items);
  if (orderDiscount.type === "percentage") return afterLine * (orderDiscount.value / 100);
  return orderDiscount.value;
}

/** Net subtotal (after all discounts, before tax) */
export function computeNetSubtotal(items: InvoiceLineItem[], orderDiscount?: OrderDiscount): number {
  return computeSubtotalAfterLineDiscounts(items) - computeOrderDiscountAmount(items, orderDiscount);
}

/** Total discount (line + order) */
export function computeTotalDiscount(items: InvoiceLineItem[], orderDiscount?: OrderDiscount): number {
  return computeTotalLineDiscounts(items) + computeOrderDiscountAmount(items, orderDiscount);
}

/** Tax on net subtotal */
export function computeTax(items: InvoiceLineItem[], orderDiscount?: OrderDiscount): number {
  // Use average tax rate weighted by discounted amounts
  const net = computeNetSubtotal(items, orderDiscount);
  if (net === 0) return 0;
  const afterLine = computeSubtotalAfterLineDiscounts(items);
  if (afterLine === 0) return 0;
  // Proportion each line's share of order discount
  const orderDiscAmt = computeOrderDiscountAmount(items, orderDiscount);
  return items.reduce((s, item) => {
    const lineFrac = afterLine > 0 ? discountedLineTotal(item) / afterLine : 0;
    const lineNet = discountedLineTotal(item) - orderDiscAmt * lineFrac;
    return s + lineNet * item.taxRate;
  }, 0);
}

/** Grand total = net subtotal + tax */
export function computeGrandTotal(items: InvoiceLineItem[], orderDiscount?: OrderDiscount): number {
  return computeNetSubtotal(items, orderDiscount) + computeTax(items, orderDiscount);
}

/** Outstanding balance = invoice amount - paid */
export function outstanding(inv: Invoice): number {
  return inv.amount - inv.paid;
}

/** Whether any discounts exist on this invoice */
export function hasAnyDiscount(inv: Invoice): boolean {
  return inv.items.some((i) => i.discount) || !!inv.orderDiscount;
}

/** Status label with fixed states + optional days sub-text */
export function getStatusLabel(inv: Invoice): { label: string; color: string; days?: number } {
  const bal = outstanding(inv);
  if (bal <= 0) return { label: "Paid", color: "#16A34A" };

  const hasPaid = inv.paid > 0;
  if (hasPaid && bal > 0) {
    // Partially Paid — still compute days for sub-text
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(inv.dueDate);
    due.setHours(0, 0, 0, 0);
    const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { label: "Partially Paid", color: "#D97706", days: diffDays };
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const due = new Date(inv.dueDate);
  due.setHours(0, 0, 0, 0);
  const diffDays = Math.round((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { label: "Overdue", color: "#B91C1C", days: Math.abs(diffDays) };
  if (diffDays === 0) return { label: "Due Today", color: "#D97706", days: 0 };
  if (diffDays <= 7) return { label: "Due Soon", color: "#92400E", days: diffDays };
  return { label: "Upcoming", color: "#6B7B99", days: diffDays };
}

// ── Mock Data ───────────────────────────────────────────────────────

export const INVOICES: Invoice[] = [
  {
    // Line discounts + order discount
    id: "1",
    invoiceNumber: "INV-44821",
    invoiceDate: "2026-02-24",
    dueDate: "2026-03-26",
    amount: 12276, // computed: net 11160 + tax 1116
    paid: 0,
    status: "Upcoming",
    linkedPO: "PO-10042",
    orderDiscount: { type: "percentage", value: 5, label: "Trade Discount 5%" },
    items: [
      { id: "i1", productName: "Premium Cotton Polo – Navy", sku: "POL-NAV-L", quantity: 50, unitPrice: 124, taxRate: 0.1, discount: { type: "percentage", value: 5 } },
      { id: "i2", productName: "Premium Cotton Polo – White", sku: "POL-WHT-M", quantity: 50, unitPrice: 124, taxRate: 0.1, discount: { type: "percentage", value: 5 } },
    ],
    payments: [],
  },
  {
    // No discounts
    id: "2",
    invoiceNumber: "INV-44798",
    invoiceDate: "2026-02-18",
    dueDate: "2026-03-20",
    amount: 6853,
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
    // Line-level discounts only (mixed types)
    id: "3",
    invoiceNumber: "INV-44756",
    invoiceDate: "2026-02-12",
    dueDate: "2026-03-14",
    amount: 14751, // net 13410 + tax 1341
    paid: 8500,
    status: "Partially Paid",
    linkedPO: "PO-10040",
    items: [
      { id: "i5", productName: "Merino Wool Blazer – Charcoal", sku: "BLZ-CHR-42", quantity: 20, unitPrice: 450, taxRate: 0.1, discount: { type: "percentage", value: 10 } },
      { id: "i6", productName: "Oxford Dress Shirt – Light Blue", sku: "SHR-LBL-M", quantity: 60, unitPrice: 98, taxRate: 0.1, discount: { type: "fixed", value: 480 } },
    ],
    payments: [
      { ref: "PAY-10198", date: "2026-02-10", amount: 8500, mode: "Bank Transfer" },
    ],
  },
  {
    // Volume discount on one line + order discount
    id: "4",
    invoiceNumber: "INV-44690",
    invoiceDate: "2026-01-28",
    dueDate: "2026-02-20",
    amount: 27478, // computed with discounts
    paid: 20000,
    status: "Overdue",
    linkedPO: "PO-10039",
    orderDiscount: { type: "fixed", value: 1000, label: "Loyalty Rebate" },
    items: [
      { id: "i7", productName: "Cashmere Overcoat – Camel", sku: "COT-CML-L", quantity: 15, unitPrice: 1200, taxRate: 0.1 },
      { id: "i8", productName: "Leather Belt – Brown", sku: "BLT-BRN-M", quantity: 100, unitPrice: 65, taxRate: 0.1, discount: { type: "volume", value: 650, label: "Volume Offer Applied" } },
      { id: "i9", productName: "Silk Tie – Burgundy", sku: "TIE-BRG-OS", quantity: 50, unitPrice: 75, taxRate: 0.1 },
    ],
    payments: [
      { ref: "PAY-10155", date: "2026-01-25", amount: 12000, mode: "Bank Transfer" },
      { ref: "PAY-10170", date: "2026-02-05", amount: 8000, mode: "Credit Note" },
    ],
  },
  {
    // No discounts
    id: "5",
    invoiceNumber: "INV-44612",
    invoiceDate: "2026-01-20",
    dueDate: "2026-02-19",
    amount: 9130,
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
    // Order-level discount only
    id: "6",
    invoiceNumber: "INV-44580",
    invoiceDate: "2026-01-10",
    dueDate: "2026-02-09",
    amount: 13637, // net 12397.5 + tax ~1239.75
    paid: 13637,
    status: "Paid",
    linkedPO: "PO-10037",
    orderDiscount: { type: "percentage", value: 5, label: "Early Order Discount 5%" },
    items: [
      { id: "i12", productName: "Denim Jacket – Indigo Wash", sku: "JKT-IND-M", quantity: 30, unitPrice: 285, taxRate: 0.1 },
      { id: "i13", productName: "Graphic Tee – Logo Print", sku: "TEE-LOG-L", quantity: 100, unitPrice: 45, taxRate: 0.1 },
    ],
    payments: [
      { ref: "PAY-10120", date: "2026-01-15", amount: 13637, mode: "Bank Transfer" },
    ],
  },
  {
    // Line discount percentage
    id: "7",
    invoiceNumber: "INV-44510",
    invoiceDate: "2025-12-18",
    dueDate: "2026-01-17",
    amount: 18216, // net 16560 + tax 1656
    paid: 10000,
    status: "Overdue",
    linkedPO: "PO-10036",
    items: [
      { id: "i14", productName: "Down Puffer Vest – Navy", sku: "VST-NAV-L", quantity: 40, unitPrice: 310, taxRate: 0.1, discount: { type: "percentage", value: 10 } },
      { id: "i15", productName: "Fleece Hoodie – Grey", sku: "HOD-GRY-XL", quantity: 50, unitPrice: 120, taxRate: 0.1 },
    ],
    payments: [
      { ref: "PAY-10095", date: "2025-12-28", amount: 10000, mode: "Bank Transfer" },
    ],
  },
  {
    // No discounts
    id: "8",
    invoiceNumber: "INV-44481",
    invoiceDate: "2025-12-05",
    dueDate: "2026-01-04",
    amount: 8855,
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
