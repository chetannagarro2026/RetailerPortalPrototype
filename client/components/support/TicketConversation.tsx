import { useState } from "react";
import {
  PaperClipOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { SupportTicket, TicketAttachment } from "../../data/support";
import AttachmentLightbox from "./AttachmentLightbox";

const COLLAPSE_THRESHOLD = 250;

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date} at ${time}`;
}

function AttachmentIcon({ type }: { type: TicketAttachment["type"] }) {
  if (type === "image") return <FileImageOutlined style={{ fontSize: 14, color: "#6B7B99" }} />;
  if (type === "pdf") return <FilePdfOutlined style={{ fontSize: 14, color: "#DC2626" }} />;
  return <FileOutlined style={{ fontSize: 14, color: "#6B7B99" }} />;
}

interface Props {
  ticket: SupportTicket;
}

export default function TicketConversation({ ticket }: Props) {
  const config = activeBrandConfig;
  const [expandedMessages, setExpandedMessages] = useState<Set<string>>(new Set());
  const [lightboxAttachments, setLightboxAttachments] = useState<TicketAttachment[] | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const lastMsgId = ticket.conversation[ticket.conversation.length - 1]?.id;

  const toggleExpand = (msgId: string) => {
    setExpandedMessages((prev) => {
      const next = new Set(prev);
      if (next.has(msgId)) next.delete(msgId);
      else next.add(msgId);
      return next;
    });
  };

  const openLightbox = (attachments: TicketAttachment[], index: number) => {
    setLightboxAttachments(attachments);
    setLightboxIndex(index);
  };

  return (
    <>
      <h3 className="text-base font-semibold m-0 mb-4" style={{ color: config.primaryColor }}>
        Conversation
      </h3>

      <div className="flex flex-col gap-3">
        {ticket.conversation.map((msg) => {
          const isCustomer = msg.sender === "customer";
          const isLong = msg.message.length > COLLAPSE_THRESHOLD;
          const isLastMsg = msg.id === lastMsgId;
          const isExpanded = isLastMsg || expandedMessages.has(msg.id) || !isLong;
          const displayText = isExpanded ? msg.message : msg.message.slice(0, COLLAPSE_THRESHOLD) + "…";
          const attachments = msg.attachments || [];

          return (
            <div
              key={msg.id}
              className="rounded-xl px-5 py-4"
              style={{
                border: `1px solid ${config.borderColor}`,
                backgroundColor: isCustomer ? "#fff" : config.cardBg,
              }}
            >
              {/* Header row */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
                    style={{ backgroundColor: isCustomer ? config.primaryColor : "#6B7B99" }}
                  >
                    {msg.senderName.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
                    {msg.senderName}
                  </span>
                  {!isCustomer && msg.senderName !== "System" && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(107,123,153,0.1)", color: config.secondaryColor }}>
                      Support
                    </span>
                  )}
                  {msg.senderName === "System" && (
                    <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: "rgba(217,119,6,0.1)", color: "#D97706" }}>
                      System
                    </span>
                  )}
                </div>
                <span className="text-[10px] flex-shrink-0" style={{ color: config.secondaryColor }}>
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>

              {/* Message body */}
              <p className="text-sm m-0 leading-relaxed whitespace-pre-wrap" style={{ color: config.primaryColor }}>
                {displayText}
              </p>

              {/* View more/less toggle */}
              {isLong && !isLastMsg && (
                <button
                  onClick={() => toggleExpand(msg.id)}
                  className="text-xs font-medium mt-1 cursor-pointer bg-transparent border-none px-0"
                  style={{ color: config.primaryColor }}
                >
                  {isExpanded ? "View less" : "View more"}
                </button>
              )}

              {/* Collapsed attachment indicator */}
              {!isExpanded && attachments.length > 0 && (
                <div className="flex items-center gap-1 mt-2 text-xs" style={{ color: config.secondaryColor }}>
                  <PaperClipOutlined style={{ fontSize: 12 }} />
                  <span>{attachments.length} attachment{attachments.length !== 1 ? "s" : ""}</span>
                </div>
              )}

              {/* Attachment previews (always visible when expanded or short message) */}
              {isExpanded && attachments.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {attachments.map((att, idx) => (
                    <button
                      key={att.id}
                      onClick={() => openLightbox(attachments, idx)}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer text-left"
                      style={{
                        border: `1px solid ${config.borderColor}`,
                        backgroundColor: config.cardBg,
                        outline: "none",
                      }}
                    >
                      <AttachmentIcon type={att.type} />
                      <div className="flex flex-col">
                        <span className="text-xs font-medium" style={{ color: config.primaryColor }}>
                          {att.name}
                        </span>
                        {att.size && (
                          <span className="text-[10px]" style={{ color: config.secondaryColor }}>
                            {att.size}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Lightbox */}
      {lightboxAttachments && (
        <AttachmentLightbox
          attachments={lightboxAttachments}
          initialIndex={lightboxIndex}
          onClose={() => setLightboxAttachments(null)}
        />
      )}
    </>
  );
}
