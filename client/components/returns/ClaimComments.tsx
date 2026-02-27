import { useState } from "react";
import { SendOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { ClaimComment } from "../../data/returns";

function formatTimestamp(iso: string): string {
  const d = new Date(iso);
  const date = d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
  const time = d.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  return `${date} at ${time}`;
}

interface Props {
  comments: ClaimComment[];
  showComposer?: boolean;
}

export default function ClaimComments({ comments, showComposer = false }: Props) {
  const config = activeBrandConfig;
  const [replyText, setReplyText] = useState("");

  if (comments.length === 0 && !showComposer) return null;

  return (
    <div>
      <h3 className="text-sm font-semibold m-0 mb-3" style={{ color: config.primaryColor }}>
        Comments
      </h3>
      <div className="flex flex-col gap-3">
        {comments.map((msg) => {
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
                    style={{ backgroundColor: isCustomer ? config.primaryColor : "#6B7B99" }}
                  >
                    {msg.senderName.charAt(0).toUpperCase()}
                  </span>
                  <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
                    {msg.senderName}
                  </span>
                  {msg.sender === "support" && msg.senderName !== "System" && (
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
              <p className="text-sm m-0 leading-relaxed" style={{ color: config.primaryColor }}>
                {msg.message}
              </p>
            </div>
          );
        })}
      </div>

      {/* Reply Composer */}
      {showComposer && (
        <div
          className="rounded-xl mt-4 overflow-hidden"
          style={{ border: `1px solid ${config.borderColor}` }}
        >
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Add a comment..."
            rows={3}
            className="w-full text-sm p-4 resize-none border-none outline-none"
            style={{ color: config.primaryColor, backgroundColor: "#fff", boxSizing: "border-box" }}
          />
          <div
            className="flex justify-end px-4 py-2.5"
            style={{ borderTop: `1px solid ${config.borderColor}`, backgroundColor: config.cardBg }}
          >
            <button
              disabled={!replyText.trim()}
              className="flex items-center gap-2 text-xs font-medium px-4 py-2 rounded-lg border-none cursor-pointer text-white"
              style={{
                backgroundColor: replyText.trim() ? config.primaryColor : config.borderColor,
                cursor: replyText.trim() ? "pointer" : "not-allowed",
              }}
            >
              <SendOutlined style={{ fontSize: 11 }} />
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
