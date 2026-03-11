// ── Support Ticket Types ────────────────────────────────────────────

export type TicketStatus = "Open" | "Closed";
export type TicketPriority = "Low" | "Medium" | "High" | "Not specified";
export type TicketCategory =
  | "Order Issue"
  | "Missing Items"
  | "Invoice Query"
  | "Payment Query"
  | "Product Issue"
  | "Other"
  | "Not specified";

export interface TicketAttachment {
  id: string;
  name: string;
  url: string;
  type: "image" | "pdf" | "other";
  size?: string; // e.g. "1.2 MB"
}

export interface TicketMessage {
  id: string;
  sender: "customer" | "support";
  senderName: string;
  message: string;
  timestamp: string;
  attachments?: TicketAttachment[];
}

export interface SupportTicket {
  id: string;
  ticketId: string;
  category: TicketCategory;
  subject: string;
  description: string;
  relatedDocument?: string; // INV-XXXX or PO-XXXX
  status: TicketStatus;
  priority: TicketPriority;
  unread: boolean;
  createdAt: string;
  closedAt?: string;
  lastUpdated: string;
  conversation: TicketMessage[];
}

// ── Helpers ─────────────────────────────────────────────────────────

export function getUnreadCount(tickets: SupportTicket[]): number {
  return tickets.filter((t) => t.unread).length;
}

export function canReopenTicket(ticket: SupportTicket): { allowed: boolean; message?: string } {
  if (ticket.status === "Open") return { allowed: false };
  if (!ticket.closedAt) return { allowed: true };

  const closed = new Date(ticket.closedAt);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - closed.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays > 90) {
    return {
      allowed: false,
      message: "This ticket was closed more than 90 days ago. Please create a new ticket.",
    };
  }
  return { allowed: true };
}

// ── Mock Data ───────────────────────────────────────────────────────

let _nextId = 7;
export function generateTicketId(): string {
  return `TK-${String(10000 + _nextId++).slice(0)}`;
}

