import { useState, useMemo } from "react";
import { FileTextOutlined, SearchOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { INVOICES, type InvoiceStatus } from "../data/invoices";
import InvoicesTable from "../components/invoices/InvoicesTable";
import DateRangeFilter, { getFYStart, getFYEnd, toISODate, type DateRange } from "../components/credit-overview/DateRangeFilter";

// ── Tab definitions ─────────────────────────────────────────────────

const TABS: { key: "All" | InvoiceStatus; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Overdue", label: "Overdue" },
  { key: "Partially Paid", label: "Partially Paid" },
  { key: "Paid", label: "Paid" },
];

// ── Page ────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const config = activeBrandConfig;
  const today = useMemo(() => new Date(), []);
  const [activeTab, setActiveTab] = useState<"All" | InvoiceStatus>("All");
  const [dateRange, setDateRange] = useState<DateRange>({
    start: getFYStart(today),
    end: getFYEnd(today),
  });
  const [search, setSearch] = useState("");

  const startISO = toISODate(dateRange.start);
  const endISO = toISODate(dateRange.end);

  // Counts per tab
  const counts = useMemo(() => {
    const map: Record<string, number> = { All: INVOICES.length };
    for (const t of TABS) if (t.key !== "All") map[t.key] = 0;
    for (const inv of INVOICES) map[inv.status] = (map[inv.status] || 0) + 1;
    return map;
  }, []);

  // Filtered list
  const filtered = useMemo(() => {
    let list = INVOICES;

    // Tab filter
    if (activeTab !== "All") list = list.filter((inv) => inv.status === activeTab);

    // Date range filter
    list = list.filter((inv) => inv.invoiceDate >= startISO && inv.invoiceDate <= endISO);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((inv) => inv.invoiceNumber.toLowerCase().includes(q));
    }

    // Sort latest first
    return [...list].sort((a, b) => (b.invoiceDate > a.invoiceDate ? 1 : -1));
  }, [activeTab, startISO, endISO, search]);

  // ── Empty state ─────────────────────────────────────────────────

  if (INVOICES.length === 0) {
    return (
      <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "64px 24px", boxSizing: "border-box" }} className="text-center">
        <FileTextOutlined className="text-5xl mb-4" style={{ color: config.secondaryColor }} />
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          No Invoices Available
        </h1>
        <p className="text-sm" style={{ color: config.secondaryColor }}>
          Invoices generated for your orders will appear here.
        </p>
      </div>
    );
  }

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "24px 24px", boxSizing: "border-box" }}>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-xl font-bold m-0" style={{ color: config.primaryColor }}>
          Invoices
        </h1>
      </div>

      {/* Status Segmented Filter */}
      <div className="mb-6">
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
      </div>

      {/* Filter Row */}
      <div className="flex items-center justify-start gap-3 mb-4 relative z-10">
        <DateRangeFilter value={dateRange} onChange={setDateRange} />

        <div className="flex-1" />

        <div className="relative">
          <SearchOutlined
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ fontSize: 13, color: config.secondaryColor }}
          />
          <input
            type="text"
            placeholder="Search by Invoice #"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm rounded-lg pl-8 pr-3 py-2 outline-none"
            style={{
              border: `1px solid ${config.borderColor}`,
              color: config.primaryColor,
              width: 200,
              boxSizing: "border-box",
            }}
          />
        </div>
      </div>

      {/* Table */}
      <InvoicesTable invoices={filtered} />
    </div>
  );
}
