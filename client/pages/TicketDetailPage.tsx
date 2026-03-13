import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowLeftOutlined, CustomerServiceOutlined, DownOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { SUPPORT_TICKETS } from "../data/support";
import type { TicketMessage } from "../data/support";
import TicketConversation from "../components/support/TicketConversation";
import TicketDetailsSidebar from "../components/support/TicketDetailsSidebar";
import ReplyComposer from "../components/support/ReplyComposer";

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

  // Page scroll to top, then conversation thread scroll to bottom
  useEffect(() => {
    window.scrollTo(0, 0);
    setTimeout(() => {
      const container = conversationContainerRef.current;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 100);
  }, []);

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

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", boxSizing: "border-box" }}>
      {/* Back link */}
      <div className="px-4 pt-4 pb-4">
        <button
          onClick={() => navigate("/account/support")}
          className="flex items-center gap-2 text-sm font-medium cursor-pointer bg-transparent border-none px-0"
          style={{ color: config.secondaryColor }}
        >
          <ArrowLeftOutlined style={{ fontSize: 12 }} />
          Back to Support Tickets
        </button>
      </div>

      {/* 2-column workspace */}
      <div className="flex gap-6 px-4 pb-4" style={{ height: "calc(100vh - 200px)" }}>
        {/* Left column — 70% — Conversation */}
        <div className="flex flex-col" style={{ flex: "0 0 70%", minWidth: 0 }}>
          {/* Subject heading */}
          <h1
            className="font-bold m-0 mb-4 flex-shrink-0"
            style={{ color: config.primaryColor, fontSize: 20, fontWeight: 700, lineHeight: 1.4 }}
          >
            {ticket.subject}
          </h1>

          {/* Scrollable conversation */}
          <div
            ref={conversationContainerRef}
            onScroll={handleScroll}
            className="flex-1 overflow-y-auto pr-2 relative"
            style={{ minHeight: 0 }}
          >
            <TicketConversation ticket={ticket} />
            <div ref={conversationEndRef} />
          </div>

          {/* Scroll to latest */}
          {showScrollBtn && (
            <div className="relative">
              <div className="absolute" style={{ bottom: ticket.status === "Open" ? 16 : 16, left: "50%", transform: "translateX(-50%)", zIndex: 10 }}>
                <button
                  onClick={scrollToBottom}
                  className="flex items-center gap-1.5 text-xs font-medium px-4 py-2 rounded-full cursor-pointer shadow-md border-none text-white"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  Scroll to latest <DownOutlined style={{ fontSize: 10 }} />
                </button>
              </div>
            </div>
          )}

          {/* Sticky reply composer (Open only) */}
          {ticket.status === "Open" && (
            <div className="flex-shrink-0 pt-4" style={{ borderTop: `1px solid ${config.borderColor}` }}>
              <ReplyComposer onSubmit={handleReply} />
            </div>
          )}

          {/* Closed state in conversation column */}
          {ticket.status === "Closed" && (
            <div
              className="flex-shrink-0 rounded-lg px-4 py-3 mt-4 text-xs text-center"
              style={{ backgroundColor: "#F9FAFB", color: config.secondaryColor, border: `1px solid ${config.borderColor}` }}
            >
              This conversation is closed. View ticket details for reopen options.
            </div>
          )}
        </div>

        {/* Right column — 30% — Ticket Details */}
        <div style={{ flex: "0 0 28%", minWidth: 0 }}>
          <TicketDetailsSidebar
            ticket={ticket}
            onClose={() => setConfirmClose(true)}
            onReopen={handleReopen}
          />
        </div>
      </div>

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
