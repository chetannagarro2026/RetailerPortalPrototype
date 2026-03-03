// ── Schemes & Promotions Data Layer ─────────────────────────────────

export type SchemeType = "Trade" | "Consumer";

export type SchemeStatus = "Active" | "Completed" | "Expired";

export type CalculationMethod =
  | "percentage_discount"
  | "volume_reward"
  | "slab_incentive"
  | "threshold_reward"
  | "linear_proportionate";

export type CreditNoteStatus = "Pending" | "Generated" | "Adjusted";

export interface SchemeSlab {
  min: number;
  max: number | null; // null = no upper limit
  label: string;
  benefitPercent?: number;
  benefitAmount?: number;
}

export interface SchemeInvoiceContribution {
  invoiceNumber: string;
  date: string;
  eligibleAmount: number;
  contributionToTarget: number;
}

export interface SchemeSkuContribution {
  sku: string;
  productName: string;
  quantity: number;
  amount: number;
}

export interface Scheme {
  id: string;
  name: string;
  type: SchemeType;
  status: SchemeStatus;
  validFrom: string;
  validTo: string;
  eligibilitySummary: string;
  eligibilityCriteria: string[];
  calculationMethod: CalculationMethod;
  calculationLabel: string;
  target: number;
  targetUnit: string; // "$" or "units"
  achieved: number;
  proportionateAllowed: boolean;
  currentEligibleBenefit: number;
  benefitEarned: number;
  slabs?: SchemeSlab[];
  excludedSkus?: string[];
  isSkuBased: boolean;
  invoiceContributions: SchemeInvoiceContribution[];
  skuContributions?: SchemeSkuContribution[];
  creditNoteStatus: CreditNoteStatus;
  creditNoteNumber?: string;
}

// ── Helpers ─────────────────────────────────────────────────────────

export function progressPercent(scheme: Scheme): number {
  if (scheme.target <= 0) return 0;
  return Math.min((scheme.achieved / scheme.target) * 100, 100);
}

export function remaining(scheme: Scheme): number {
  return Math.max(scheme.target - scheme.achieved, 0);
}

export function isTargetAchieved(scheme: Scheme): boolean {
  return scheme.achieved >= scheme.target;
}

export function currentSlab(scheme: Scheme): SchemeSlab | null {
  if (!scheme.slabs) return null;
  for (const slab of scheme.slabs) {
    if (scheme.achieved >= slab.min && (slab.max === null || scheme.achieved < slab.max)) {
      return slab;
    }
  }
  return null;
}

export function nextSlab(scheme: Scheme): SchemeSlab | null {
  if (!scheme.slabs) return null;
  for (const slab of scheme.slabs) {
    if (slab.min > scheme.achieved) return slab;
  }
  return null;
}

export function formatCurrency(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 });
}

export function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

// ── Calculation Method Labels ───────────────────────────────────────

export const CALC_METHOD_LABELS: Record<CalculationMethod, string> = {
  percentage_discount: "Percentage Discount on Billing Total",
  volume_reward: "Volume-Based Reward (Buy X Get Y)",
  slab_incentive: "Slab-Based Incentive",
  threshold_reward: "Threshold-Based Reward",
  linear_proportionate: "Linear Proportionate Reward",
};

// ── Mock Data ───────────────────────────────────────────────────────
// All invoice references must match existing invoices in client/data/invoices.ts
// CN references must match ledger entries in TransactionLedger

