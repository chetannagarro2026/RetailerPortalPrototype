import { useParams, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { ArrowLeftOutlined, CustomerServiceOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { SUPPORT_TICKETS, canReopenTicket } from "../data/support";
import TicketConversation from "../components/support/TicketConversation";
import TicketMeta from "../components/support/TicketMeta";

export default function TicketDetailPage() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();

  const ticket = SUPPORT_TICKETS.find((t) => t.ticketId === ticketId) || null;

  // Mark as read when viewing
  useEffect(() => {
    if (ticket && ticket.unread) {
      ticket.unread = false;
    }
  }, [ticket]);

  if (!ticket) {
    return (
      <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "64px 24px", boxSizing: "border-box" }} className="text-center">
        <CustomerServiceOutlined className="text-5xl mb-4" style={{ color: config.secondaryColor }} />
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          Ticket Not Found
        </h1>
        <p className="text-sm mb-6" style={{ color: config.secondaryColor }}>
          The support ticket you're looking for doesn't exist.
        </p>
        <button
          onClick={() => navigate("/account/support")}
          className="text-sm font-medium px-6 py-2.5 rounded-lg text-white border-none cursor-pointer"
          style={{ backgroundColor: config.primaryColor }}
        >
          Back to Support
        </button>
      </div>
    );
  }

  const reopenInfo = canReopenTicket(ticket);

  const handleReopen = () => {
    ticket.status = "Open";
    ticket.closedAt = undefined;
    ticket.lastUpdated = new Date().toISOString();
    ticket.conversation.push({
      id: `m-${Date.now()}`,
      sender: "support",
      senderName: "System",
      message: "Ticket reopened by customer.",
      timestamp: new Date().toISOString(),
    });
    // Force re-render by navigating to same page
    navigate(`/account/support/${ticket.ticketId}`, { replace: true });
  };

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "24px 24px", boxSizing: "border-box" }}>
      {/* Back link */}
      <button
        onClick={() => navigate("/account/support")}
        className="flex items-center gap-2 text-sm font-medium cursor-pointer bg-transparent border-none mb-6 px-0"
        style={{ color: config.secondaryColor }}
      >
        <ArrowLeftOutlined style={{ fontSize: 12 }} />
        Back to Support Tickets
      </button>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold m-0" style={{ color: config.primaryColor }}>
            {ticket.ticketId}
          </h1>
          <p className="text-sm m-0 mt-1" style={{ color: config.secondaryColor }}>
            {ticket.subject}
          </p>
        </div>

        {/* Reopen button for closed tickets */}
        {ticket.status === "Closed" && reopenInfo.allowed && (
          <button
            onClick={handleReopen}
            className="text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
            style={{
              border: `1px solid ${config.borderColor}`,
              backgroundColor: "#fff",
              color: config.primaryColor,
            }}
          >
            Reopen Ticket
          </button>
        )}
      </div>

      {/* 90-day message */}
      {ticket.status === "Closed" && !reopenInfo.allowed && reopenInfo.message && (
        <div
          className="rounded-lg px-4 py-3 mb-4 text-xs"
          style={{ backgroundColor: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }}
        >
          {reopenInfo.message}
        </div>
      )}

      {/* Metadata strip */}
      <TicketMeta ticket={ticket} />

      {/* Conversation */}
      <TicketConversation ticket={ticket} />
    </div>
  );
}
