import { activeBrandConfig } from "../../config/brandConfig";
import type { InvoicePayment } from "../../data/invoices";

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}/${d.getFullYear()}`;
}

interface Props {
  payments: InvoicePayment[];
}

export default function InvoiceDetailPayments({ payments }: Props) {
  const config = activeBrandConfig;
  const columns = "1.4fr 1fr 1fr 1fr";

  return (
    <div className="mb-8">
      <h3 className="text-base font-semibold m-0 mb-4" style={{ color: config.primaryColor }}>
        Payments Applied
      </h3>

      {payments.length === 0 ? (
        <div
          className="rounded-xl px-5 py-10 text-center"
          style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
        >
          <p className="text-sm m-0" style={{ color: config.secondaryColor }}>
            Payment not received yet.
          </p>
        </div>
      ) : (
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
            <span>Payment Ref</span>
            <span>Date</span>
            <span className="text-right">Amount</span>
            <span>Mode</span>
          </div>

          {/* Rows */}
          {payments.map((pay, idx) => (
            <div
              key={pay.ref}
              className="grid gap-4 px-5 py-3 items-center"
              style={{
                gridTemplateColumns: columns,
                borderBottom: idx < payments.length - 1 ? `1px solid ${config.borderColor}` : "none",
                backgroundColor: "#fff",
              }}
            >
              <span
                className="text-sm font-medium cursor-pointer"
                style={{ color: config.primaryColor }}
                title={`View ${pay.ref}`}
              >
                {pay.ref}
              </span>
              <span className="text-xs" style={{ color: config.secondaryColor }}>
                {formatDate(pay.date)}
              </span>
              <span className="text-sm font-medium text-right" style={{ color: "#16A34A" }}>
                {fmt(pay.amount)}
              </span>
              <span className="text-xs" style={{ color: config.secondaryColor }}>
                {pay.mode}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
