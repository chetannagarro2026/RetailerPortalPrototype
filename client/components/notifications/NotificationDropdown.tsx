import { useState, useEffect, useRef, useCallback, useSyncExternalStore } from "react";
import { useNavigate } from "react-router-dom";
import { LoadingOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import {
  getNotifications,
  getUnreadCount,
  markAsRead,
  markAllAsRead,
  subscribe,
  type AppNotification,
} from "../../data/notifications";
import NotificationItem from "./NotificationItem";

interface Props {
  open: boolean;
  onClose: () => void;
}

type TabKey = "all" | "unread";

const PAGE_SIZE = 10;

export default function NotificationDropdown({ open, onClose }: Props) {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Subscribe to notification store
  const notifications = useSyncExternalStore(subscribe, getNotifications);
  const unreadCount = useSyncExternalStore(subscribe, getUnreadCount);

  const [activeTab, setActiveTab] = useState<TabKey>("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [loading, setLoading] = useState(false);

  // Filter based on tab
  const filtered = activeTab === "unread"
    ? notifications.filter((n) => !n.read)
    : notifications;

  const displayed = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  // Reset visible count on tab change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
  }, [activeTab]);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, onClose]);

  // Close on ESC
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  // Infinite scroll
  const handleScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el || loading || !hasMore) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 60;
    if (nearBottom) {
      setLoading(true);
      // Simulate network delay
      setTimeout(() => {
        setVisibleCount((prev) => prev + PAGE_SIZE);
        setLoading(false);
      }, 400);
    }
  }, [loading, hasMore]);

  const handleItemClick = (n: AppNotification) => {
    if (!n.read) markAsRead(n.id);
    onClose();
    navigate(n.linkTo);
  };

  const handleMarkAllRead = () => {
    markAllAsRead();
  };

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      className="absolute bg-white z-50 flex flex-col"
      style={{
        width: 400,
        maxHeight: "75vh",
        top: "100%",
        right: 0,
        marginTop: 8,
        borderRadius: 12,
        boxShadow: "0 12px 40px rgba(0,0,0,0.14)",
        border: `1px solid ${config.borderColor}`,
        overflow: "hidden",
      }}
    >
      {/* ── Sticky Header ── */}
      <div
        className="shrink-0"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        {/* Title row */}
        <div className="flex items-center justify-between px-4 pt-4 pb-2">
          <h3
            className="text-base font-semibold m-0"
            style={{ color: config.primaryColor }}
          >
            Notifications
          </h3>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="text-xs font-medium cursor-pointer bg-transparent border-none p-0"
              style={{ color: config.secondaryColor }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = config.primaryColor;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = config.secondaryColor;
              }}
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-0 px-4">
          {(["all", "unread"] as const).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === "all" ? "All" : `Unread${unreadCount > 0 ? ` (${unreadCount})` : ""}`;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className="px-3 py-2 text-sm cursor-pointer bg-transparent border-none transition-colors"
                style={{
                  color: isActive ? config.primaryColor : config.secondaryColor,
                  fontWeight: isActive ? 600 : 400,
                  borderBottom: isActive
                    ? `2px solid ${config.primaryColor}`
                    : "2px solid transparent",
                  marginBottom: -1,
                }}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── Scrollable List ── */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto"
        onScroll={handleScroll}
        style={{ minHeight: 0 }}
      >
        {displayed.length === 0 ? (
          <EmptyState tab={activeTab} />
        ) : (
          <>
            {displayed.map((n) => (
              <NotificationItem
                key={n.id}
                notification={n}
                onClick={handleItemClick}
              />
            ))}

            {/* Loading spinner */}
            {loading && (
              <div className="flex items-center justify-center py-4">
                <LoadingOutlined
                  style={{ fontSize: 18, color: config.secondaryColor }}
                />
              </div>
            )}

            {/* Bottom message when all loaded */}
            {!hasMore && displayed.length > 0 && (
              <div className="px-4 py-3 text-center">
                <span
                  className="text-[11px]"
                  style={{ color: config.secondaryColor }}
                >
                  Showing notifications from the last 60 days.
                </span>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

// ── Empty State ─────────────────────────────────────────────────────

function EmptyState({ tab }: { tab: TabKey }) {
  const config = activeBrandConfig;
  return (
    <div className="flex flex-col items-center justify-center py-12 px-6">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center mb-3 text-xl"
        style={{ backgroundColor: config.cardBg, color: config.secondaryColor }}
      >
        🔔
      </div>
      <p
        className="text-sm font-medium m-0 mb-1"
        style={{ color: config.primaryColor }}
      >
        {tab === "unread" ? "All caught up!" : "No notifications yet"}
      </p>
      <p
        className="text-xs m-0 text-center"
        style={{ color: config.secondaryColor }}
      >
        {tab === "unread"
          ? "You have no unread notifications."
          : "Notifications from the last 60 days will appear here."}
      </p>
    </div>
  );
}
