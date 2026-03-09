// ─── Business Identity ───
export interface BusinessIdentity {
  legalName: string;
  tradeName: string;
  businessType: string;
  primaryContact: string;
  primaryEmail: string;
  phone: string;
  billingEmail: string;
  gstNumber: string;
  gstStatus: "Verified" | "Pending" | "Rejected";
  accountStatus: "Active" | "Suspended" | "Pending KYC";
  accountId: string;
  onboardingDate: string;
  kycApproved: boolean;
  distributorAssigned: boolean;
}

export const businessIdentity: BusinessIdentity = {
  legalName: "Macy's Inc.",
  tradeName: "Macy's Department Store",
  businessType: "Retailer",
  primaryContact: "John Richardson",
  primaryEmail: "buying@macys.com",
  phone: "(212) 695-4400",
  billingEmail: "ap@macys.com",
  gstNumber: "27AABCU9603R1ZM",
  gstStatus: "Verified",
  accountStatus: "Active",
  accountId: "CB-RET-00482",
  onboardingDate: "2024-03-15",
  kycApproved: true,
  distributorAssigned: true,
};

// ─── Credit Terms ───
export interface CreditTerms {
  creditLimit: number;
  paymentTerms: string;
  overlimitPolicy: string;
  gracePeriod: string;
  interestOnOverdue: string;
  specialPricing: boolean;
  lastCreditReview: string;
  creditManagedBy: string;
  currentUtilization: number;
  totalCreditLimit: number;
}

export const creditTerms: CreditTerms = {
  creditLimit: 150000,
  paymentTerms: "Net 30",
  overlimitPolicy: "Orders beyond credit require distributor approval",
  gracePeriod: "7 days",
  interestOnOverdue: "1.5% per month after grace period",
  specialPricing: true,
  lastCreditReview: "2025-11-20",
  creditManagedBy: "Centric Brands Distribution",
  currentUtilization: 92000,
  totalCreditLimit: 150000,
};

// ─── Addresses ───
export interface Address {
  id: string;
  type: "Billing" | "Shipping" | "Warehouse";
  label: string;
  line1: string;
  line2: string;
  city: string;
  state: string;
  zip: string;
  country: string;
  contactPerson: string;
  phone: string;
  email: string;
  isDefault: boolean;
}

export const addresses: Address[] = [
  {
    id: "addr-1",
    type: "Billing",
    label: "Corporate HQ",
    line1: "151 West 34th Street",
    line2: "Floor 12",
    city: "New York",
    state: "NY",
    zip: "10001",
    country: "United States",
    contactPerson: "Accounts Payable Dept",
    phone: "(212) 695-4400",
    email: "ap@macys.com",
    isDefault: true,
  },
  {
    id: "addr-2",
    type: "Shipping",
    label: "East Coast DC",
    line1: "500 Distribution Way",
    line2: "Building A",
    city: "Secaucus",
    state: "NJ",
    zip: "07094",
    country: "United States",
    contactPerson: "Mike Torres",
    phone: "(201) 555-0180",
    email: "receiving-east@macys.com",
    isDefault: true,
  },
  {
    id: "addr-3",
    type: "Shipping",
    label: "West Coast DC",
    line1: "2200 Logistics Blvd",
    line2: "",
    city: "City of Industry",
    state: "CA",
    zip: "91745",
    country: "United States",
    contactPerson: "Lisa Chen",
    phone: "(626) 555-0290",
    email: "receiving-west@macys.com",
    isDefault: false,
  },
  {
    id: "addr-4",
    type: "Warehouse",
    label: "Returns Processing",
    line1: "800 Returns Pkwy",
    line2: "Suite 100",
    city: "Edison",
    state: "NJ",
    zip: "08817",
    country: "United States",
    contactPerson: "David Park",
    phone: "(732) 555-0340",
    email: "returns@macys.com",
    isDefault: true,
  },
];

// ─── KYC & Tax ───
export interface KycDocument {
  id: string;
  type: string;
  number: string;
  status: "Verified" | "Pending" | "Rejected" | "Expired";
  expiryDate: string;
  fileName: string;
  rejectionReason?: string;
}

