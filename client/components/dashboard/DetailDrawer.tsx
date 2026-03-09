import { useEffect, useRef } from "react";
import { CloseOutlined, RightOutlined, InboxOutlined, WarningOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";

interface Column {
  key: string;
  label: string;
  render?: (value: any, row: any) => React.ReactNode;
}

interface DetailDrawerProps {
  visible: boolean;
  onClose: () => void;
  title: string;
  columns: Column[];
  rows: any[];
  footerLabel: string;
  footerPath: string;
  loading?: boolean;
  error?: boolean;
}

export default function DetailDrawer({
  visible,
  onClose,
  title,
  columns,
  rows,
  footerLabel,
  footerPath,
  loading = false,
  error = false,
}: DetailDrawerProps) {
  const config = activeBrandConfig;
  const drawerRef = useRef<HTMLDivElement>(null);

  // Close on ESC
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    if (visible) document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [visible, onClose]);

  // Prevent body scroll when open
  useEffect(() => {
    document.body.style.overflow = visible ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [visible]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-50 bg-black/20 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className="fixed top-0 right-0 z-50 h-full bg-white flex flex-col shadow-2xl"
        style={{ width: 480, borderLeft: `1px solid ${config.borderColor}` }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 shrink-0"
          style={{ borderBottom: `1px solid ${config.borderColor}` }}
        >
          <h2 className="text-base font-semibold m-0" style={{ color: config.primaryColor }}>
            {title}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer border-none bg-transparent hover:bg-gray-100 transition-colors"
            style={{ color: config.secondaryColor }}
          >
            <CloseOutlined className="text-sm" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {loading && <SkeletonState />}
          {error && <ErrorState />}
          {!loading && !error && rows.length === 0 && <EmptyState />}
          {!loading && !error && rows.length > 0 && (
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  {columns.map((col) => (
                    <th
                      key={col.key}
                      className="text-left text-[11px] font-semibold uppercase tracking-wider pb-3"
                      style={{ color: config.secondaryColor }}
                    >
                      {col.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.slice(0, 10).map((row, idx) => (
                  <tr
                    key={row.id || idx}
                    style={{ borderTop: `1px solid ${config.borderColor}` }}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="py-3 text-xs" style={{ color: "#374151" }}>
                        {col.render ? col.render(row[col.key], row) : row[col.key]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer */}
        <div
          className="px-6 py-4 shrink-0"
          style={{ borderTop: `1px solid ${config.borderColor}` }}
        >
          <a
            href={footerPath}
            className="text-sm font-medium flex items-center gap-1.5 no-underline"
            style={{ color: config.primaryColor }}
          >
            {footerLabel} <RightOutlined className="text-[10px]" />
          </a>
        </div>
      </div>
    </>
  );
}

/* ─── States ─── */

function SkeletonState() {
  return (
    <div className="space-y-4 animate-pulse">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="h-4 bg-gray-200 rounded flex-1" />
          <div className="h-4 bg-gray-200 rounded w-20" />
          <div className="h-4 bg-gray-200 rounded w-16" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <InboxOutlined className="text-3xl mb-3" style={{ color: "#D1D5DB" }} />
      <p className="text-sm font-medium text-gray-400 mb-1">No items found</p>
      <p className="text-xs text-gray-300">There are no records to display.</p>
    </div>
  );
}

function ErrorState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <WarningOutlined className="text-3xl mb-3" style={{ color: "#DC2626" }} />
      <p className="text-sm font-medium text-gray-500 mb-1">Failed to load data</p>
      <p className="text-xs text-gray-400">Please try again later or contact support.</p>
    </div>
  );
}
