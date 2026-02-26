import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import type { Invoice } from "../../data/invoices";
import { outstanding, getStatusLabel, computeTotalDiscount } from "../../data/invoices";

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
  const bal = outstanding(invoice);
  const status = getStatusLabel(invoice);
  const isOverdue = invoice.status === "Overdue" || status.color === "#DC2626";
  const totalDiscount = computeTotalDiscount(invoice.items, invoice.orderDiscount);

  return (
    <div
      className="rounded-xl p-5 mb-8"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      {/* Row 1: Date, Due Date, Status, Linked PO */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 m-0" style={{ color: config.secondaryColor }}>
            Invoice Date
          </p>
          <p className="text-sm font-medium m-0 mt-0.5" style={{ color: config.primaryColor }}>
            {formatDate(invoice.invoiceDate)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 m-0" style={{ color: config.secondaryColor }}>
            Due Date
          </p>
          <p className="text-sm font-medium m-0 mt-0.5" style={{ color: isOverdue ? "#DC2626" : config.primaryColor }}>
            {formatDate(invoice.dueDate)}
          </p>
          {isOverdue && (
            <p className="text-[11px] mt-1 m-0" style={{ color: "#DC2626" }}>
              This invoice is overdue.
            </p>
          )}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 m-0" style={{ color: config.secondaryColor }}>
            Status
          </p>
          <span
            className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap inline-block mt-0.5"
            style={{ color: status.color, border: `1px solid ${status.color}` }}
          >
            {status.label}
          </span>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 m-0" style={{ color: config.secondaryColor }}>
            Linked Purchase Order
          </p>
          <Link
            to={`/purchase-orders/${invoice.linkedPO}`}
            className="text-sm font-medium no-underline hover:underline mt-0.5 inline-block"
            style={{ color: config.primaryColor }}
          >
            {invoice.linkedPO}
          </Link>
        </div>
      </div>

      {/* Divider */}
      <div className="mb-5" style={{ borderBottom: `1px solid ${config.borderColor}` }} />

      {/* Row 2: Financial KPIs — Total Discount | Grand Total | Paid Amount | Outstanding Balance */}
      <div
        className="grid gap-6"
        style={{ gridTemplateColumns: "1fr 1fr 1fr 1fr" }}
      >
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 m-0" style={{ color: config.secondaryColor }}>
            Total Discount
          </p>
          <p className="text-sm font-medium m-0 mt-0.5" style={{ color: config.primaryColor }}>
            {totalDiscount > 0 ? fmt(totalDiscount) : "$0.00"}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 m-0" style={{ color: config.secondaryColor }}>
            Grand Total
          </p>
          <p className="text-lg font-bold m-0 mt-0.5" style={{ color: config.primaryColor }}>
            {fmt(invoice.amount)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 m-0" style={{ color: config.secondaryColor }}>
            Paid Amount
          </p>
          <p className="text-sm font-medium m-0 mt-0.5" style={{ color: "#16A34A" }}>
            {fmt(invoice.paid)}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 m-0" style={{ color: config.secondaryColor }}>
            Outstanding Balance
          </p>
          <p className="text-lg m-0 mt-0.5 font-bold" style={{ color: config.primaryColor }}>
            {fmt(bal)}
          </p>
        </div>
      </div>
    </div>
  );
}
