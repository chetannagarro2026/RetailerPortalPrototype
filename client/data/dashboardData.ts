// ─── Credit Data ───
export interface CreditData {
  availableCredit: number;
  totalCreditLimit: number;
  approvedUsed: number;
  pendingApproval: number;
  overLimit: number;
  totalOutstanding: number;
  overdueAmount: number;
  lastPaymentDate: string;
  thisMonthPayments: number;
}

export const creditData: CreditData = {
  availableCredit: 58000,
  totalCreditLimit: 150000,
  approvedUsed: 72000,
  pendingApproval: 20000,
  overLimit: 0,
  totalOutstanding: 92000,
  overdueAmount: 12400,
  lastPaymentDate: "2026-02-10",
  thisMonthPayments: 18500,
};

// ─── Financial Risk ───
export interface RiskCard {
  key: string;
  label: string;
  count: number;
  amount: number;
  severity: "critical" | "warning" | "info";
}

export const riskCards: RiskCard[] = [
  { key: "overdue", label: "Overdue Invoices", count: 3, amount: 12400, severity: "critical" },
  { key: "partial", label: "Partially Paid", count: 2, amount: 8750, severity: "warning" },
  { key: "pending-credit", label: "Pending Credit Approval", count: 4, amount: 20000, severity: "warning" },
  { key: "high-util", label: "High Utilization", count: 0, amount: 0, severity: "info" },
];

// ─── Risk Drawer Detail Rows ───
export interface RiskDetailRow {
  id: string;
  reference: string;
  date: string;
  amount: number;
  status: string;
  daysOverdue?: number;
}

export const riskDetailData: Record<string, RiskDetailRow[]> = {
  overdue: [
    { id: "1", reference: "INV-2026-0041", date: "2026-01-05", amount: 4200, status: "45 days overdue", daysOverdue: 45 },
    { id: "2", reference: "INV-2026-0038", date: "2026-01-12", amount: 5100, status: "38 days overdue", daysOverdue: 38 },
    { id: "3", reference: "INV-2026-0044", date: "2026-01-28", amount: 3100, status: "22 days overdue", daysOverdue: 22 },
  ],
  partial: [
    { id: "1", reference: "INV-2026-0032", date: "2025-12-18", amount: 5250, status: "$2,500 remaining" },
    { id: "2", reference: "INV-2026-0036", date: "2025-12-28", amount: 3500, status: "$1,200 remaining" },
  ],
  "pending-credit": [
    { id: "1", reference: "PO-2026-0112", date: "2026-02-18", amount: 6500, status: "Under Review" },
    { id: "2", reference: "PO-2026-0115", date: "2026-02-19", amount: 4200, status: "Under Review" },
    { id: "3", reference: "PO-2026-0118", date: "2026-02-20", amount: 5800, status: "Under Review" },
    { id: "4", reference: "PO-2026-0121", date: "2026-02-21", amount: 3500, status: "Pending Documents" },
  ],
  "high-util": [],
};

// ─── Orders ───
export interface OrderStatusItem {
  label: string;
  count: number;
  color: string;
}

export const orderStatuses: OrderStatusItem[] = [
  { label: "Pending Approval", count: 4, color: "#D97706" },
  { label: "Approved", count: 8, color: "#16A34A" },
  { label: "Shipped", count: 12, color: "#2563EB" },
  { label: "Rejected", count: 1, color: "#DC2626" },
];

export interface RecentOrder {
  id: string;
  poNumber: string;
  date: string;
  brand: string;
  amount: number;
  status: string;
  statusColor: string;
}

export const recentOrders: RecentOrder[] = [
  { id: "1", poNumber: "PO-2026-0121", date: "2026-02-21", brand: "Arrow", amount: 3500, status: "Pending", statusColor: "#D97706" },
  { id: "2", poNumber: "PO-2026-0118", date: "2026-02-20", brand: "Jessica Simpson", amount: 5800, status: "Pending", statusColor: "#D97706" },
  { id: "3", poNumber: "PO-2026-0115", date: "2026-02-19", brand: "Buffalo", amount: 4200, status: "Approved", statusColor: "#16A34A" },
  { id: "4", poNumber: "PO-2026-0110", date: "2026-02-17", brand: "Joe's Jeans", amount: 7100, status: "Shipped", statusColor: "#2563EB" },
  { id: "5", poNumber: "PO-2026-0108", date: "2026-02-15", brand: "Herve Leger", amount: 9200, status: "Shipped", statusColor: "#2563EB" },
];

// ─── Support ───
export interface SupportTicket {
  id: string;
  subject: string;
  status: string;
  priority: string;
  created: string;
  lastUpdate: string;
}

export const supportData = {
  openTickets: 2,
  slaAtRisk: 1,
  tickets: [
    { id: "TK-4021", subject: "Missing items in shipment PO-2026-0098", status: "Open", priority: "High", created: "2026-02-18", lastUpdate: "2026-02-21" },
    { id: "TK-4019", subject: "Invoice discrepancy on INV-2026-0038", status: "In Progress", priority: "Medium", created: "2026-02-15", lastUpdate: "2026-02-20" },
  ] as SupportTicket[],
};

// ─── Account Info ───
export const accountInfo = {
  businessName: "Macy's Inc.",
  billingAddress: "151 West 34th Street, New York, NY 10001",
  taxId: "XX-XXX7842",
  contactEmail: "buying@macys.com",
  contactPhone: "(212) 695-4400",
  accountRep: "Sarah Mitchell",
};
