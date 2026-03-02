// ── Notification Types ──────────────────────────────────────────────

export type NotificationCategory = "financial" | "returns" | "support" | "orders";

export type NotificationEventType =
  // Financial
  | "invoice_generated"
  | "invoice_due"
  | "invoice_overdue"
  | "credit_note_issued"
  | "credit_note_reflected"
  // Returns & Claims
  | "claim_submitted"
  | "claim_approved"
  | "claim_rejected"
  | "return_credit_generated"
  | "return_credit_reflected"
  // Support
  | "ticket_reply"
  | "ticket_closed"
  // Orders
  | "po_confirmed"
  | "po_shipped"
  | "po_delayed";

export interface AppNotification {
  id: string;
  eventType: NotificationEventType;
  category: NotificationCategory;
  title: string;
  subtitle: string;
  read: boolean;
  createdAt: string; // ISO date string
  /** Target route for deep linking */
  linkTo: string;
  /** Optional CTA label */
  ctaLabel?: string;
}

// ── Category helpers ────────────────────────────────────────────────

export function categoryForEvent(type: NotificationEventType): NotificationCategory {
  if (["invoice_generated", "invoice_due", "invoice_overdue", "credit_note_issued", "credit_note_reflected"].includes(type)) return "financial";
  if (["claim_submitted", "claim_approved", "claim_rejected", "return_credit_generated", "return_credit_reflected"].includes(type)) return "returns";
  if (["ticket_reply", "ticket_closed"].includes(type)) return "support";
  return "orders";
}

// ── Mock Data ───────────────────────────────────────────────────────

function daysAgo(d: number, hours = 0): string {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(date.getHours() - hours);
  return date.toISOString();
}

function hoursAgo(h: number): string {
  const date = new Date();
  date.setHours(date.getHours() - h);
  return date.toISOString();
}

function minutesAgo(m: number): string {
  const date = new Date();
  date.setMinutes(date.getMinutes() - m);
  return date.toISOString();
}

