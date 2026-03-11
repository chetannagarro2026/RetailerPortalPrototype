import { useState, useMemo, useEffect, useRef, useCallback } from "react";
import { PlusOutlined, SearchOutlined, CustomerServiceOutlined, LoadingOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../components/toast/ToastProvider";
import {
  searchCases,
  getCurrentStatus,
  type Case,
} from "../services/caseManagementService";
import SupportTicketsTable from "../components/support/SupportTicketsTable";

type TabKey = "All" | "OPEN" | "RESOLVED" | "ASSIGNED";

const TABS: { key: TabKey; label: string }[] = [
  { key: "All", label: "All" },
  { key: "OPEN", label: "Open" },
  { key: "ASSIGNED", label: "Assigned" },
  { key: "RESOLVED", label: "Resolved" },
];

const PAGE_SIZE = 10;

interface Props {
  onCreateTicket: () => void;
}

export default function SupportTicketsPage({ onCreateTicket }: Props) {
  const config = activeBrandConfig;
  const { accessToken } = useAuth();
  const { showToast } = useToast();
  
  const [activeTab, setActiveTab] = useState<TabKey>("All");
  const [search, setSearch] = useState("");
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [totalRecords, setTotalRecords] = useState(0);
  const [pageNo, setPageNo] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  
  const observerTarget = useRef<HTMLDivElement>(null);
  const isInitialMount = useRef(true);

  // Fetch cases
  const fetchCases = useCallback(
    async (page: number, isInitial: boolean = false) => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        if (isInitial) setLoading(true);
        else setLoadingMore(true);

        const payload: any = {
          pageNo: page,
          pageSize: PAGE_SIZE,
          orderBy: "DESC" as const,
          sortBy: "modifiedOn",
        };

        // Add status filter if not "All"
        if (activeTab !== "All") {
          payload.status = [activeTab];
        }

        const response = await searchCases(payload, accessToken);
        const newCases = response.paginatedCaseList || [];
        const total = response.totalRecords || 0;

        if (isInitial) {
          setCases(newCases);
        } else {
          setCases((prev) => [...prev, ...newCases]);
        }

        setTotalRecords(total);
        setPageNo(page);
        setHasMore(newCases.length === PAGE_SIZE);
      } catch (error) {
        console.error("Failed to fetch cases:", error);
        showToast("error", "Failed to load support tickets");
      } finally {
        if (isInitial) setLoading(false);
        else setLoadingMore(false);
      }
    },
    [accessToken, activeTab, showToast]
  );

  // Initial load
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      fetchCases(0, true);
    }
  }, [fetchCases]);

  // Reset when tab changes
  useEffect(() => {
    setPageNo(0);
    setHasMore(true);
    setCases([]);
    setLoading(true);
    fetchCases(0, true);
  }, [activeTab, fetchCases]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          fetchCases(pageNo + 1, false);
        }
      },
      { threshold: 0.1 }
    );

    if (observerTarget.current) {
      observer.observe(observerTarget.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [hasMore, loadingMore, loading, pageNo, fetchCases]);

  const counts = useMemo(() => {
    const map: Record<string, number> = {
      All: totalRecords,
      OPEN: 0,
      ASSIGNED: 0,
      RESOLVED: 0,
    };

    for (const c of cases) {
      const status = getCurrentStatus(c.caseStatuses);
      if (status === "OPEN") map.OPEN++;
      if (status === "ASSIGNED") map.ASSIGNED++;
      if (status === "RESOLVED") map.RESOLVED++;
    }

    return map;
  }, [cases, totalRecords]);

  const filtered = useMemo(() => {
    let list = [...cases];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          c.id.toString().includes(q) ||
          c.caseDescription.toLowerCase().includes(q)
      );
    }

    return list;
  }, [cases, search]);

  if (loading) {
    return (
      <div
        style={{
          width: "100%",
          maxWidth: 1280,
          margin: "0 auto",
          padding: "64px 24px",
          boxSizing: "border-box",
        }}
        className="flex items-center justify-center"
      >
        <LoadingOutlined style={{ fontSize: 24, color: config.primaryColor }} />
        <span className="ml-3">Loading support tickets...</span>
      </div>
    );
  }

  if (cases.length === 0 && activeTab === "All") {
    return (
      <div
        style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "64px 24px", boxSizing: "border-box" }}
        className="text-center"
      >
        <CustomerServiceOutlined className="text-5xl mb-4" style={{ color: config.secondaryColor }} />
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          No Support Tickets
        </h1>
        <p className="text-sm mb-6" style={{ color: config.secondaryColor }}>
          You haven't created any support tickets yet.
        </p>
        <button
          onClick={onCreateTicket}
          className="text-sm font-medium px-6 py-2.5 rounded-lg text-white border-none cursor-pointer inline-flex items-center gap-2"
          style={{ backgroundColor: config.primaryColor }}
        >
          <PlusOutlined style={{ fontSize: 12 }} />
          Create Ticket
        </button>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "24px 24px", boxSizing: "border-box" }}>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl font-bold m-0" style={{ color: config.primaryColor }}>
          Support Tickets
        </h1>
        <button
          onClick={onCreateTicket}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer text-white border-none transition-colors"
          style={{ backgroundColor: config.primaryColor }}
        >
          <PlusOutlined style={{ fontSize: 12 }} />
          Create Ticket
        </button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center gap-3 mb-4">
        <div
          className="inline-flex rounded-lg overflow-hidden"
          style={{ border: `1px solid ${config.borderColor}` }}
        >
          {TABS.map((tab, idx) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className="px-4 py-2 text-xs font-medium cursor-pointer transition-colors whitespace-nowrap"
                style={{
                  backgroundColor: isActive ? config.primaryColor : "#fff",
                  color: isActive ? "#fff" : config.secondaryColor,
                  border: "none",
                  borderRight: idx < TABS.length - 1 ? `1px solid ${config.borderColor}` : "none",
                }}
              >
                {tab.label} ({counts[tab.key] || 0})
              </button>
            );
          })}
        </div>

        <div className="flex-1" />

        <div className="relative">
          <SearchOutlined
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ fontSize: 13, color: config.secondaryColor }}
          />
          <input
            type="text"
            placeholder="Search by Ticket ID or Subject"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm rounded-lg pl-8 pr-3 py-2 outline-none"
            style={{
              border: `1px solid ${config.borderColor}`,
              color: config.primaryColor,
              width: 260,
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <SupportTicketsTable tickets={filtered} />

      {/* Infinite Scroll Sentinel */}
      {hasMore && (
        <div
          ref={observerTarget}
          className="flex justify-center py-8"
        >
          {loadingMore && (
            <>
              <LoadingOutlined style={{ fontSize: 24, color: config.primaryColor, marginRight: 12 }} />
              <span style={{ color: config.secondaryColor }}>Loading more tickets...</span>
            </>
          )}
        </div>
      )}

      {!hasMore && cases.length > 0 && (
        <div className="flex justify-center py-8">
          <span style={{ color: config.secondaryColor, fontSize: 14 }}>No more tickets to load</span>
        </div>
      )}
    </div>
  );
}
