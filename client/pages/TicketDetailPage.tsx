import { useParams, useNavigate, Link } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowLeftOutlined, CustomerServiceOutlined, DownOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { SUPPORT_TICKETS, canReopenTicket } from "../data/support";
import type { TicketMessage } from "../data/support";
import TicketConversation from "../components/support/TicketConversation";
import ReplyComposer from "../components/support/ReplyComposer";

const statusStyles: Record<string, { color: string }> = {
  Open: { color: "#D97706" },
  Closed: { color: "#16A34A" },
};

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

export default function TicketDetailPage() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const { ticketId } = useParams<{ ticketId: string }>();
  const [, forceUpdate] = useState(0);
  const [confirmClose, setConfirmClose] = useState(false);
  const conversationEndRef = useRef<HTMLDivElement>(null);
  const conversationContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const ticket = SUPPORT_TICKETS.find((t) => t.ticketId === ticketId) || null;

  // Mark as read
  useEffect(() => {
    if (ticket && ticket.unread) {
      ticket.unread = false;
    }
  }, [ticket]);

  // Scroll to bottom on mount
  useEffect(() => {
    setTimeout(() => {
      conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);
  }, []);

  // Track scroll position for "Scroll to latest" button
  const handleScroll = useCallback(() => {
    const el = conversationContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 200);
  }, []);

  const scrollToBottom = useCallback(() => {
    conversationEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  if (!ticket) {
    return (
      <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "64px 24px", boxSizing: "border-box" }} className="text-center">
        <CustomerServiceOutlined className="text-5xl mb-4" style={{ color: config.secondaryColor }} />
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>Ticket Not Found</h1>
        <p className="text-sm mb-6" style={{ color: config.secondaryColor }}>The support ticket you're looking for doesn't exist.</p>
        <button onClick={() => navigate("/account/support")} className="text-sm font-medium px-6 py-2.5 rounded-lg text-white border-none cursor-pointer" style={{ backgroundColor: config.primaryColor }}>Back to Support</button>
      </div>
    );
  }

  const reopenInfo = canReopenTicket(ticket);
  const sts = statusStyles[ticket.status] || statusStyles.Open;

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
    forceUpdate((n) => n + 1);
    setTimeout(() => scrollToBottom(), 100);
  };

  const handleClose = () => {
    ticket.status = "Closed";
    ticket.closedAt = new Date().toISOString();
    ticket.lastUpdated = new Date().toISOString();
    ticket.conversation.push({
      id: `m-${Date.now()}`,
      sender: "support",
      senderName: "System",
      message: "Ticket closed by customer.",
      timestamp: new Date().toISOString(),
    });
    setConfirmClose(false);
    forceUpdate((n) => n + 1);
  };

  const handleReply = (message: string, _attachments: File[]) => {
    const newMsg: TicketMessage = {
      id: `m-${Date.now()}`,
      sender: "customer",
      senderName: "You",
      message,
      timestamp: new Date().toISOString(),
    };
    ticket.conversation.push(newMsg);
    ticket.lastUpdated = new Date().toISOString();
    ticket.unread = false;
    forceUpdate((n) => n + 1);
    setTimeout(() => scrollToBottom(), 100);
  };

  // Build metadata items for inline row
  const metaItems: string[] = [
    ticket.ticketId,
    ticket.category,
  ];
  const relatedDocLink = ticket.relatedDocument
    ? ticket.relatedDocument.startsWith("PO-")
      ? `/purchase-orders/${ticket.relatedDocument}`
      : ticket.relatedDocument.startsWith("INV-")
        ? `/account/invoices/${ticket.relatedDocument}`
        : null
    : null;

  return (
    <div
      className="flex flex-col"
      style={{ width: "100%", maxWidth: 1280, margin: "0 auto", boxSizing: "border-box", height: "calc(100vh - 140px)" }}
    >
      {/* Fixed top section */}
      <div className="flex-shrink-0 px-6 pt-6">
        {/* Back link */}
        <button
          onClick={() => navigate("/account/support")}
          className="flex items-center gap-2 text-sm font-medium cursor-pointer bg-transparent border-none mb-5 px-0"
          style={{ color: config.secondaryColor }}
        >
          <ArrowLeftOutlined style={{ fontSize: 12 }} />
          Back to Support Tickets
        </button>

        {/* Row 1: Subject + Status + Actions */}
        <div className="flex items-start justify-between gap-4 mb-2">
          <h1 className="text-xl font-bold m-0 leading-snug" style={{ color: config.primaryColor }}>
            {ticket.subject}
          </h1>
          <div className="flex items-center gap-3 flex-shrink-0">
            {ticket.status === "Open" && (
              <button
                onClick={() => setConfirmClose(true)}
                className="text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff", color: config.secondaryColor }}
              >
                Close Ticket
              </button>
            )}
            {ticket.status === "Closed" && reopenInfo.allowed && (
              <button
                onClick={handleReopen}
                className="text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff", color: config.primaryColor }}
              >
                Reopen Ticket
              </button>
            )}
            <span
              className="text-[11px] font-medium px-2 py-0.5 rounded whitespace-nowrap inline-flex"
              style={{ color: sts.color, backgroundColor: "transparent", border: `1px solid ${sts.color}` }}
            >
              {ticket.status}
            </span>
          </div>
        </div>

        {/* Row 2: Inline metadata */}
        <div className="flex items-center flex-wrap gap-1 mb-5 text-xs" style={{ color: config.secondaryColor }}>
          <span>{metaItems[0]}</span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>{metaItems[1]}</span>
          {ticket.relatedDocument && (
            <>
              <span style={{ opacity: 0.4 }}>•</span>
              {relatedDocLink ? (
                <Link to={relatedDocLink} className="no-underline hover:underline" style={{ color: config.primaryColor }}>
                  {ticket.relatedDocument}
                </Link>
              ) : (
                <span>{ticket.relatedDocument}</span>
              )}
            </>
          )}
          <span style={{ opacity: 0.4 }}>•</span>
          <span style={{ color: ticket.priority === "High" ? "#B91C1C" : ticket.priority === "Medium" ? "#D97706" : config.secondaryColor }}>
            {ticket.priority} Priority
          </span>
          <span style={{ opacity: 0.4 }}>•</span>
          <span>{formatDate(ticket.createdAt)}</span>
        </div>

        {/* 90-day message */}
        {ticket.status === "Closed" && !reopenInfo.allowed && reopenInfo.message && (
          <div className="rounded-lg px-4 py-3 mb-4 text-xs" style={{ backgroundColor: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }}>
            {reopenInfo.message}
          </div>
        )}

        {/* Closed message */}
        {ticket.status === "Closed" && reopenInfo.allowed && (
          <div className="rounded-lg px-4 py-3 mb-4 text-xs" style={{ backgroundColor: "#F0FDF4", color: "#16A34A", border: "1px solid #BBF7D0" }}>
            This ticket is closed.
          </div>
        )}

        {/* Divider */}
        <div style={{ borderBottom: `1px solid ${config.borderColor}` }} />
      </div>

      {/* Scrollable conversation area */}
      <div
        ref={conversationContainerRef}
        onScroll={handleScroll}
        className="flex-1 overflow-y-auto px-6 py-5 relative"
        style={{ minHeight: 0 }}
      >
        <TicketConversation ticket={ticket} />
        <div ref={conversationEndRef} />
      </div>

      {/* Scroll to latest button */}
      {showScrollBtn && (
        <div className="absolute" style={{ bottom: ticket.status === "Open" ? 260 : 80, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
          <button
            onClick={scrollToBottom}
            className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full cursor-pointer shadow-md border-none text-white"
            style={{ backgroundColor: config.primaryColor }}
          >
            Scroll to latest <DownOutlined style={{ fontSize: 10 }} />
          </button>
        </div>
      )}

      {/* Sticky reply composer (Open only) */}
      {ticket.status === "Open" && (
        <div className="flex-shrink-0 border-t px-6 py-4" style={{ borderColor: config.borderColor, backgroundColor: "#FAFAFA" }}>
          <ReplyComposer onSubmit={handleReply} />
        </div>
      )}

      {/* Confirm close modal */}
      {confirmClose && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ backgroundColor: "rgba(0,0,0,0.4)" }}>
          <div className="rounded-xl p-6 shadow-xl" style={{ backgroundColor: "#fff", maxWidth: 400, width: "90%" }}>
            <h3 className="text-base font-semibold m-0 mb-2" style={{ color: config.primaryColor }}>Close Ticket?</h3>
            <p className="text-sm m-0 mb-5" style={{ color: config.secondaryColor }}>Are you sure you want to close this ticket?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmClose(false)}
                className="text-sm font-medium px-4 py-2 rounded-lg cursor-pointer"
                style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff", color: config.secondaryColor }}
              >
                Cancel
              </button>
              <button
                onClick={handleClose}
                className="text-sm font-medium px-4 py-2 rounded-lg cursor-pointer text-white border-none"
                style={{ backgroundColor: "#DC2626" }}
              >
                Close Ticket
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
