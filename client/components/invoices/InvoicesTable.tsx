import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import type { Invoice } from "../../data/invoices";
import { balance } from "../../data/invoices";

// ── Status Badge ────────────────────────────────────────────────────

const STATUS_COLORS: Record<string, string> = {
  Paid: "#16A34A",
  "Partially Paid": "#2563EB",
  Overdue: "#DC2626",
  Upcoming: "#6B7B99",
};

function StatusBadge({ status }: { status: string }) {
  const color = STATUS_COLORS[status] || "#6B7B99";
  return (
    <span
      className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap"
      style={{ color, backgroundColor: "transparent", border: `1px solid ${color}` }}
    >
      {status}
    </span>
  );
}

// ── Helpers ─────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function isOverdue(inv: Invoice): boolean {
  return inv.status === "Overdue";
}

// ── Component ───────────────────────────────────────────────────────

interface Props {
  invoices: Invoice[];
}

export default function InvoicesTable({ invoices }: Props) {
  const config = activeBrandConfig;
  const columns = "1.2fr 1fr 1fr 1fr 1fr 1fr 1fr";

  if (invoices.length === 0) {
    return (
      <div
        className="rounded-xl text-center py-16"
        style={{ border: `1px solid ${config.borderColor}` }}
      >
        <p className="text-sm" style={{ color: config.secondaryColor }}>
          No invoices match this filter.
        </p>
      </div>
    );
  }

  return (
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
        <span>Invoice #</span>
        <span>Invoice Date</span>
        <span>Due Date</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Paid</span>
        <span className="text-right">Balance</span>
        <span>Status</span>
      </div>

      {/* Rows */}
      {invoices.map((inv, idx) => {
        const bal = balance(inv);
        const overdue = isOverdue(inv);
        return (
          <div
            key={inv.id}
            className="grid gap-4 px-5 py-4 items-center transition-colors"
            style={{
              gridTemplateColumns: columns,
              borderBottom: idx < invoices.length - 1 ? `1px solid ${config.borderColor}` : "none",
              backgroundColor: "#fff",
            }}
          >
            <Link
              to={`/account/invoices/${inv.invoiceNumber}`}
              className="text-sm font-semibold no-underline hover:underline"
              style={{ color: config.primaryColor }}
            >
              {inv.invoiceNumber}
            </Link>
            <span className="text-xs" style={{ color: config.secondaryColor }}>
              {formatDate(inv.invoiceDate)}
            </span>
            <span
              className="text-xs"
              style={{ color: overdue ? "#DC2626" : config.secondaryColor }}
            >
              {formatDate(inv.dueDate)}
            </span>
            <span className="text-sm font-medium text-right" style={{ color: config.primaryColor }}>
              {fmt(inv.amount)}
            </span>
            <span className="text-sm text-right" style={{ color: "#16A34A" }}>
              {fmt(inv.paid)}
            </span>
            <span
              className="text-sm text-right"
              style={{
                color: bal > 0 && overdue ? "#DC2626" : config.primaryColor,
                fontWeight: bal > 0 && overdue ? 600 : 500,
              }}
            >
              {fmt(bal)}
            </span>
            <StatusBadge status={inv.status} />
          </div>
        );
      })}
    </div>
  );
}
