import type { ReactNode, CSSProperties, MouseEventHandler } from "react";

/**
 * Standardized Tag / Chip component system.
 *
 * Two size variants:
 *   Standard (24px) — page headers, hero sections
 *   Compact  (20px) — tables, dropdowns, dense layouts
 *
 * Shared: 10px font, 500 weight, 8px h-padding, 16px border-radius,
 *         1px semantic border (always visible)
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

export type TagSize = "standard" | "compact";

const SIZE_CONFIG = {
  standard: { height: 24, iconSize: 12, gap: 6 },
  compact:  { height: 20, iconSize: 10, gap: 4 },
} as const;

export interface TagProps {
  /** Visual variant */
  variant: TagVariant;
  /** Size variant — standard (24px) for headers, compact (20px) for tables/dense layouts. Defaults to "standard". */
  size?: TagSize;
  /** Tag content (text label) */
  children: ReactNode;
  /** Optional leading icon */
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
  size = "standard",
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
  const s = SIZE_CONFIG[size];

  return (
    <span
      onClick={onClick}
      title={title}
      className={`inline-flex items-center ${className}`}
      style={{
        height: s.height,
        padding: "0px 8px",
        borderRadius: isNeutral ? 8 : 16,
        fontSize: 10,
        fontWeight: 500,
        gap: s.gap,
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
        <span style={{ fontSize: s.iconSize, lineHeight: 0, display: "inline-flex", alignItems: "center", color: "inherit" }}>
          {icon}
        </span>
      )}
      {children}
      {suffix && (
        <span style={{ fontSize: s.iconSize, lineHeight: 0, display: "inline-flex", alignItems: "center", color: "inherit" }}>
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
