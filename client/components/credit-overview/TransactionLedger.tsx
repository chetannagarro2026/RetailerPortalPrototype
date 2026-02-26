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

const OPENING_BALANCE = 34750;

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

  // Running balance from oldest to newest
  const withBalance = useMemo(() => {
    const reversed = [...filtered].reverse();
    let balance = OPENING_BALANCE;
    const computed = reversed.map((entry) => {
      balance += entry.debit - entry.credit;
      return { ...entry, balance };
    });
    return computed.reverse();
  }, [filtered]);

  // Totals
  const totalDebits = filtered.reduce((s, e) => s + e.debit, 0);
  const totalCredits = filtered.reduce((s, e) => s + e.credit, 0);
  const closingBalance = OPENING_BALANCE + totalDebits - totalCredits;

  const columns = "1.4fr 1fr 1.1fr 1.2fr 1.2fr 1.4fr";

  return (
    <div>
      <h3 className="text-base font-semibold m-0 mb-4" style={{ color: config.primaryColor }}>
        Transaction Ledger
      </h3>

      {/* Filter bar + balances */}
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
            <p className="text-sm font-semibold m-0" style={{ color: config.primaryColor }}>{fmtBalance(OPENING_BALANCE)}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] m-0" style={{ color: config.secondaryColor }}>Closing Balance</p>
            <p className="text-sm font-semibold m-0" style={{ color: config.primaryColor }}>{fmtBalance(closingBalance)}</p>
          </div>
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
