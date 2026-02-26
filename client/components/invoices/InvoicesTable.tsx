import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import type { Invoice } from "../../data/invoices";
import { outstanding, getStatusLabel } from "../../data/invoices";

// ── Status Badge (dynamic) ──────────────────────────────────────────

function StatusBadge({ invoice }: { invoice: Invoice }) {
  const { label, color, days } = getStatusLabel(invoice);
  const daysText =
    days !== undefined && days !== 0
      ? label === "Overdue"
        ? `${days} day${days !== 1 ? "s" : ""}`
        : label === "Partially Paid" && days < 0
          ? `Overdue ${Math.abs(days)}d`
          : `${days} day${days !== 1 ? "s" : ""}`
      : null;

  return (
    <div className="inline-flex flex-col items-end gap-0.5">
      <span
        className="text-[11px] font-medium rounded whitespace-nowrap inline-flex"
        style={{
          color,
          backgroundColor: `${color}14`,
          padding: "4px 10px",
        }}
      >
        {label}
      </span>
      {daysText && (
        <span className="text-[10px] pl-1" style={{ color: "#9CA3AF" }}>
          {daysText}
        </span>
      )}
    </div>
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

// ── Component ───────────────────────────────────────────────────────

interface Props {
  invoices: Invoice[];
}

export default function InvoicesTable({ invoices }: Props) {
  const config = activeBrandConfig;
  const columns = "1.4fr 1fr 1fr 1.1fr 1.1fr 1.1fr 1.3fr";

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
        <span className="text-center">Invoice Date</span>
        <span className="text-center">Due Date</span>
        <span className="text-right">Amount</span>
        <span className="text-right">Paid</span>
        <span className="text-right">Balance</span>
        <span className="text-right">Status</span>
      </div>

      {/* Rows */}
      {invoices.map((inv, idx) => {
        const bal = outstanding(inv);
        const isOverdue = inv.status === "Overdue";
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
            <span className="text-xs text-center" style={{ color: config.secondaryColor }}>
              {formatDate(inv.invoiceDate)}
            </span>
            <span
              className="text-xs text-center"
              style={{ color: isOverdue ? "#DC2626" : config.secondaryColor }}
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
                color: bal > 0 && isOverdue ? "#DC2626" : config.primaryColor,
                fontWeight: bal > 0 && isOverdue ? 600 : 500,
              }}
            >
              {fmt(bal)}
            </span>
            <StatusBadge invoice={inv} />
          </div>
        );
      })}
    </div>
  );
}
