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
  { key: "overdue", label: "Overdue Invoices", count: 2, amount: 15694, severity: "critical" },
  { key: "partial", label: "Partially Paid", count: 1, amount: 6251, severity: "warning" },
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
    { id: "1", reference: "INV-44690", date: "2026-01-28", amount: 7478, status: "Overdue", daysOverdue: 33 },
    { id: "2", reference: "INV-44510", date: "2025-12-18", amount: 8216, status: "Overdue", daysOverdue: 74 },
  ],
  partial: [
    { id: "1", reference: "INV-44756", date: "2026-02-12", amount: 6251, status: "$6,251 remaining" },
  ],
  "pending-credit": [
    { id: "1", reference: "PO-2026-0121", date: "2026-02-21", amount: 12400, status: "Confirmed" },
    { id: "2", reference: "PO-2026-0112", date: "2026-02-08", amount: 14880, status: "Under Review" },
    { id: "3", reference: "PO-2026-0118", date: "2026-02-14", amount: 6230, status: "Under Review" },
    { id: "4", reference: "PO-2026-0105", date: "2026-01-22", amount: 28250, status: "Under Review" },
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
  { id: "1", poNumber: "PO-2026-0121", date: "2026-02-21", brand: "Centric Brands", amount: 12400, status: "Confirmed", statusColor: "#16A34A" },
  { id: "2", poNumber: "PO-2026-0118", date: "2026-02-14", brand: "Centric Brands", amount: 6230, status: "Delivered", statusColor: "#2563EB" },
  { id: "3", poNumber: "PO-2026-0112", date: "2026-02-08", brand: "Centric Brands", amount: 14880, status: "Delivered", statusColor: "#2563EB" },
  { id: "4", poNumber: "PO-2026-0105", date: "2026-01-22", brand: "Centric Brands", amount: 28250, status: "Delivered", statusColor: "#2563EB" },
  { id: "5", poNumber: "PO-2026-0098", date: "2026-01-15", brand: "Centric Brands", amount: 8300, status: "Delivered", statusColor: "#2563EB" },
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
    { id: "TK-10001", subject: "Wrong sizes received in last shipment PO-2026-0121", status: "Open", priority: "High", created: "2026-02-20", lastUpdate: "2026-02-24" },
    { id: "TK-10002", subject: "Discrepancy in invoice amount INV-44690", status: "Open", priority: "Medium", created: "2026-02-18", lastUpdate: "2026-02-23" },
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
