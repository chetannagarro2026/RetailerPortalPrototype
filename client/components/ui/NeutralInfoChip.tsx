import type { ReactNode, CSSProperties } from "react";

/**
 * Neutral Info Chip — informational metadata indicator.
 *
 * Used for non-interactive metadata like SKU counts.
 * Separate from the Promotions Tag system.
 *
 * 16px height | 10px font | 600 weight | 8px h-padding | 12px border-radius
 * Background #F8FAFC | Border 1px solid #E2E8F0 | Text #475569
 */

interface NeutralInfoChipProps {
  children: ReactNode;
  style?: CSSProperties;
  className?: string;
}

export default function NeutralInfoChip({
  children,
  style,
  className = "",
}: NeutralInfoChipProps) {
  return (
    <span
      className={`inline-flex items-center ${className}`}
      style={{
        height: 16,
        padding: "2px 6px",
        borderRadius: 12,
        fontSize: 10,
        fontWeight: 600,
        lineHeight: 1,
        whiteSpace: "nowrap",
        backgroundColor: "#F8FAFC",
        border: "1px solid #E2E8F0",
        color: "#475569",
        ...style,
      }}
    >
      {children}
    </span>
  );
}
