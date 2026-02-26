import { useState, useMemo } from "react";
import { SearchOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";

// ── Types & Mock Data ───────────────────────────────────────────────

interface LedgerEntry {
  id: string;
  date: string;
  type: "Invoice" | "Payment" | "Credit Note" | "Adjustment";
  reference: string;
  debit: number;
  credit: number;
}

const mockLedger: LedgerEntry[] = [
  { id: "1", date: "2026-02-24", type: "Invoice", reference: "INV-44821", debit: 12400, credit: 0 },
  { id: "2", date: "2026-02-20", type: "Payment", reference: "PAY-10234", debit: 0, credit: 8500 },
  { id: "3", date: "2026-02-18", type: "Invoice", reference: "INV-44798", debit: 6500, credit: 0 },
  { id: "4", date: "2026-02-15", type: "Credit Note", reference: "CN-00312", debit: 0, credit: 1200 },
  { id: "5", date: "2026-02-12", type: "Invoice", reference: "INV-44756", debit: 18900, credit: 0 },
  { id: "6", date: "2026-02-10", type: "Payment", reference: "PAY-10198", debit: 0, credit: 15000 },
  { id: "7", date: "2026-02-05", type: "Adjustment", reference: "ADJ-00045", debit: 0, credit: 2400 },
  { id: "8", date: "2026-01-28", type: "Invoice", reference: "INV-44690", debit: 34250, credit: 0 },
  { id: "9", date: "2026-01-25", type: "Payment", reference: "PAY-10155", debit: 0, credit: 20000 },
  { id: "10", date: "2026-01-20", type: "Invoice", reference: "INV-44612", debit: 9800, credit: 0 },
];

const TYPE_OPTIONS = ["All", "Invoice", "Payment", "Credit Note", "Adjustment"] as const;

// ── Helpers ─────────────────────────────────────────────────────────

function fmt(val: number): string {
  if (val === 0) return "—";
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

// ── Component ───────────────────────────────────────────────────────

export default function TransactionLedger() {
  const config = activeBrandConfig;
  const [typeFilter, setTypeFilter] = useState<string>("All");
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    let list = mockLedger;
    if (typeFilter !== "All") list = list.filter((e) => e.type === typeFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter((e) => e.reference.toLowerCase().includes(q));
    }
    return list;
  }, [typeFilter, search]);

  // Compute running balance (latest first, so balance decreases as we go down)
  const withBalance = useMemo(() => {
    // Start from the bottom (oldest) and compute forward
    const reversed = [...filtered].reverse();
    let balance = 0;
    const computed = reversed.map((entry) => {
      balance += entry.debit - entry.credit;
      return { ...entry, balance };
    });
    return computed.reverse();
  }, [filtered]);

  const columns = "100px 110px 140px 120px 120px 140px";

  return (
    <div>
      <h3 className="text-base font-semibold m-0 mb-4" style={{ color: config.primaryColor }}>
        Transaction Ledger
      </h3>

      {/* Filter bar */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="text-sm rounded-lg px-3 py-2 outline-none cursor-pointer"
          style={{
            border: `1px solid ${config.borderColor}`,
            color: config.primaryColor,
            backgroundColor: "#fff",
          }}
        >
          {TYPE_OPTIONS.map((t) => (
            <option key={t} value={t}>{t === "All" ? "All Types" : t}</option>
          ))}
        </select>

        <div className="flex-1" />

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
      </div>

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
          <span>Date</span>
          <span>Type</span>
          <span>Reference</span>
          <span className="text-right">Debit</span>
          <span className="text-right">Credit</span>
          <span className="text-right">Running Balance</span>
        </div>

        {/* Rows */}
        {withBalance.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm" style={{ color: config.secondaryColor }}>No transactions found.</p>
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
              <span className="text-xs" style={{ color: config.secondaryColor }}>
                {formatDate(entry.date)}
              </span>
              <span>
                <TypeBadge type={entry.type} />
              </span>
              <span className="text-sm font-medium" style={{ color: config.primaryColor }}>
                {entry.reference}
              </span>
              <span className="text-sm text-right" style={{ color: entry.debit > 0 ? config.primaryColor : config.secondaryColor }}>
                {fmt(entry.debit)}
              </span>
              <span className="text-sm text-right" style={{ color: entry.credit > 0 ? "#16A34A" : config.secondaryColor }}>
                {fmt(entry.credit)}
              </span>
              <span className="text-sm font-medium text-right" style={{ color: config.primaryColor }}>
                ${Math.abs(entry.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
          ))
        )}
      </div>
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
