import {
  FileTextOutlined,
  RollbackOutlined,
  CustomerServiceOutlined,
  ShoppingOutlined,
  CreditCardOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { AppNotification, NotificationCategory } from "../../data/notifications";
import { formatTimestamp } from "../../data/notifications";

interface Props {
  notification: AppNotification;
  onClick: (n: AppNotification) => void;
}

const categoryIcons: Record<NotificationCategory, React.ReactNode> = {
  financial: <FileTextOutlined />,
  returns: <RollbackOutlined />,
  support: <CustomerServiceOutlined />,
  orders: <ShoppingOutlined />,
};

const categoryColors: Record<NotificationCategory, { bg: string; fg: string }> = {
  financial: { bg: "#EEF2FF", fg: "#4338CA" },
  returns: { bg: "#FEF3C7", fg: "#B45309" },
  support: { bg: "#ECFDF5", fg: "#059669" },
  orders: { bg: "#F0F9FF", fg: "#0369A1" },
};

export default function NotificationItem({ notification, onClick }: Props) {
  const config = activeBrandConfig;
  const { category, title, subtitle, read, createdAt, ctaLabel } = notification;
  const colors = categoryColors[category];

  return (
    <button
      onClick={() => onClick(notification)}
      className="w-full flex items-start gap-3 px-4 py-3 text-left cursor-pointer transition-colors border-none"
      style={{
        backgroundColor: read ? "#fff" : "#F8FAFF",
        borderBottom: `1px solid ${config.borderColor}`,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = read ? config.cardBg : "#F0F4FF";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = read ? "#fff" : "#F8FAFF";
      }}
    >
      {/* Category Icon */}
      <div
        className="shrink-0 w-8 h-8 rounded-full flex items-center justify-center text-sm mt-0.5"
        style={{ backgroundColor: colors.bg, color: colors.fg }}
      >
        {categoryIcons[category]}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <p
            className="text-sm m-0 leading-snug"
            style={{
              color: config.primaryColor,
              fontWeight: read ? 400 : 600,
            }}
          >
            {title}
          </p>
          <span
            className="text-[10px] shrink-0 mt-0.5 whitespace-nowrap"
            style={{ color: config.secondaryColor }}
          >
            {formatTimestamp(createdAt)}
          </span>
        </div>
        <p className="text-xs m-0 mt-0.5 leading-snug" style={{ color: config.secondaryColor }}>
          {subtitle}
        </p>
        {ctaLabel && (
          <span
            className="inline-block text-[11px] font-medium mt-1.5"
            style={{ color: config.primaryColor }}
          >
            {ctaLabel} →
          </span>
        )}
      </div>

      {/* Unread dot */}
      {!read && (
        <div
          className="shrink-0 w-2 h-2 rounded-full mt-2"
          style={{ backgroundColor: "#3B82F6" }}
        />
      )}
    </button>
  );
}
