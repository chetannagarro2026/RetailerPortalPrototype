import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import type { Invoice } from "../../data/invoices";
import { balance } from "../../data/invoices";

const STATUS_COLORS: Record<string, string> = {
  Paid: "#16A34A",
  "Partially Paid": "#2563EB",
  Overdue: "#DC2626",
  Upcoming: "#6B7B99",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

interface Props {
  invoice: Invoice;
}

export default function InvoiceDetailSummary({ invoice }: Props) {
  const config = activeBrandConfig;
  const statusColor = STATUS_COLORS[invoice.status] || "#6B7B99";
  const bal = balance(invoice);
  const overdue = invoice.status === "Overdue";

  return (
    <div
      className="rounded-xl p-5 mb-8"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      {/* Row 1 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-5">
        <Field label="Invoice Date" value={formatDate(invoice.invoiceDate)} config={config} />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: config.secondaryColor }}>
            Due Date
          </p>
          <p className="text-sm font-medium mt-0.5" style={{ color: overdue ? "#DC2626" : config.primaryColor }}>
            {formatDate(invoice.dueDate)}
          </p>
          {overdue && (
            <p className="text-[11px] mt-1 m-0" style={{ color: "#DC2626" }}>
              This invoice is overdue.
            </p>
          )}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: config.secondaryColor }}>
            Status
          </p>
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap"
            style={{ color: statusColor, border: `1px solid ${statusColor}` }}
          >
            {invoice.status}
          </span>
        </div>
        <Field label="Total Amount" value={fmt(invoice.amount)} config={config} />
      </div>

      {/* Divider */}
      <div className="mb-5" style={{ borderBottom: `1px solid ${config.borderColor}` }} />

      {/* Row 2 */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
        <Field label="Paid Amount" value={fmt(invoice.paid)} config={config} valueColor="#16A34A" />
        <Field
          label="Outstanding Balance"
          value={fmt(bal)}
          config={config}
          valueColor={bal > 0 && overdue ? "#DC2626" : config.primaryColor}
          bold={bal > 0 && overdue}
        />
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: config.secondaryColor }}>
            Linked Purchase Order
          </p>
          <Link
            to={`/purchase-orders/${invoice.linkedPO}`}
            className="text-sm font-medium no-underline hover:underline"
            style={{ color: config.primaryColor }}
          >
            {invoice.linkedPO}
          </Link>
        </div>
      </div>
    </div>
  );
}

function Field({
  label,
  value,
  config,
  valueColor,
  bold,
}: {
  label: string;
  value: string;
  config: typeof activeBrandConfig;
  valueColor?: string;
  bold?: boolean;
}) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wider mb-1" style={{ color: config.secondaryColor }}>
        {label}
      </p>
      <p
        className="text-sm mt-0.5"
        style={{ color: valueColor || config.primaryColor, fontWeight: bold ? 600 : 500 }}
      >
        {value}
      </p>
    </div>
  );
}