const INITIAL_NOTIFICATIONS: AppNotification[] = [
  {
    id: "n-001",
    eventType: "ticket_reply",
    category: "support",
    title: "New reply on Ticket TK-10001",
    subtitle: "Awaiting your response",
    read: false,
    createdAt: minutesAgo(10),
    linkTo: "/account/support/TK-10001",
    ctaLabel: "View Ticket",
  },
  {
    id: "n-002",
    eventType: "invoice_due",
    category: "financial",
    title: "Invoice INV-44756 due in 3 days",
    subtitle: "Amount: ₹14,751",
    read: false,
    createdAt: hoursAgo(2),
    linkTo: "/account/invoices/inv-005",
    ctaLabel: "View Invoice",
  },
  {
    id: "n-003",
    eventType: "claim_approved",
    category: "returns",
    title: "Return CL-10002 approved",
    subtitle: "Credit note CN-00313 issued",
    read: false,
    createdAt: daysAgo(1),
    linkTo: "/account/returns/CL-10002",
    ctaLabel: "View Claim",
  },
  {
    id: "n-004",
    eventType: "po_shipped",
    category: "orders",
    title: "PO PO-2025-0042 shipped",
    subtitle: "Expected delivery: 5 business days",
    read: false,
    createdAt: daysAgo(1, 4),
    linkTo: "/purchase-orders/PO-2025-0042",
    ctaLabel: "View Order",
  },
  {
    id: "n-005",
    eventType: "invoice_overdue",
    category: "financial",
    title: "Invoice INV-44501 is overdue",
    subtitle: "Payment of ₹32,400 past due by 7 days",
    read: false,
    createdAt: daysAgo(2),
    linkTo: "/account/invoices/inv-003",
    ctaLabel: "View Invoice",
  },
  {
    id: "n-006",
    eventType: "credit_note_issued",
    category: "financial",
    title: "Credit Note CN-00312 issued",
    subtitle: "₹4,500 credited to your account",
    read: true,
    createdAt: daysAgo(3),
    linkTo: "/account/credit",
    ctaLabel: "View Credit",
  },
  {
    id: "n-007",
    eventType: "po_confirmed",
    category: "orders",
    title: "PO PO-2025-0041 confirmed",
    subtitle: "12 items, estimated ship in 3 days",
    read: true,
    createdAt: daysAgo(4),
    linkTo: "/purchase-orders/PO-2025-0041",
    ctaLabel: "View Order",
  },
  {
    id: "n-008",
    eventType: "claim_rejected",
    category: "returns",
    title: "Return CL-10005 rejected",
    subtitle: "Reason: Change of mind not covered",
    read: false,
    createdAt: daysAgo(4, 6),
    linkTo: "/account/returns/CL-10005",
    ctaLabel: "View Claim",
  },
  {
    id: "n-009",
    eventType: "invoice_generated",
    category: "financial",
    title: "New Invoice INV-44802 generated",
    subtitle: "Amount: ₹28,350 — Due: 30 days",
    read: true,
    createdAt: daysAgo(5),
    linkTo: "/account/invoices/inv-001",
    ctaLabel: "View Invoice",
  },
  {
    id: "n-010",
    eventType: "ticket_closed",
    category: "support",
    title: "Ticket TK-10003 resolved",
    subtitle: "Your support request has been closed",
    read: true,
    createdAt: daysAgo(6),
    linkTo: "/account/support/TK-10003",
    ctaLabel: "View Ticket",
  },
  {
    id: "n-011",
    eventType: "claim_submitted",
    category: "returns",
    title: "Claim CL-10004 submitted",
    subtitle: "Under review — 2 items",
    read: true,
    createdAt: daysAgo(8),
    linkTo: "/account/returns/CL-10004",
    ctaLabel: "View Claim",
  },
  {
    id: "n-012",
    eventType: "po_delayed",
    category: "orders",
    title: "PO PO-2025-0039 delayed",
    subtitle: "New estimated delivery: +4 business days",
    read: true,
    createdAt: daysAgo(10),
    linkTo: "/purchase-orders/PO-2025-0039",
    ctaLabel: "View Order",
  },
  {
    id: "n-013",
    eventType: "credit_note_reflected",
    category: "financial",
    title: "Credit CN-00310 reflected in ledger",
    subtitle: "₹6,200 applied to outstanding balance",
    read: true,
    createdAt: daysAgo(12),
    linkTo: "/account/credit",
  },
  {
    id: "n-014",
    eventType: "return_credit_generated",
    category: "returns",
    title: "Credit note for CL-10001 generated",
    subtitle: "CN-00308 — ₹12,600",
    read: true,
    createdAt: daysAgo(15),
    linkTo: "/account/returns/CL-10001",
    ctaLabel: "View Claim",
  },
  {
    id: "n-015",
    eventType: "invoice_due",
    category: "financial",
    title: "Invoice INV-44650 due tomorrow",
    subtitle: "Amount: ₹18,900",
    read: true,
    createdAt: daysAgo(18),
    linkTo: "/account/invoices/inv-002",
    ctaLabel: "View Invoice",
  },
  {
    id: "n-016",
    eventType: "po_shipped",
    category: "orders",
    title: "PO PO-2025-0038 shipped",
    subtitle: "Tracking available",
    read: true,
    createdAt: daysAgo(22),
    linkTo: "/purchase-orders/PO-2025-0038",
    ctaLabel: "View Order",
  },
  {
    id: "n-017",
    eventType: "ticket_reply",
    category: "support",
    title: "New reply on Ticket TK-10002",
    subtitle: "Agent responded to your query",
    read: true,
    createdAt: daysAgo(25),
    linkTo: "/account/support/TK-10002",
    ctaLabel: "View Ticket",
  },
  {
    id: "n-018",
    eventType: "return_credit_reflected",
    category: "returns",
    title: "Credit for CL-10003 reflected",
    subtitle: "₹8,400 applied to your account",
    read: true,
    createdAt: daysAgo(30),
    linkTo: "/account/credit",
  },
  {
    id: "n-019",
    eventType: "invoice_generated",
    category: "financial",
    title: "New Invoice INV-44590 generated",
    subtitle: "Amount: ₹45,200 — Due: 30 days",
    read: true,
    createdAt: daysAgo(35),
    linkTo: "/account/invoices/inv-004",
    ctaLabel: "View Invoice",
  },
  {
    id: "n-020",
    eventType: "po_confirmed",
    category: "orders",
    title: "PO PO-2025-0037 confirmed",
    subtitle: "8 items ready for dispatch",
    read: true,
    createdAt: daysAgo(40),
    linkTo: "/purchase-orders/PO-2025-0037",
    ctaLabel: "View Order",
  },
  {
    id: "n-021",
    eventType: "claim_approved",
    category: "returns",
    title: "Return CL-10003 approved",
    subtitle: "Full refund processed",
    read: true,
    createdAt: daysAgo(42),
    linkTo: "/account/returns/CL-10003",
    ctaLabel: "View Claim",
  },
  {
    id: "n-022",
    eventType: "invoice_overdue",
    category: "financial",
    title: "Invoice INV-44480 is overdue",
    subtitle: "Payment of ₹22,100 past due by 14 days",
    read: true,
    createdAt: daysAgo(48),
    linkTo: "/account/invoices/inv-006",
    ctaLabel: "View Invoice",
  },
  {
    id: "n-023",
    eventType: "ticket_closed",
    category: "support",
    title: "Ticket TK-10004 resolved",
    subtitle: "Issue marked as resolved",
    read: true,
    createdAt: daysAgo(52),
    linkTo: "/account/support/TK-10004",
    ctaLabel: "View Ticket",
  },
  {
    id: "n-024",
    eventType: "po_shipped",
    category: "orders",
    title: "PO PO-2025-0036 shipped",
    subtitle: "Expected delivery in 3 business days",
    read: true,
    createdAt: daysAgo(55),
    linkTo: "/purchase-orders/PO-2025-0036",
    ctaLabel: "View Order",
  },
  {
    id: "n-025",
    eventType: "invoice_generated",
    category: "financial",
    title: "New Invoice INV-44410 generated",
    subtitle: "Amount: ₹16,800 — Due: 30 days",
    read: true,
    createdAt: daysAgo(58),
    linkTo: "/account/invoices/inv-007",
    ctaLabel: "View Invoice",
  },
];

// ── In-memory Store ─────────────────────────────────────────────────

let notifications = [...INITIAL_NOTIFICATIONS];
let listeners: Array<() => void> = [];

function emit() {
  listeners.forEach((fn) => fn());
}

export function subscribe(fn: () => void) {
  listeners.push(fn);
  return () => {
    listeners = listeners.filter((l) => l !== fn);
  };
}

export function getNotifications(): AppNotification[] {
  // Only return last 60 days
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 60);
  return notifications.filter((n) => new Date(n.createdAt) >= cutoff);
}

export function getUnreadCount(): number {
  return getNotifications().filter((n) => !n.read).length;
}

export function markAsRead(id: string) {
  notifications = notifications.map((n) =>
    n.id === id ? { ...n, read: true } : n
  );
  emit();
}

export function markAllAsRead() {
  notifications = notifications.map((n) => ({ ...n, read: true }));
  emit();
}

// ── Timestamp formatter ─────────────────────────────────────────────

export function formatTimestamp(iso: string): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);

  if (diffMin < 1) return "Just now";
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHour < 24) return `${diffHour}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short" });
}
