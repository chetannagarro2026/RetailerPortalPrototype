import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import { getCurrentStatus, formatStatus, getStatusColor, type Case } from "../../services/caseManagementService";

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

interface Props {
  tickets: Case[];
}

export default function SupportTicketsTable({ tickets }: Props) {
  const config = activeBrandConfig;
  const columns = "1fr 3fr 1fr 1.2fr";

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
        <span>Description</span>
        <span>Status</span>
        <span className="text-center">Updated Date</span>
      </div>

      {/* Rows */}
      {tickets.map((ticket, idx) => {
        const status = getCurrentStatus(ticket.caseStatuses);
        const statusColor = getStatusColor(status);
        const statusLabel = formatStatus(status);
        
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
            {/* Ticket ID */}
            <div className="flex items-center gap-2">
              <Link
                to={`/account/support/${ticket.id}`}
                className="text-sm font-semibold no-underline hover:underline"
                style={{ color: config.primaryColor }}
              >
                {ticket.id}
              </Link>
            </div>

            {/* Description */}
            <span
              className="text-sm"
              style={{
                color: config.primaryColor,
              }}
            >
              {ticket.caseDescription || "—"}
            </span>

            {/* Status Badge */}
            <div>
              <span
                className="inline-block px-3 py-1 text-xs font-medium rounded-full"
                style={{
                  backgroundColor: `${statusColor}20`,
                  color: statusColor,
                }}
              >
                {statusLabel}
              </span>
            </div>

            {/* Updated Date */}
            <span className="text-sm text-center" style={{ color: config.secondaryColor }}>
              {formatDate(ticket.modifiedOn)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
