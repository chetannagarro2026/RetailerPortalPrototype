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
  bankDetails: any[];
  addresses: BusinessAccountAddress[];
  contracts: any[];
  taxIdentifications: any[];
  attributeMappings: any[];
  accountUsers: any[];
  statusTimeLine: any[];
  linkedAccounts: any[];
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
