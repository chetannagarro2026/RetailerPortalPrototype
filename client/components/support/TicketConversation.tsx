import { activeBrandConfig } from "../../config/brandConfig";
import type { SupportTicket } from "../../data/support";

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date} at ${time}`;
}

interface Props {
  ticket: SupportTicket;
}

export default function TicketConversation({ ticket }: Props) {
  const config = activeBrandConfig;

  return (
    <div>
      <h3 className="text-base font-semibold m-0 mb-3" style={{ color: config.primaryColor }}>
        Conversation
      </h3>

      <div className="flex flex-col gap-3">
        {ticket.conversation.map((msg) => {
          const isCustomer = msg.sender === "customer";
          return (
            <div
              key={msg.id}
              className="rounded-xl px-5 py-4"
              style={{
                border: `1px solid ${config.borderColor}`,
                backgroundColor: isCustomer ? "#fff" : config.cardBg,
              }}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="w-7 h-7 rounded-full flex items-center justify-center text-[10px] font-semibold text-white flex-shrink-0"
                    style={{
                      backgroundColor: isCustomer ? config.primaryColor : "#6B7B99",
                    }}
                  >
                    {msg.senderName.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
                    {msg.senderName}
                  </span>
                  {!isCustomer && msg.senderName !== "System" && (
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: "rgba(107,123,153,0.1)", color: config.secondaryColor }}
                    >
                      Support
                    </span>
                  )}
                  {msg.senderName === "System" && (
                    <span
                      className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                      style={{ backgroundColor: "rgba(217,119,6,0.1)", color: "#D97706" }}
                    >
                      System
                    </span>
                  )}
                </div>
                <span className="text-[10px]" style={{ color: config.secondaryColor }}>
                  {formatTimestamp(msg.timestamp)}
                </span>
              </div>
              <p className="text-sm m-0 leading-relaxed" style={{ color: config.primaryColor }}>
                {msg.message}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
