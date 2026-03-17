/**
 * Business Account Service
 * API calls related to business accounts and account configuration
 */

import { apiConfig } from "../config/apiConfig";
import { fetchAPI } from "./api";

// ── Types ───────────────────────────────────────────────────────────

export interface BusinessAccountAddress {
  id: number;
  addrType: string;
  addrLine1: string;
  addrLine2: string | null;
  addrLine3: string | null;
  city: string;
  state: string;
  country: string;
  zipCode: string;
  longitude: number | null;
  latitude: number | null;
}

export interface BusinessAccountType {
  typeId: number;
  accountType: string;
  typeDescription: string;
  typeCode: string;
  approvalRequired: boolean;
  bankDetailsRequired: boolean;
  taxDetailsRequired: boolean;
  contractDetailsRequired: boolean;
  parentAccountRequired: boolean;
  attributes: any[];
  defaultRoleId: number | null;
  defaultRoleName: string | null;
  level: number;
}

export interface BankDetail {
  id: number;
  bankName: string;
  bankAccNum: string;
  iban: string | null;
  swiftBic: string | null;
  bankAccType: string | null;
  bankAccHolderName: string | null;
  bankAccHolderAddress: string | null;
  ifsc: string | null;
  branchAddress: string | null;
  country: string | null;
  currencyCode: string | null;
  isPrimary: boolean;
}

export interface TaxIdentification {
  taxId: number;
  taxType: {
    taxTypeId: number;
    type: string;
    description: string;
    countryCode: string;
    format: string;
  };
  taxIdentifier: string;
  state: string;
  validFrom: string;
  validTo: string;
  isPrimary: boolean;
  status: string;
  taxCertificateNumber: string | null;
  registrationDate: string | null;
  taxPayerType: string | null;
  panNumber: string;
  einvoiceEnabled: boolean | null;
}

export interface Contract {
  contractId: number;
  contractNumber: string;
  contractTitle: string;
  contractType: string;
  description: string;
  customerTier: string;
  creationDate: string | null;
  effectiveDate: string | null;
  expiryDate: string | null;
  status: string;
  renewalType: string;
  renewalPeriod: number;
  lastRenewalDate: string | null;
  signedDate: string | null;
  signedBy: string;
  governingLawCountry: string | null;
  additionalClauses: string | null;
  currency: string;
  pmtFreq: string;
  pmtTerms: string;
}

export interface AccountUser {
  id: number;
  userId: number;
  userName: string;
  userFirstName: string;
  userLastName: string;
  userType: string;
  userRole: string[];
  userDesignation: string | null;
}

export interface LinkedAccount {
  mappingId: number;
  parentAccountId: number;
  parentAccountType: string;
  childAccountId: number;
  childAccountType: string;
  active: boolean;
}

export interface StatusTimeLine {
  accountId: number;
  status: string;
  changeDateTime: string;
  reason: string | null;
  fromDate: string;
  toDate: string | null;
  createdBy: string;
  modifiedBy: string;
}

export interface BusinessAccount {
  accountId: number;
  accountType: BusinessAccountType;
  accountClasses: any[];
  legalName: string;
  tradeName: string;
  description: string;
  brand: string;
  region: string;
  accountStatus: string;
  url: string | null;
  contactPerson: string;
  email: string;
  phoneNumber: string;
  state: string;
  country: string;
  businessType: string;
  businessRegNo: string | null;
  sector: string | null;
  businessAccId: string;
  version: number;
  isActive: boolean;
  caseId: string | null;
  documents: any[];
  bankDetails: BankDetail[];
  addresses: BusinessAccountAddress[];
  contracts: Contract[];
  taxIdentifications: TaxIdentification[];
  attributeMappings: any[];
  accountUsers: AccountUser[];
  statusTimeLine: StatusTimeLine[];
  linkedAccounts: LinkedAccount[];
  readOnlyAttributes: any;
}

/**
 * Fetch business accounts by ID list
 * @param ids - Comma-separated list of account IDs (e.g., "9038,9039")
 */
export function fetchBusinessAccountsByIdList(
  ids: string
): Promise<BusinessAccount[]> {
  return fetchAPI<BusinessAccount[]>(
    apiConfig.endpoints.businessAccountsByIdList(ids)
  );
}

/**
 * Fetch business account by ID directly
 * @param accountId - Account ID
 */
export function fetchBusinessAccountById(
  accountId: number
): Promise<BusinessAccount> {
  return fetchAPI<BusinessAccount>(
    apiConfig.endpoints.businessAccountById(accountId)
  );
}

/**
 * Fetch current user's business account by account ID
 * @param accountId - Account ID from user context
 */
export function getCurrentBusinessAccount(
  accountId: number
): Promise<BusinessAccount> {
  return fetchBusinessAccountById(accountId);
}

/**
 * Get distributor ID from business account's linked accounts
 * @param accountId - Account ID to fetch
 * @returns Promise with distributor account ID or null if not found
 */
export async function getDistributorIdForAccount(
  accountId: number
): Promise<number | null> {
  try {
    const account = await fetchBusinessAccountById(accountId);
    const distributorLink = account.linkedAccounts?.find(
      (link) => link.parentAccountType === "DISTRIBUTOR"
    );
    return distributorLink?.parentAccountId ?? null;
  } catch (error) {
    console.error("Failed to fetch distributor ID:", error);
    return null;
  }
}
