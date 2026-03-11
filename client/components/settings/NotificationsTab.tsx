import { useState, useEffect } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { useToast } from "../toast/ToastProvider";
import { useAuth } from "../../context/AuthContext";
import {
  fetchNotificationEvents,
  flattenNotifications,
  getNotificationTypeLabel,
  type GroupedNotification,
} from "../../services/notificationService";

interface Props {
  setDirty: (v: boolean) => void;
}

export default function NotificationsTab({ setDirty }: Props) {
  const config = activeBrandConfig;
  const { showToast } = useToast();
  const { user, accessToken } = useAuth();

  const [notifications, setNotifications] = useState<GroupedNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState<number | null>(null);

  // Fetch notifications on mount
  useEffect(() => {
    const loadNotifications = async () => {
      if (!accessToken) {
        setLoading(false);
        showToast("error", "Not authenticated");
        return;
      }

      try {
        setLoading(true);
        const events = await fetchNotificationEvents(accessToken);
        const grouped = flattenNotifications(events);
        setNotifications(grouped);
      } catch (error) {
        console.error("Failed to load notifications:", error);
        showToast("error", "Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    loadNotifications();
  }, [accessToken, showToast]);

  // Keep parent dirty state in sync
  useEffect(() => () => setDirty(false), [setDirty]);

  const handleToggle = (eventId: number, notificationId: number) => {
    setNotifications((prev) =>
      prev.map((event) =>
        event.eventId === eventId
          ? {
              ...event,
              notifications: event.notifications.map((n) =>
                n.eventNotificationId === notificationId
                  ? { ...n, isActive: !n.isActive }
                  : n
              ),
            }
          : event
      )
    );

    showToast("success", "Preference updated");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <LoadingOutlined style={{ fontSize: 24, color: config.primaryColor }} />
        <span className="ml-3">Loading notifications...</span>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="text-center py-8">
        <p style={{ color: config.secondaryColor }}>No notifications available</p>
      </div>
    );
  }

  return (
    <div>
      {/* Page title */}
      <div className="mb-6">
        <h3
          className="text-base font-semibold m-0 mb-1"
          style={{ color: config.primaryColor }}
        >
          Notification Preferences
        </h3>
        <p className="text-xs m-0" style={{ color: config.secondaryColor }}>
          Toggle notifications on or off for each event. Changes save instantly.
        </p>
      </div>

      {/* Notifications list */}
      <div
        className="rounded-lg overflow-hidden"
        style={{ border: `1px solid ${config.borderColor}` }}
      >
        {notifications.map((event, index) => (
          <EventNotificationRow
            key={event.eventId}
            event={event}
            isLast={index === notifications.length - 1}
            onToggle={(notificationId) =>
              handleToggle(event.eventId, notificationId)
            }
          />
        ))}
      </div>
    </div>
  );
}

// ── Event Notification Row ──────────────────────────────────────────

function EventNotificationRow({
  event,
  isLast,
  onToggle,
}: {
  event: GroupedNotification;
  isLast: boolean;
  onToggle: (notificationId: number) => void;
}) {
  const config = activeBrandConfig;

  return (
    <div
      className="px-4 py-4"
      style={{
        backgroundColor: "#fff",
        borderBottom: isLast ? "none" : `1px solid ${config.borderColor}`,
      }}
    >
      {/* Event Header */}
      <div className="mb-3">
        <div className="text-sm font-semibold" style={{ color: config.primaryColor }}>
          {event.eventDescription}
        </div>
        <div className="text-xs mt-1" style={{ color: config.secondaryColor }}>
          {event.eventName}
        </div>
      </div>

      {/* Notification Types */}
      <div className="flex flex-wrap gap-4">
        {event.notifications.map((notification) => (
          <div
            key={notification.eventNotificationId}
            className="flex items-center gap-2"
          >
            <div className="flex items-center gap-2 flex-1">
              <span
                className="text-xs font-medium px-2 py-1 rounded"
                style={{
                  backgroundColor: `${config.primaryColor}15`,
                  color: config.primaryColor,
                }}
              >
                {getNotificationTypeLabel(notification.notificationType)}
              </span>
              <ToggleSwitch
                checked={notification.isActive}
                onChange={() => onToggle(notification.eventNotificationId)}
                size="small"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Toggle Switch ───────────────────────────────────────────────────

function ToggleSwitch({
  checked,
  onChange,
  disabled,
  size = "default",
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: "default" | "small";
}) {
  const config = activeBrandConfig;
  const w = size === "small" ? 36 : 44;
  const h = size === "small" ? 20 : 24;
  const dot = size === "small" ? 16 : 20;
  const offset = checked ? w - dot - 2 : 2;

  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={disabled ? undefined : onChange}
      className="relative rounded-full border-none p-0 transition-colors"
      style={{
        width: w,
        height: h,
        backgroundColor: disabled
          ? "#E5E7EB"
          : checked
          ? config.primaryColor
          : "#D1D5DB",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span
        className="absolute rounded-full bg-white transition-all shadow-sm"
        style={{
          width: dot,
          height: dot,
          top: 2,
          left: offset,
        }}
      />
    </button>
  );
}
