import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import type { SupportTicket } from "../../data/support";
import { canReopenTicket } from "../../data/support";

const statusStyles: Record<string, { color: string }> = {
  Open: { color: "#D97706" },
  Closed: { color: "#16A34A" },
};

const priorityColors: Record<string, string> = {
  Low: "#6B7B99",
  Medium: "#D97706",
  High: "#B91C1C",
  "Not specified": "#8c8c8c",
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface Props {
  ticket: SupportTicket;
  onClose: () => void;
  onReopen: () => void;
}

export default function TicketDetailsSidebar({ ticket, onClose, onReopen }: Props) {
  const config = activeBrandConfig;
  const sts = statusStyles[ticket.status] || statusStyles.Open;
  const reopenInfo = canReopenTicket(ticket);

  const relatedDocLink = ticket.relatedDocument
    ? ticket.relatedDocument.startsWith("PO-")
      ? `/purchase-orders/${ticket.relatedDocument}`
      : ticket.relatedDocument.startsWith("INV-")
        ? `/account/invoices/${ticket.relatedDocument}`
        : null
    : null;

  const fields: { label: string; value: React.ReactNode }[] = [
    { label: "Ticket ID", value: ticket.ticketId },
    { label: "Category", value: ticket.category },
    {
      label: "Related Document",
      value: ticket.relatedDocument
        ? relatedDocLink
          ? <Link to={relatedDocLink} className="no-underline hover:underline text-sm font-medium" style={{ color: config.primaryColor }}>{ticket.relatedDocument}</Link>
          : ticket.relatedDocument
        : "—",
    },
    {
      label: "Status",
      value: (
        <span
          className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap inline-flex"
          style={{ color: sts.color, backgroundColor: "transparent", border: `1px solid ${sts.color}` }}
        >
          {ticket.status}
        </span>
      ),
    },
    {
      label: "Priority",
      value: <span style={{ color: priorityColors[ticket.priority] || config.secondaryColor }}>{ticket.priority}</span>,
    },
    { label: "Created", value: formatDate(ticket.createdAt) },
  ];

  if (ticket.closedAt) {
    fields.push({ label: "Closed", value: formatDate(ticket.closedAt) });
  }

  return (
    <div
      className="rounded-xl p-5 sticky top-6"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <h3 className="text-sm font-semibold m-0 mb-4" style={{ color: config.primaryColor }}>
        Ticket Details
      </h3>

      <div className="flex flex-col gap-4">
        {fields.map((f) => (
          <div key={f.label}>
            <p className="text-[11px] font-semibold uppercase tracking-wider m-0 mb-1" style={{ color: config.secondaryColor }}>
              {f.label}
            </p>
            <div className="text-sm font-medium" style={{ color: config.primaryColor }}>
              {f.value}
            </div>
          </div>
        ))}
      </div>

      {/* Action buttons */}
      <div className="mt-6 flex flex-col gap-2">
        {ticket.status === "Open" && (
          <button
            onClick={onClose}
            className="w-full text-sm font-medium py-2 rounded-lg cursor-pointer transition-colors"
            style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff", color: config.secondaryColor }}
          >
            Close Ticket
          </button>
        )}
        {ticket.status === "Closed" && reopenInfo.allowed && (
          <button
            onClick={onReopen}
            className="w-full text-sm font-medium py-2 rounded-lg cursor-pointer transition-colors"
            style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff", color: config.primaryColor }}
          >
            Reopen Ticket
          </button>
        )}
      </div>

      {/* 90-day message */}
      {ticket.status === "Closed" && !reopenInfo.allowed && reopenInfo.message && (
        <div className="rounded-lg px-3 py-2.5 mt-4 text-xs leading-relaxed" style={{ backgroundColor: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }}>
          {reopenInfo.message}
        </div>
      )}

      {/* Closed message */}
      {ticket.status === "Closed" && reopenInfo.allowed && (
        <div className="rounded-lg px-3 py-2.5 mt-4 text-xs" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }}>
          This ticket is closed.
        </div>
      )}
    </div>
  );
}
