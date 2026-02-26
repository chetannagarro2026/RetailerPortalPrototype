import { activeBrandConfig } from "../../config/brandConfig";
import type { SupportTicket } from "../../data/support";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const statusStyles: Record<string, { color: string; bg: string }> = {
  Open: { color: "#D97706", bg: "rgba(217,119,6,0.08)" },
  Closed: { color: "#16A34A", bg: "rgba(22,163,74,0.08)" },
};

const priorityStyles: Record<string, { color: string }> = {
  Low: { color: "#6B7B99" },
  Medium: { color: "#D97706" },
  High: { color: "#B91C1C" },
};

interface Props {
  ticket: SupportTicket;
}

export default function TicketMeta({ ticket }: Props) {
  const config = activeBrandConfig;
  const sts = statusStyles[ticket.status] || statusStyles.Open;
  const pri = priorityStyles[ticket.priority] || priorityStyles.Low;

  return (
    <div
      className="rounded-xl p-4 mb-6"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 m-0" style={{ color: config.secondaryColor }}>
            Category
          </p>
          <p className="text-sm font-medium m-0 mt-0.5" style={{ color: config.primaryColor }}>
            {ticket.category}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 m-0" style={{ color: config.secondaryColor }}>
            Related Document
          </p>
          <p className="text-sm font-medium m-0 mt-0.5" style={{ color: ticket.relatedDocument ? config.primaryColor : config.secondaryColor }}>
            {ticket.relatedDocument || "—"}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 m-0" style={{ color: config.secondaryColor }}>
            Status
          </p>
          <span
            className="text-[11px] font-medium rounded whitespace-nowrap inline-flex mt-0.5"
            style={{ color: sts.color, backgroundColor: sts.bg, padding: "4px 10px" }}
          >
            {ticket.status}
          </span>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 m-0" style={{ color: config.secondaryColor }}>
            Priority
          </p>
          <p className="text-sm font-medium m-0 mt-0.5" style={{ color: pri.color }}>
            {ticket.priority}
          </p>
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wider mb-1 m-0" style={{ color: config.secondaryColor }}>
            Created
          </p>
          <p className="text-sm font-medium m-0 mt-0.5" style={{ color: config.primaryColor }}>
            {formatDate(ticket.createdAt)}
          </p>
        </div>
      </div>
    </div>
  );
}
