import { useState, useMemo, useRef, useEffect } from "react";
import { FileTextOutlined, SearchOutlined, DownOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { INVOICES, type InvoiceStatus } from "../data/invoices";
import InvoicesTable from "../components/invoices/InvoicesTable";

// ── Tab definitions ─────────────────────────────────────────────────

const TABS: { key: "All" | InvoiceStatus; label: string }[] = [
  { key: "All", label: "All" },
  { key: "Overdue", label: "Overdue" },
  { key: "Partially Paid", label: "Partially Paid" },
  { key: "Paid", label: "Paid" },
];

// ── Date range presets ──────────────────────────────────────────────

const DATE_RANGES = [
  { key: "all", label: "All Time" },
  { key: "30", label: "Last 30 Days" },
  { key: "90", label: "Last 90 Days" },
  { key: "fy", label: "This Financial Year" },
] as const;

type DateRangeKey = (typeof DATE_RANGES)[number]["key"];

function getDateCutoff(key: DateRangeKey): Date | null {
  const today = new Date();
  if (key === "all") return null;
  if (key === "30") { today.setDate(today.getDate() - 30); return today; }
  if (key === "90") { today.setDate(today.getDate() - 90); return today; }
  // FY: Apr 1 of current or previous year
  const year = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  return new Date(year, 3, 1);
}

// ── Page ────────────────────────────────────────────────────────────

export default function InvoicesPage() {
  const config = activeBrandConfig;
  const [activeTab, setActiveTab] = useState<"All" | InvoiceStatus>("All");
  const [dateRange, setDateRange] = useState<DateRangeKey>("all");
  const [search, setSearch] = useState("");

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

    // Date range
    const cutoff = getDateCutoff(dateRange);
    if (cutoff) {
      const iso = cutoff.toISOString().slice(0, 10);
      list = list.filter((inv) => inv.invoiceDate >= iso);
    }

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((inv) => inv.invoiceNumber.toLowerCase().includes(q));
    }

    // Sort latest first
    return [...list].sort((a, b) => (b.invoiceDate > a.invoiceDate ? 1 : -1));
  }, [activeTab, dateRange, search]);

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
      <div className="flex items-center justify-start gap-3 mb-4">
        <DateRangeDropdown value={dateRange} onChange={setDateRange} config={config} />

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

// ── Date Range Dropdown ─────────────────────────────────────────────

function DateRangeDropdown({
  value,
  onChange,
  config,
}: {
  value: DateRangeKey;
  onChange: (v: DateRangeKey) => void;
  config: typeof activeBrandConfig;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const label = DATE_RANGES.find((r) => r.key === value)?.label || "All Time";

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm rounded-lg px-3 py-2 cursor-pointer transition-colors"
        style={{
          border: `1px solid ${config.borderColor}`,
          color: config.primaryColor,
          backgroundColor: "#fff",
        }}
      >
        <span>{label}</span>
        <DownOutlined style={{ fontSize: 10, color: config.secondaryColor }} />
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-1 rounded-lg py-1 z-50"
          style={{
            backgroundColor: "#fff",
            border: `1px solid ${config.borderColor}`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            minWidth: 180,
          }}
        >
          {DATE_RANGES.map((r) => {
            const isActive = value === r.key;
            return (
              <button
                key={r.key}
                onClick={() => { onChange(r.key); setOpen(false); }}
                className="w-full text-left text-sm px-4 py-2 cursor-pointer transition-colors border-none"
                style={{
                  backgroundColor: isActive ? config.cardBg : "#fff",
                  color: isActive ? config.primaryColor : config.secondaryColor,
                  fontWeight: isActive ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget.style.backgroundColor = config.cardBg); }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget.style.backgroundColor = "#fff"); }}
              >
                {r.label}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
