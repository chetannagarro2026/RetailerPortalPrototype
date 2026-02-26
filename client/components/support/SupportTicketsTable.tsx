import { Link } from "react-router-dom";
import { EyeOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { SupportTicket } from "../../data/support";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

const statusStyles: Record<string, { color: string }> = {
  Open: { color: "#D97706" },
  Closed: { color: "#16A34A" },
};

const priorityStyles: Record<string, { color: string }> = {
  Low: { color: "#6B7B99" },
  Medium: { color: "#D97706" },
  High: { color: "#B91C1C" },
};

interface Props {
  tickets: SupportTicket[];
}

export default function SupportTicketsTable({ tickets }: Props) {
  const config = activeBrandConfig;
  const columns = "1.2fr 2fr 1.2fr 0.8fr 0.8fr 1fr 0.6fr";

  if (tickets.length === 0) {
    return (
      <div
        className="rounded-xl text-center py-16"
        style={{ border: `1px solid ${config.borderColor}` }}
      >
        <p className="text-sm" style={{ color: config.secondaryColor }}>
          No tickets match this filter.
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
        <span>Ticket ID</span>
        <span>Subject</span>
        <span>Related Document</span>
        <span>Status</span>
        <span>Priority</span>
        <span>Last Updated</span>
        <span className="text-center">Action</span>
      </div>

      {/* Rows */}
      {tickets.map((ticket, idx) => {
        const sts = statusStyles[ticket.status] || statusStyles.Open;
        const pri = priorityStyles[ticket.priority] || priorityStyles.Low;
        return (
          <div
            key={ticket.id}
            className="grid gap-4 px-5 py-4 items-center"
            style={{
              gridTemplateColumns: columns,
              borderBottom: idx < tickets.length - 1 ? `1px solid ${config.borderColor}` : "none",
              backgroundColor: "#fff",
            }}
          >
            {/* Ticket ID with unread dot */}
            <div className="flex items-center gap-2">
              {ticket.unread && (
                <span
                  className="inline-block rounded-full flex-shrink-0"
                  style={{ width: 6, height: 6, backgroundColor: "#DC2626" }}
                />
              )}
              <Link
                to={`/account/support/${ticket.ticketId}`}
                className="text-sm font-semibold no-underline hover:underline"
                style={{ color: config.primaryColor }}
              >
                {ticket.ticketId}
              </Link>
            </div>

            {/* Subject — bold if unread */}
            <span
              className="text-sm truncate"
              style={{
                color: config.primaryColor,
                fontWeight: ticket.unread ? 600 : 400,
              }}
              title={ticket.subject}
            >
              {ticket.subject}
            </span>

            {/* Related Document */}
            <span className="text-xs" style={{ color: ticket.relatedDocument ? config.primaryColor : config.secondaryColor }}>
              {ticket.relatedDocument || "—"}
            </span>

            {/* Status */}
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap inline-flex self-center"
              style={{
                color: sts.color,
                backgroundColor: "transparent",
                border: `1px solid ${sts.color}`,
              }}
            >
              {ticket.status}
            </span>

            {/* Priority */}
            <span
              className="text-xs"
              style={{ color: pri.color }}
            >
              {ticket.priority}
            </span>

            {/* Last Updated */}
            <span className="text-xs" style={{ color: config.secondaryColor }}>
              {formatDate(ticket.lastUpdated)}
            </span>

            {/* Action */}
            <Link
              to={`/account/support/${ticket.ticketId}`}
              className="flex items-center justify-center gap-1 text-xs font-medium no-underline hover:underline"
              style={{ color: config.primaryColor }}
            >
              <EyeOutlined style={{ fontSize: 12 }} />
              View
            </Link>
          </div>
        );
      })}
    </div>
  );
}