export const SUPPORT_TICKETS: SupportTicket[] = [
  {
    id: "1",
    ticketId: "TK-10001",
    category: "Order Issue",
    subject: "Wrong sizes received in last shipment",
    description: "We received size M instead of size L for the Polo shirts in PO-2026-0121.",
    relatedDocument: "PO-2026-0121",
    status: "Open",
    priority: "High",
    unread: true,
    createdAt: "2026-02-20T10:30:00Z",
    lastUpdated: "2026-02-24T14:15:00Z",
    conversation: [
      {
        id: "m1",
        sender: "customer",
        senderName: "You",
        message: "We received size M instead of size L for the Polo shirts in PO-2026-0121. Please arrange a replacement.",
        timestamp: "2026-02-20T10:30:00Z",
        attachments: [
          { id: "a1", name: "wrong-sizes-photo.jpg", url: "/mock/wrong-sizes.jpg", type: "image", size: "1.2 MB" },
          { id: "a2", name: "packing-slip.pdf", url: "/mock/packing-slip.pdf", type: "pdf", size: "340 KB" },
        ],
      },
      {
        id: "m2",
        sender: "support",
        senderName: "Sarah K.",
        message: "Thank you for reporting this. We've checked the dispatch records and confirmed the sizing error. A replacement shipment with the correct sizes will be dispatched within 2 business days.",
        timestamp: "2026-02-21T09:00:00Z",
      },
      {
        id: "m3",
        sender: "customer",
        senderName: "You",
        message: "Thanks for the quick response. Should I return the incorrect items?",
        timestamp: "2026-02-22T11:00:00Z",
      },
      {
        id: "m4",
        sender: "support",
        senderName: "Sarah K.",
        message: "Yes, please use the prepaid return label we've sent to your email. The replacement has been dispatched — tracking number: TRK-884921.",
        timestamp: "2026-02-24T14:15:00Z",
        attachments: [
          { id: "a3", name: "return-label.pdf", url: "/mock/return-label.pdf", type: "pdf", size: "128 KB" },
        ],
      },
    ],
  },
  {
    id: "2",
    ticketId: "TK-10002",
    category: "Invoice Query",
    subject: "Discrepancy in invoice amount for INV-44690",
    description: "The invoice total doesn't match the PO amount. There seems to be a tax calculation issue.",
    relatedDocument: "INV-44690",
    status: "Open",
    priority: "Medium",
    unread: true,
    createdAt: "2026-02-18T08:45:00Z",
    lastUpdated: "2026-02-23T16:30:00Z",
    conversation: [
      {
        id: "m5",
        sender: "customer",
        senderName: "You",
        message: "The invoice total for INV-44690 doesn't match our PO amount. There seems to be a tax calculation issue.",
        timestamp: "2026-02-18T08:45:00Z",
      },
      {
        id: "m6",
        sender: "support",
        senderName: "Mike R.",
        message: "We're reviewing the invoice and will get back to you shortly with a corrected version if needed.",
        timestamp: "2026-02-23T16:30:00Z",
      },
    ],
  },
  {
    id: "3",
    ticketId: "TK-10003",
    category: "Missing Items",
    subject: "3 units missing from delivery",
    description: "PO-2026-0112 was supposed to include 60 Oxford Dress Shirts but we only received 57.",
    relatedDocument: "PO-2026-0112",
    status: "Closed",
    priority: "Medium",
    unread: false,
    createdAt: "2026-02-05T14:00:00Z",
    closedAt: "2026-02-15T10:00:00Z",
    lastUpdated: "2026-02-15T10:00:00Z",
    conversation: [
      {
        id: "m7",
        sender: "customer",
        senderName: "You",
        message: "PO-2026-0112 was supposed to include 60 Oxford Dress Shirts but we only received 57.",
        timestamp: "2026-02-05T14:00:00Z",
      },
      {
        id: "m8",
        sender: "support",
        senderName: "Sarah K.",
        message: "We've confirmed the shortage. 3 replacement units have been shipped and a credit note has been issued for the delay.",
        timestamp: "2026-02-10T09:30:00Z",
      },
      {
        id: "m9",
        sender: "customer",
        senderName: "You",
        message: "Received the replacements. Thanks for resolving this quickly.",
        timestamp: "2026-02-14T16:00:00Z",
      },
      {
        id: "m10",
        sender: "support",
        senderName: "Sarah K.",
        message: "Glad to hear it! Closing this ticket. Feel free to reopen if anything else comes up.",
        timestamp: "2026-02-15T10:00:00Z",
      },
    ],
  },
  {
    id: "4",
    ticketId: "TK-10004",
    category: "Product Issue",
    subject: "Color fading on Denim Jackets after first wash",
    description: "Multiple units from our last order are showing significant color fading after a single wash cycle.",
    status: "Open",
    priority: "Low",
    unread: false,
    createdAt: "2026-02-22T09:15:00Z",
    lastUpdated: "2026-02-22T09:15:00Z",
    conversation: [
      {
        id: "m11",
        sender: "customer",
        senderName: "You",
        message: "Multiple units of the Denim Jacket – Indigo Wash from our last order are showing significant color fading after a single wash cycle. This is affecting customer returns on our end. We've tested three separate units and all show the same issue after a standard cold wash. Our QA team has documented everything and we need this resolved before we can continue selling this product line. The fading is especially noticeable on the collar and sleeve areas.",
        timestamp: "2026-02-22T09:15:00Z",
        attachments: [
          { id: "a4", name: "fading-example-1.jpg", url: "/mock/fading-1.jpg", type: "image", size: "2.1 MB" },
          { id: "a5", name: "fading-example-2.jpg", url: "/mock/fading-2.jpg", type: "image", size: "1.8 MB" },
          { id: "a6", name: "qa-report.xlsx", url: "/mock/qa-report.xlsx", type: "other", size: "56 KB" },
        ],
      },
    ],
  },
  {
    id: "5",
    ticketId: "TK-10005",
    category: "Payment Query",
    subject: "Payment not reflected on invoice INV-44510",
    description: "We made a bank transfer of $10,000 on Dec 28 but the invoice still shows as overdue.",
    relatedDocument: "INV-44510",
    status: "Closed",
    priority: "High",
    unread: false,
    createdAt: "2026-01-10T11:00:00Z",
    closedAt: "2026-01-20T15:00:00Z",
    lastUpdated: "2026-01-20T15:00:00Z",
    conversation: [
      {
        id: "m12",
        sender: "customer",
        senderName: "You",
        message: "We made a bank transfer of $10,000 on Dec 28 for INV-44510 but the invoice still shows as overdue.",
        timestamp: "2026-01-10T11:00:00Z",
      },
      {
        id: "m13",
        sender: "support",
        senderName: "Mike R.",
        message: "The payment has been located and applied to your account. The invoice status has been updated. Apologies for the delay.",
        timestamp: "2026-01-15T14:00:00Z",
      },
      {
        id: "m14",
        sender: "customer",
        senderName: "You",
        message: "Confirmed — I can see the update now. Thank you.",
        timestamp: "2026-01-18T10:00:00Z",
      },
      {
        id: "m15",
        sender: "support",
        senderName: "Mike R.",
        message: "Great, closing this ticket. Let us know if you need anything else.",
        timestamp: "2026-01-20T15:00:00Z",
      },
    ],
  },
  {
    id: "6",
    ticketId: "TK-10006",
    category: "Other",
    subject: "Request for updated product catalog PDF",
    description: "Can you send us the latest Spring 2026 catalog? We need it for our retail planning.",
    status: "Closed",
    priority: "Low",
    unread: false,
    createdAt: "2025-10-15T08:00:00Z",
    closedAt: "2025-10-20T12:00:00Z",
    lastUpdated: "2025-10-20T12:00:00Z",
    conversation: [
      {
        id: "m16",
        sender: "customer",
        senderName: "You",
        message: "Can you send us the latest Spring 2026 catalog?",
        timestamp: "2025-10-15T08:00:00Z",
      },
      {
        id: "m17",
        sender: "support",
        senderName: "Sarah K.",
        message: "The Spring 2026 catalog has been emailed to your registered address. Let us know if you need anything else!",
        timestamp: "2025-10-20T12:00:00Z",
      },
    ],
  },
];