export const SCHEMES: Scheme[] = [
  {
    id: "SCH-001",
    name: "Q1 2026 Volume Incentive",
    type: "Trade",
    status: "Active",
    validFrom: "2026-01-01",
    validTo: "2026-03-31",
    eligibilitySummary: "Achieve $50,000 in purchases to earn 3% rebate on total billing.",
    eligibilityCriteria: [
      "Minimum order value of $500 per PO",
      "All product categories eligible",
      "Returns and credit notes are deducted from achievement",
    ],
    calculationMethod: "linear_proportionate",
    calculationLabel: "3% rebate on total purchases – proportionate payout at any achievement level",
    target: 50000,
    targetUnit: "$",
    achieved: 38645,
    proportionateAllowed: true,
    currentEligibleBenefit: 1159, // 3% of 38645
    benefitEarned: 1159,
    excludedSkus: [],
    isSkuBased: false,
    invoiceContributions: [
      { invoiceNumber: "INV-44821", date: "2026-02-24", eligibleAmount: 12276, contributionToTarget: 12276 },
      { invoiceNumber: "INV-44756", date: "2026-02-12", eligibleAmount: 14751, contributionToTarget: 14751 },
      { invoiceNumber: "INV-44690", date: "2026-01-28", eligibleAmount: 27478, contributionToTarget: 11618 },
    ],
    creditNoteStatus: "Pending",
  },
  {
    id: "SCH-002",
    name: "Winter Apparel Push",
    type: "Consumer",
    status: "Active",
    validFrom: "2025-12-01",
    validTo: "2026-02-28",
    eligibilitySummary: "Slab-based incentive on winter apparel purchases. Higher slabs unlock better rewards.",
    eligibilityCriteria: [
      "Only winter category SKUs eligible (Blazer, Overcoat, Puffer Vest, Fleece)",
      "Minimum 10 units per SKU per order",
      "Achievement measured in total eligible purchase value",
    ],
    calculationMethod: "slab_incentive",
    calculationLabel: "Slab-based: earn higher % at higher purchase tiers",
    target: 40000,
    targetUnit: "$",
    achieved: 29216,
    proportionateAllowed: false,
    currentEligibleBenefit: 1461, // 5% of 29216 (Slab 2)
    benefitEarned: 1461,
    slabs: [
      { min: 0, max: 15000, label: "Bronze", benefitPercent: 2 },
      { min: 15000, max: 30000, label: "Silver", benefitPercent: 5 },
      { min: 30000, max: 50000, label: "Gold", benefitPercent: 8 },
      { min: 50000, max: null, label: "Platinum", benefitPercent: 12 },
    ],
    excludedSkus: ["SOC-MIX-M", "TEE-LOG-L", "SHT-OLV-32"],
    isSkuBased: true,
    invoiceContributions: [
      { invoiceNumber: "INV-44756", date: "2026-02-12", eligibleAmount: 8100, contributionToTarget: 8100 },
      { invoiceNumber: "INV-44510", date: "2025-12-18", eligibleAmount: 12400, contributionToTarget: 12400 },
      { invoiceNumber: "INV-44690", date: "2026-01-28", eligibleAmount: 8716, contributionToTarget: 8716 },
    ],
    skuContributions: [
      { sku: "BLZ-CHR-42", productName: "Merino Wool Blazer – Charcoal", quantity: 20, amount: 9000 },
      { sku: "COT-CML-L", productName: "Cashmere Overcoat – Camel", quantity: 15, amount: 18000 },
      { sku: "VST-NAV-L", productName: "Down Puffer Vest – Navy", quantity: 40, amount: 12400 },
      { sku: "HOD-GRY-XL", productName: "Fleece Hoodie – Grey", quantity: 50, amount: 6000 },
    ],
    creditNoteStatus: "Pending",
  },
  {
    id: "SCH-003",
    name: "Loyalty Threshold Bonus",
    type: "Trade",
    status: "Active",
    validFrom: "2026-01-01",
    validTo: "2026-06-30",
    eligibilitySummary: "Earn a flat $2,000 bonus upon reaching $75,000 in total purchases.",
    eligibilityCriteria: [
      "All product categories eligible",
      "Target must be fully achieved — no proportionate payout",
      "Bonus credited as a single lump sum upon target completion",
    ],
    calculationMethod: "threshold_reward",
    calculationLabel: "Flat $2,000 reward upon reaching $75,000 threshold",
    target: 75000,
    targetUnit: "$",
    achieved: 38645,
    proportionateAllowed: false,
    currentEligibleBenefit: 0,
    benefitEarned: 0,
    isSkuBased: false,
    invoiceContributions: [
      { invoiceNumber: "INV-44821", date: "2026-02-24", eligibleAmount: 12276, contributionToTarget: 12276 },
      { invoiceNumber: "INV-44798", date: "2026-02-18", eligibleAmount: 6853, contributionToTarget: 6853 },
      { invoiceNumber: "INV-44756", date: "2026-02-12", eligibleAmount: 14751, contributionToTarget: 14751 },
      { invoiceNumber: "INV-44690", date: "2026-01-28", eligibleAmount: 27478, contributionToTarget: 4765 },
    ],
    creditNoteStatus: "Pending",
  },
  {
    id: "SCH-004",
    name: "FW25 Early Bird Discount",
    type: "Trade",
    status: "Completed",
    validFrom: "2025-11-01",
    validTo: "2025-12-31",
    eligibilitySummary: "5% discount on all orders placed before Dec 31, 2025. Target: $20,000.",
    eligibilityCriteria: [
      "All categories eligible",
      "Orders must be placed within validity period",
      "Discount applied as post-facto credit note",
    ],
    calculationMethod: "percentage_discount",
    calculationLabel: "5% flat discount on total billing amount",
    target: 20000,
    targetUnit: "$",
    achieved: 27071,
    proportionateAllowed: true,
    currentEligibleBenefit: 1354, // 5% of 27071
    benefitEarned: 1354,
    isSkuBased: false,
    invoiceContributions: [
      { invoiceNumber: "INV-44510", date: "2025-12-18", eligibleAmount: 18216, contributionToTarget: 18216 },
      { invoiceNumber: "INV-44481", date: "2025-12-05", eligibleAmount: 8855, contributionToTarget: 8855 },
    ],
    creditNoteStatus: "Adjusted",
    creditNoteNumber: "CN-00312",
  },
  {
    id: "SCH-005",
    name: "Polo Collection Volume Push",
    type: "Consumer",
    status: "Active",
    validFrom: "2026-02-01",
    validTo: "2026-04-30",
    eligibilitySummary: "Buy 80+ Polo units and receive 10 bonus units free (Buy X Get Y).",
    eligibilityCriteria: [
      "Only Premium Cotton Polo SKUs eligible (POL-NAV-L, POL-WHT-M)",
      "Minimum 80 units total across eligible SKUs",
      "Bonus units shipped separately upon target completion",
    ],
    calculationMethod: "volume_reward",
    calculationLabel: "Buy 80 units, get 10 bonus units free",
    target: 80,
    targetUnit: "units",
    achieved: 100,
    proportionateAllowed: false,
    currentEligibleBenefit: 1240, // 10 units × $124
    benefitEarned: 1240,
    isSkuBased: true,
    invoiceContributions: [
      { invoiceNumber: "INV-44821", date: "2026-02-24", eligibleAmount: 12276, contributionToTarget: 100 },
    ],
    skuContributions: [
      { sku: "POL-NAV-L", productName: "Premium Cotton Polo – Navy", quantity: 50, amount: 6200 },
      { sku: "POL-WHT-M", productName: "Premium Cotton Polo – White", quantity: 50, amount: 6200 },
    ],
    creditNoteStatus: "Generated",
    creditNoteNumber: "CN-00313",
  },
];

/** Get only active schemes */
export function getActiveSchemes(): Scheme[] {
  return SCHEMES.filter((s) => s.status === "Active");
}

/** Get schemes with earned benefits (for achievements tab) */
export function getAchievements(): Scheme[] {
  return SCHEMES.filter((s) => s.benefitEarned > 0 || s.status === "Completed");
}

/** Find scheme by ID */
export function getSchemeById(id: string): Scheme | null {
  return SCHEMES.find((s) => s.id === id) || null;
}
