import type { ReactNode, CSSProperties, MouseEventHandler } from "react";

/**
 * Standardized Tag / Chip component system.
 *
 * All tags use:
 *   height  24px  |  padding  4px 10px  |  border-radius  16px
 *   font-size 12px  |  font-weight 500  |  gap 6px
 *   1px semantic border (always visible)
 *   icon size 12px, vertically centered
 */

// ── Color Palette ───────────────────────────────────────────────────

const TAG_STYLES = {
  /** Green — Promotions available */
  promotion: {
    bg: "#ECFDF5",
    border: "#A7F3D0",
    text: "#047857",
  },
  /** Orange — Applied promotion */
  applied: {
    bg: "#FFF7ED",
    border: "#FED7AA",
    text: "#C2410C",
  },
  /** Blue — Discount type badge */
  discount: {
    bg: "#EEF4FF",
    border: "#C7D7FE",
    text: "#1D4ED8",
  },
  /** Green variant — Free Goods */
  freeGoods: {
    bg: "#ECFDF5",
    border: "#A7F3D0",
    text: "#047857",
  },
  /** Orange variant — BOGO */
  bogo: {
    bg: "#FFF7ED",
    border: "#FED7AA",
    text: "#C2410C",
  },
  /** Blue — Recommended */
  recommended: {
    bg: "#EEF4FF",
    border: "#C7D7FE",
    text: "#1D4ED8",
  },
  /** Neutral — SKU attribute chips */
  neutral: {
    bg: "#FFFFFF",
    border: "#E5E7EB",
    text: "#374151",
  },
} as const;

export type TagVariant = keyof typeof TAG_STYLES;

// ── Props ───────────────────────────────────────────────────────────

export interface TagProps {
  /** Visual variant */
  variant: TagVariant;
  /** Tag content (text label) */
  children: ReactNode;
  /** Optional leading icon (rendered at 12px) */
  icon?: ReactNode;
  /** Optional trailing element (e.g. dropdown indicator) */
  suffix?: ReactNode;
  /** Click handler — automatically sets cursor:pointer */
  onClick?: MouseEventHandler<HTMLSpanElement>;
  /** Extra inline styles */
  style?: CSSProperties;
  /** Extra class names */
  className?: string;
  /** HTML title attribute */
  title?: string;
}

// ── Component ───────────────────────────────────────────────────────

export default function Tag({
  variant,
  children,
  icon,
  suffix,
  onClick,
  style,
  className = "",
  title,
}: TagProps) {
  const colors = TAG_STYLES[variant];
  const isNeutral = variant === "neutral";

  return (
    <span
      onClick={onClick}
      title={title}
      className={`inline-flex items-center ${className}`}
      style={{
        height: 24,
        padding: "4px 10px",
        borderRadius: isNeutral ? 8 : 16,
        fontSize: 12,
        fontWeight: 500,
        gap: 6,
        lineHeight: 1,
        whiteSpace: "nowrap",
        cursor: onClick ? "pointer" : "default",
        transition: "background-color 0.15s, border-color 0.15s",
        backgroundColor: colors.bg,
        border: `1px solid ${colors.border}`,
        color: colors.text,
        ...style,
      }}
    >
      {icon && (
        <span style={{ fontSize: 12, lineHeight: 0, display: "inline-flex", alignItems: "center", color: "inherit" }}>
          {icon}
        </span>
      )}
      {children}
      {suffix && (
        <span style={{ fontSize: 10, lineHeight: 0, display: "inline-flex", alignItems: "center", color: "inherit" }}>
          {suffix}
        </span>
      )}
    </span>
  );
}

// ── Convenience: Dropdown indicator ─────────────────────────────────

export function DropdownIndicator() {
  return <span style={{ fontSize: 10 }}>&#9662;</span>;
}
