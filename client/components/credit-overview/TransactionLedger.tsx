import { useState, useMemo, useRef, useEffect } from "react";
import { SearchOutlined, DownOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import DateRangeFilter, { getFYStart, getFYEnd, toISODate, type DateRange } from "./DateRangeFilter";

// ── Types & Mock Data ───────────────────────────────────────────────

interface LedgerEntry {
  id: string;
  date: string;
  type: "Invoice" | "Payment" | "Credit Note" | "Adjustment";
  reference: string;
  debit: number;
  credit: number;
}

const ALL_LEDGER: LedgerEntry[] = [
  { id: "1", date: "2026-02-24", type: "Invoice", reference: "INV-44821", debit: 12400, credit: 0 },
  { id: "2", date: "2026-02-20", type: "Payment", reference: "PAY-10234", debit: 0, credit: 8500 },
  { id: "3", date: "2026-02-18", type: "Invoice", reference: "INV-44798", debit: 6500, credit: 0 },
  { id: "4", date: "2026-02-15", type: "Credit Note", reference: "CN-00312", debit: 0, credit: 1350 },
  { id: "17", date: "2026-02-22", type: "Credit Note", reference: "CN-00313", debit: 0, credit: 830 },
  { id: "5", date: "2026-02-12", type: "Invoice", reference: "INV-44756", debit: 18900, credit: 0 },
  { id: "6", date: "2026-02-10", type: "Payment", reference: "PAY-10198", debit: 0, credit: 15000 },
  { id: "7", date: "2026-02-05", type: "Adjustment", reference: "ADJ-00045", debit: 0, credit: 2400 },
  { id: "8", date: "2026-01-28", type: "Invoice", reference: "INV-44690", debit: 34250, credit: 0 },
  { id: "9", date: "2026-01-25", type: "Payment", reference: "PAY-10155", debit: 0, credit: 20000 },
  { id: "10", date: "2026-01-20", type: "Invoice", reference: "INV-44612", debit: 9800, credit: 0 },
  // Pre-FY entries (before Apr 2025) for opening balance demo
  { id: "11", date: "2025-03-15", type: "Invoice", reference: "INV-43210", debit: 22000, credit: 0 },
  { id: "12", date: "2025-03-10", type: "Payment", reference: "PAY-09800", debit: 0, credit: 18000 },
  { id: "13", date: "2025-02-20", type: "Invoice", reference: "INV-43105", debit: 15500, credit: 0 },
  { id: "14", date: "2025-02-05", type: "Payment", reference: "PAY-09650", debit: 0, credit: 14000 },
  // Older seed balance anchor
  { id: "15", date: "2025-04-10", type: "Invoice", reference: "INV-43400", debit: 8200, credit: 0 },
  { id: "16", date: "2025-05-02", type: "Payment", reference: "PAY-09900", debit: 0, credit: 6000 },
];

// Base balance before ALL data (historical anchor)
const BASE_BALANCE = 27000;

const TYPE_OPTIONS = ["All", "Invoice", "Payment", "Credit Note", "Adjustment"] as const;

// ── Helpers ─────────────────────────────────────────────────────────

function fmt(val: number): string {
  if (val === 0) return "—";
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function fmtBalance(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ── Component ───────────────────────────────────────────────────────

export default function TransactionLedger() {
  const config = activeBrandConfig;
  const today = useMemo(() => new Date(), []);

  // Default: This Financial Year
  const [dateRange, setDateRange] = useState<DateRange>({
    start: getFYStart(today),
    end: getFYEnd(today),
  });
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const startISO = toISODate(dateRange.start);
  const endISO = toISODate(dateRange.end);

  // Opening balance = BASE_BALANCE + net of all entries BEFORE start date
  const openingBalance = useMemo(() => {
    let bal = BASE_BALANCE;
    for (const e of ALL_LEDGER) {
      if (e.date < startISO) bal += e.debit - e.credit;
    }
    return bal;
  }, [startISO]);

  // Entries within date range
  const inRange = useMemo(
    () => ALL_LEDGER.filter((e) => e.date >= startISO && e.date <= endISO).sort((a, b) => (b.date > a.date ? 1 : -1)),
    [startISO, endISO],
  );

  // Apply type + search filters
  const filtered = useMemo(() => {
    let list = inRange;
    if (typeFilter !== "All") list = list.filter((e) => e.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.reference.toLowerCase().includes(q));
    }
    return list;
  }, [inRange, typeFilter, search]);

  // Running balance (oldest first, start from opening)
  const withBalance = useMemo(() => {
    const reversed = [...filtered].reverse();
    let balance = openingBalance;
    const computed = reversed.map((entry) => {
      balance += entry.debit - entry.credit;
      return { ...entry, balance };
    });
    return computed.reverse();
  }, [filtered, openingBalance]);

  // Totals
  const totalDebits = inRange.reduce((s, e) => s + e.debit, 0);
  const totalCredits = inRange.reduce((s, e) => s + e.credit, 0);
  const closingBalance = openingBalance + totalDebits - totalCredits;

  const columns = "1.4fr 1fr 1.1fr 1.2fr 1.2fr 1.4fr";

  return (
    <div>
      <h3 className="text-base font-semibold m-0 mb-4" style={{ color: config.primaryColor }}>
        Transaction Ledger
      </h3>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4 relative z-10">
        <DateRangeFilter value={dateRange} onChange={setDateRange} />

        <TypeFilterDropdown
          value={typeFilter}
          onChange={setTypeFilter}
          config={config}
        />

        <div className="relative">
          <SearchOutlined
            className="absolute left-3 top-1/2 -translate-y-1/2"
            style={{ fontSize: 13, color: config.secondaryColor }}
          />
          <input
            type="text"
            placeholder="Search by reference..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="text-sm rounded-lg pl-8 pr-3 py-2 outline-none"
            style={{
              border: `1px solid ${config.borderColor}`,
              color: config.primaryColor,
              width: 220,
              boxSizing: "border-box",
            }}
          />
        </div>

        <div className="flex-1" />

        {/* Opening / Closing balance */}
        <div className="flex items-center gap-5">
          <div className="text-right">
            <p className="text-[11px] m-0" style={{ color: config.secondaryColor }}>Opening Balance</p>
            <p className="text-sm font-semibold m-0" style={{ color: config.primaryColor }}>{fmtBalance(openingBalance)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] m-0" style={{ color: config.secondaryColor }}>Closing Balance</p>
            <p className="text-sm font-semibold m-0" style={{ color: config.primaryColor }}>{fmtBalance(closingBalance)}</p>
          </div>
        </div>
      </div>

      {/* Based on selected range hint */}
      <p className="text-[11px] m-0 mb-3" style={{ color: config.secondaryColor }}>
        Based on selected date range
      </p>

      {/* Table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: `1px solid ${config.borderColor}` }}
      >
        {/* Header */}
        <div
          className="grid gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider"
          style={{
            gridTemplateColumns: columns,
            backgroundColor: config.cardBg,
            color: config.secondaryColor,
            borderBottom: `1px solid ${config.borderColor}`,
          }}
        >
          <span>Reference</span>
          <span>Date</span>
          <span>Type</span>
          <span className="text-right">Debit</span>
          <span className="text-right">Credit</span>
          <span className="text-right">Running Balance</span>
        </div>

        {/* Rows */}
        {withBalance.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm" style={{ color: config.secondaryColor }}>
              No transactions found for selected period.
            </p>
          </div>
        ) : (
          withBalance.map((entry, idx) => (
            <div
              key={entry.id}
              className="grid gap-4 px-5 py-3 items-center"
              style={{
                gridTemplateColumns: columns,
                borderBottom: idx < withBalance.length - 1 ? `1px solid ${config.borderColor}` : "none",
                backgroundColor: "#fff",
              }}
            >
              <span
                className="text-sm font-medium cursor-pointer"
                style={{ color: config.primaryColor }}
                title={`View ${entry.reference}`}
              >
                {entry.reference}
              </span>
              <span className="text-xs" style={{ color: config.secondaryColor }}>
                {formatDate(entry.date)}
              </span>
              <span>
                <TypeBadge type={entry.type} />
              </span>
              <span className="text-sm text-right" style={{ color: entry.debit > 0 ? config.primaryColor : config.secondaryColor }}>
                {fmt(entry.debit)}
              </span>
              <span className="text-sm text-right" style={{ color: entry.credit > 0 ? "#16A34A" : config.secondaryColor }}>
                {fmt(entry.credit)}
              </span>
              <span className="text-sm font-medium text-right" style={{ color: config.primaryColor }}>
                {fmtBalance(entry.balance)}
              </span>
            </div>
          ))
        )}
      </div>

      {/* Totals below table */}
      <div className="flex items-center gap-6 mt-3 justify-end">
        <div className="text-right">
          <span className="text-xs" style={{ color: config.secondaryColor }}>Total Debits: </span>
          <span className="text-xs font-semibold" style={{ color: config.primaryColor }}>{fmtBalance(totalDebits)}</span>
        </div>
        <div className="text-right">
          <span className="text-xs" style={{ color: config.secondaryColor }}>Total Credits: </span>
          <span className="text-xs font-semibold" style={{ color: "#16A34A" }}>{fmtBalance(totalCredits)}</span>
        </div>
      </div>
    </div>
  );
}

// ── Type Filter Dropdown ─────────────────────────────────────────────

function TypeFilterDropdown({
  value,
  onChange,
  config,
}: {
  value: string;
  onChange: (v: string) => void;
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

  const label = value === "All" ? "All Types" : value;

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
          className="absolute left-0 top-full mt-1 rounded-lg py-1 z-50"
          style={{
            backgroundColor: "#fff",
            border: `1px solid ${config.borderColor}`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            minWidth: 160,
          }}
        >
          {TYPE_OPTIONS.map((t) => {
            const isActive = value === t;
            return (
              <button
                key={t}
                onClick={() => { onChange(t); setOpen(false); }}
                className="w-full text-left text-sm px-4 py-2 cursor-pointer transition-colors border-none"
                style={{
                  backgroundColor: isActive ? config.cardBg : "#fff",
                  color: isActive ? config.primaryColor : config.secondaryColor,
                  fontWeight: isActive ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget.style.backgroundColor = config.cardBg); }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget.style.backgroundColor = "#fff"); }}
              >
                {t === "All" ? "All Types" : t}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ── Type Badge ──────────────────────────────────────────────────────

const TYPE_COLORS: Record<string, string> = {
  Invoice: "#D97706",
  Payment: "#16A34A",
  "Credit Note": "#2563EB",
  Adjustment: "#7C3AED",
};

function TypeBadge({ type }: { type: string }) {
  const color = TYPE_COLORS[type] || "#6B7B99";
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap"
      style={{ color, backgroundColor: "transparent", border: `1px solid ${color}` }}
    >
      {type}
    </span>
  );
}