export const kycDocuments: KycDocument[] = [
  {
    id: "kyc-1",
    type: "GST Certificate",
    number: "27AABCU9603R1ZM",
    status: "Verified",
    expiryDate: "2027-03-31",
    fileName: "gst_certificate_2024.pdf",
  },
  {
    id: "kyc-2",
    type: "Doctor Registration",
    number: "N/A",
    status: "Pending",
    expiryDate: "",
    fileName: "",
  },
];

// ─── Distributors ───
export interface Distributor {
  id: string;
  name: string;
  territory: string;
  assignedBrands: string;
  creditTerms: string;
  accountManager: string;
  contactEmail: string;
  status: "Active" | "Inactive" | "Pending";
}

export const distributors: Distributor[] = [
  {
    id: "dist-1",
    name: "Centric Brands Distribution",
    territory: "Northeast US",
    assignedBrands: "Arrow, Jessica Simpson, Buffalo",
    creditTerms: "Net 30 / $150,000",
    accountManager: "Sarah Mitchell",
    contactEmail: "s.mitchell@centricbrands.com",
    status: "Active",
  },
  {
    id: "dist-2",
    name: "Centric West LLC",
    territory: "West Coast US",
    assignedBrands: "Joe's Jeans, Herve Leger",
    creditTerms: "Net 45 / $75,000",
    accountManager: "James Wu",
    contactEmail: "j.wu@centricwest.com",
    status: "Active",
  },
];

// ─── Agreements ───
export interface Agreement {
  id: string;
  name: string;
  distributorBrand: string;
  type: "Trade" | "SLA" | "Pricing";
  effectiveDate: string;
  expiryDate: string;
  status: "Active" | "Expired" | "Renewal Required";
  fileName: string;
}

export const agreements: Agreement[] = [
  {
    id: "agr-1",
    name: "Master Trade Agreement",
    distributorBrand: "Centric Brands",
    type: "Trade",
    effectiveDate: "2024-04-01",
    expiryDate: "2027-03-31",
    status: "Active",
    fileName: "master_trade_2024.pdf",
  },
  {
    id: "agr-2",
    name: "Seasonal Pricing Schedule",
    distributorBrand: "Arrow",
    type: "Pricing",
    effectiveDate: "2025-09-01",
    expiryDate: "2026-03-15",
    status: "Renewal Required",
    fileName: "pricing_arrow_ss26.pdf",
  },
  {
    id: "agr-3",
    name: "Service Level Agreement",
    distributorBrand: "Centric West LLC",
    type: "SLA",
    effectiveDate: "2024-06-01",
    expiryDate: "2026-06-01",
    status: "Active",
    fileName: "sla_centric_west.pdf",
  },
];

// ─── Compliance Documents ───
export interface ComplianceDocument {
  id: string;
  name: string;
  type: string;
  uploadedDate: string;
  expiryDate: string;
  status: "Valid" | "Expiring Soon" | "Expired" | "Under Review";
  fileName: string;
}

export const complianceDocuments: ComplianceDocument[] = [
  {
    id: "doc-1",
    name: "GST Registration Certificate",
    type: "Tax",
    uploadedDate: "2024-03-15",
    expiryDate: "2027-03-31",
    status: "Valid",
    fileName: "gst_cert.pdf",
  },
  {
    id: "doc-2",
    name: "Business Registration",
    type: "Legal",
    uploadedDate: "2024-03-15",
    expiryDate: "2029-12-31",
    status: "Valid",
    fileName: "business_reg.pdf",
  },
  {
    id: "doc-3",
    name: "Insurance Certificate",
    type: "Insurance",
    uploadedDate: "2025-01-10",
    expiryDate: "2026-03-10",
    status: "Expiring Soon",
    fileName: "insurance_2025.pdf",
  },
  {
    id: "doc-4",
    name: "W-9 Form",
    type: "Tax",
    uploadedDate: "2024-03-15",
    expiryDate: "",
    status: "Valid",
    fileName: "w9_macys.pdf",
  },
];
