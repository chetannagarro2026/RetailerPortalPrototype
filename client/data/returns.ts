// ── Returns & Claims Types ──────────────────────────────────────────

export type ClaimStatus = "Submitted" | "Under Review" | "Approved" | "Rejected" | "Completed";

export type ReturnReason = "Damaged" | "Wrong Item" | "Size Issue" | "Quality Issue" | "Other";

export const RETURN_REASONS: ReturnReason[] = [
  "Damaged",
  "Wrong Item",
  "Size Issue",
  "Quality Issue",
  "Other",
];

// Reasons that require photo evidence
export const EVIDENCE_REQUIRED_REASONS: ReturnReason[] = ["Damaged", "Quality Issue"];

export interface ReturnLineItem {
  itemId: string;
  productName: string;
  sku: string;
  deliveredQty: number;
  alreadyReturned: number;
  returnQty: number;
  approvedQty?: number; // set after review
  unitPrice: number;
  reason: ReturnReason | "";
}

export interface ClaimComment {
  id: string;
  sender: "customer" | "support" | "system";
  senderName: string;
  message: string;
  timestamp: string;
}

export interface ReturnClaim {
  id: string;
  claimId: string;
  invoiceNumber: string;
  returnType: "full" | "partial";
  items: ReturnLineItem[];
  status: ClaimStatus;
  claimedAmount: number;
  approvedAmount?: number;
  creditNoteNumber?: string;
  comment?: string; // overall submission comment
  attachments: string[]; // file names
  comments: ClaimComment[];
  createdAt: string;
  reviewedAt?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────

export function eligibleQty(item: ReturnLineItem): number {
  return item.deliveredQty - item.alreadyReturned;
}

export function lineClaimAmount(item: ReturnLineItem): number {
  return item.returnQty * item.unitPrice;
}

export function lineApprovedAmount(item: ReturnLineItem): number {
  return (item.approvedQty ?? 0) * item.unitPrice;
}

export function totalClaimedAmount(items: ReturnLineItem[]): number {
  return items.reduce((sum, i) => sum + lineClaimAmount(i), 0);
}

export function totalApprovedAmount(items: ReturnLineItem[]): number {
  return items.reduce((sum, i) => sum + lineApprovedAmount(i), 0);
}

export function totalReturnQty(items: ReturnLineItem[]): number {
  return items.reduce((sum, i) => sum + i.returnQty, 0);
}

export function itemsWithReturn(items: ReturnLineItem[]): ReturnLineItem[] {
  return items.filter((i) => i.returnQty > 0);
}

// Return allowed within 60 days of invoice date
export const RETURN_WINDOW_DAYS = 60;

export function canRaiseReturn(invoiceDate: string): boolean {
  const inv = new Date(invoiceDate);
  const now = new Date();
  const diff = Math.floor((now.getTime() - inv.getTime()) / (1000 * 60 * 60 * 24));
  return diff <= RETURN_WINDOW_DAYS;
}

// ── ID Generation ───────────────────────────────────────────────────

let _nextClaimId = 4;
export function generateClaimId(): string {
  return `CL-${String(10000 + _nextClaimId++)}`;
}

let _nextCNId = 314;
export function generateCreditNoteId(): string {
  return `CN-${String(_nextCNId++).padStart(5, "0")}`;
}

// ── Mock Data ───────────────────────────────────────────────────────

export const RETURN_CLAIMS: ReturnClaim[] = [
  {
    id: "1",
    claimId: "CL-10001",
    invoiceNumber: "INV-44756",
    returnType: "partial",
    items: [
      {
        itemId: "i5",
        productName: "Merino Wool Blazer – Charcoal",
        sku: "BLZ-CHR-42",
        deliveredQty: 20,
        alreadyReturned: 0,
        returnQty: 3,
        approvedQty: 3,
        unitPrice: 450,
        reason: "Damaged",
      },
    ],
    status: "Completed",
    claimedAmount: 1350,
    approvedAmount: 1350,
    creditNoteNumber: "CN-00312",
    comment: "3 blazers arrived with torn seams on the left shoulder.",
    attachments: ["damaged-blazer-1.jpg", "damaged-blazer-2.jpg"],
    comments: [
      {
        id: "rc1",
        sender: "customer",
        senderName: "You",
        message: "3 blazers arrived with torn seams on the left shoulder. Photos attached.",
        timestamp: "2026-02-12T10:00:00Z",
      },
      {
        id: "rc2",
        sender: "support",
        senderName: "Sarah K.",
        message: "We've reviewed the photos and confirmed the damage. Full claim approved. Credit note CN-00312 has been issued.",
        timestamp: "2026-02-14T09:30:00Z",
      },
      {
        id: "rc3",
        sender: "system",
        senderName: "System",
        message: "Credit Note CN-00312 generated for $1,350.00.",
        timestamp: "2026-02-14T09:31:00Z",
      },
    ],
    createdAt: "2026-02-12T10:00:00Z",
    reviewedAt: "2026-02-14T09:30:00Z",
  },
  {
    id: "2",
    claimId: "CL-10002",
    invoiceNumber: "INV-44690",
    returnType: "partial",
    items: [
      {
        itemId: "i8",
        productName: "Leather Belt – Brown",
        sku: "BLT-BRN-M",
        deliveredQty: 100,
        alreadyReturned: 0,
        returnQty: 10,
        approvedQty: 7,
        unitPrice: 65,
        reason: "Quality Issue",
      },
      {
        itemId: "i9",
        productName: "Silk Tie – Burgundy",
        sku: "TIE-BRG-OS",
        deliveredQty: 50,
        alreadyReturned: 0,
        returnQty: 5,
        approvedQty: 5,
        unitPrice: 75,
        reason: "Wrong Item",
      },
    ],
    status: "Approved",
    claimedAmount: 1025,
    approvedAmount: 830,
    creditNoteNumber: "CN-00313",
    comment: "Belts show premature cracking. Ties were wrong color (received navy instead of burgundy).",
    attachments: ["belt-quality.jpg", "tie-comparison.jpg"],
    comments: [
      {
        id: "rc4",
        sender: "customer",
        senderName: "You",
        message: "Belts show premature cracking on 10 units. Ties were wrong color — received navy instead of burgundy.",
        timestamp: "2026-02-18T14:00:00Z",
      },
      {
        id: "rc5",
        sender: "support",
        senderName: "Mike R.",
        message: "We've approved 7 of 10 belts (3 showed normal wear). All 5 ties approved. Partial approval — credit note CN-00313 issued for $830.",
        timestamp: "2026-02-22T11:00:00Z",
      },
    ],
    createdAt: "2026-02-18T14:00:00Z",
    reviewedAt: "2026-02-22T11:00:00Z",
  },
  {
    id: "3",
    claimId: "CL-10003",
    invoiceNumber: "INV-44612",
    returnType: "partial",
    items: [
      {
        itemId: "i10",
        productName: "Performance Running Shoe – Black",
        sku: "SHO-BLK-10",
        deliveredQty: 25,
        alreadyReturned: 0,
        returnQty: 4,
        unitPrice: 220,
        reason: "Size Issue",
      },
    ],
    status: "Under Review",
    claimedAmount: 880,
    comment: "4 pairs labelled size 10 but measure as size 9. Customers have returned them to us.",
    attachments: ["size-measurement.jpg"],
    comments: [
      {
        id: "rc6",
        sender: "customer",
        senderName: "You",
        message: "4 pairs labelled size 10 but measure as size 9. Customers have returned them to us.",
        timestamp: "2026-02-24T08:30:00Z",
      },
      {
        id: "rc7",
        sender: "support",
        senderName: "Sarah K.",
        message: "Thank you for reporting this. We're reviewing the batch records and will update you shortly.",
        timestamp: "2026-02-25T10:00:00Z",
      },
    ],
    createdAt: "2026-02-24T08:30:00Z",
  },
];
