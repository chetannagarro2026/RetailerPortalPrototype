import { apiConfig } from "../config/apiConfig";

const API_SUBSCRIPTION_KEY = import.meta.env.VITE_AZURE_APIM_SUBSCRIPTION_KEY || "5881e307d1704219ae2e3759e6c5f1f0";

// ── Type Definitions ────────────────────────────────────────────────────

export interface CaseStatus {
  id: number;
  createdOn: string;
  createdBy: string | null;
  modifiedOn: string;
  modifiedBy: string | null;
  status: string;
  caseId: number;
  toDate: string | null;
  fromDate: string;
}

export interface CaseNote {
  id: number;
  createdOn: string;
  createdBy: string;
  notes: string;
}

export interface CaseAssignee {
  id: number;
  caseId: number;
  assignedTo: string;
  createdOn: string;
  fromDate: string;
  toDate: string | null;
}

export interface CaseAttribute {
  id: number;
  caseId: number;
  attributeKey: string;
  attributeValue: string;
}

export interface CaseTypeDto {
  id: number;
  createdOn: string;
  createdBy: string | null;
  modifiedOn: string;
  modifiedBy: string | null;
  caseType: string;
  caseId: string;
}

export interface Case {
  id: number;
  createdOn: string;
  createdBy: string;
  modifiedOn: string;
  modifiedBy: string;
  caseDescription: string;
  caseTypeDto: CaseTypeDto;
  notes: CaseNote[];
  caseStatuses: CaseStatus[];
  sla: any | null;
  caseAssinees: CaseAssignee[];
  caseProcessInstance: any[];
  caseAttributes: CaseAttribute[];
}

export interface CaseSearchResponse {
  paginatedCaseList: Case[];
  totalRecords: number;
  noOfRows: number;
}

export interface CaseSearchPayload {
  pageNo: number;
  pageSize: number;
  orderBy: "ASC" | "DESC";
  sortBy: string;
  status: string[];
  startDate: string | null;
  endDate: string | null;
  caseId: number | null;
  omsOrderId: string | null;
}

export interface AddNotePayload {
  caseId: string | number;
  note: string;
  noteBy: string;
}

export interface AddNoteResponse {
  status: string;
  message: string;
}

// ── Helper Functions ────────────────────────────────────────────────

/**
 * Get the current active status from the caseStatuses array
 * The current status is the one with toDate = null
 */
export function getCurrentStatus(caseStatuses: CaseStatus[]): string {
  const activeStatus = caseStatuses.find((status) => status.toDate === null);
  return activeStatus?.status || "UNKNOWN";
}

/**
 * Format status for display
 */
export function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    OPEN: "Open",
    ASSIGNED: "Assigned",
    RESOLVED: "Resolved",
    CLOSED: "Closed",
    IN_PROGRESS: "In Progress",
    PENDING: "Pending",
  };
  return statusMap[status] || status;
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: string): string {
  const colorMap: Record<string, string> = {
    OPEN: "#1890ff",
    ASSIGNED: "#faad14",
    RESOLVED: "#52c41a",
    CLOSED: "#8c8c8c",
    IN_PROGRESS: "#722ed1",
    PENDING: "#fa8c16",
  };
  return colorMap[status] || "#8c8c8c";
}

// ── API Service Functions ────────────────────────────────────────────

/**
 * Search for cases with pagination and filters
 */
export async function searchCases(
  payload: Partial<CaseSearchPayload>,
  accessToken: string
): Promise<CaseSearchResponse> {
  try {
    const defaultPayload: CaseSearchPayload = {
      pageNo: 0,
      pageSize: 20,
      orderBy: "DESC",
      sortBy: "createdOn",
      status: [],
      startDate: null,
      endDate: null,
      caseId: null,
      omsOrderId: null,
    };

    const response = await fetch(apiConfig.endpoints.caseSearch, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Ocp-Apim-Subscription-Key": API_SUBSCRIPTION_KEY,
      },
      body: JSON.stringify({ ...defaultPayload, ...payload }),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: CaseSearchResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to search cases:", error);
    throw error;
  }
}

/**
 * Get case details by ID
 */
export async function getCaseById(
  caseId: number,
  accessToken: string
): Promise<Case> {
  try {
    const response = await fetch(apiConfig.endpoints.caseById(caseId), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Ocp-Apim-Subscription-Key": API_SUBSCRIPTION_KEY,
      },
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: Case = await response.json();
    return data;
  } catch (error) {
    console.error(`Failed to fetch case ${caseId}:`, error);
    throw error;
  }
}

/**
 * Add a note/comment to a case
 */
export async function addNoteToCase(
  payload: AddNotePayload,
  accessToken: string
): Promise<AddNoteResponse> {
  try {
    const response = await fetch(apiConfig.endpoints.caseUpdateNotes, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
        "Ocp-Apim-Subscription-Key": API_SUBSCRIPTION_KEY,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const data: AddNoteResponse = await response.json();
    return data;
  } catch (error) {
    console.error("Failed to add note to case:", error);
    throw error;
  }
}
