import { useState, useRef, useEffect, useMemo } from "react";
import { CloseOutlined, FileTextOutlined, SearchOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { INVOICES, outstanding } from "../../data/invoices";
import { useOrderHistory } from "../../context/OrderHistoryContext";
import type { TicketCategory } from "../../data/support";

interface DocumentSuggestion {
  id: string;
  label: string; // e.g. INV-44821 or PO-2026-0121
  type: "Invoice" | "PO";
  subtitle: string; // e.g. "Invoice • 24/02/2026 • $12,276.00 • Upcoming"
}

interface Props {
  value: string;
  onChange: (value: string) => void;
  category: TicketCategory | "";
  disabled?: boolean;
  placeholder?: string;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

function getCategoryFilter(category: TicketCategory | ""): "all" | "invoice" | "po" {
  switch (category) {
    case "Invoice Query":
    case "Payment Query":
      return "invoice";
    case "Order Issue":
    case "Missing Items":
      return "po";
    default:
      return "all";
  }
}

export default function DocumentSearchInput({ value, onChange, category, disabled, placeholder }: Props) {
  const config = activeBrandConfig;
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [selected, setSelected] = useState<DocumentSuggestion | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { orders } = useOrderHistory();
  const filter = getCategoryFilter(category);

  // Build suggestions pool
  const allSuggestions = useMemo<DocumentSuggestion[]>(() => {
    const invoiceSuggestions: DocumentSuggestion[] =
      filter !== "po"
        ? INVOICES.map((inv) => ({
            id: inv.invoiceNumber,
            label: inv.invoiceNumber,
            type: "Invoice" as const,
            subtitle: `Invoice • ${formatDate(inv.invoiceDate)} • ${fmt(inv.amount)} • ${inv.status}${outstanding(inv) > 0 ? ` (${fmt(outstanding(inv))} due)` : ""}`,
          }))
        : [];

    const poSuggestions: DocumentSuggestion[] =
      filter !== "invoice"
        ? orders.map((po) => ({
            id: po.orderNumber,
            label: po.orderNumber,
            type: "PO" as const,
            subtitle: `PO • ${formatDate(po.submittedAt)} • ${fmt(po.totalValue)} • ${po.status}`,
          }))
        : [];

    return [...invoiceSuggestions, ...poSuggestions];
  }, [filter, orders]);

  // Filter suggestions based on query
  const filteredSuggestions = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return allSuggestions.filter((s) => s.label.toLowerCase().includes(q)).slice(0, 8);
  }, [query, allSuggestions]);

  // Sync external value with selected state
  useEffect(() => {
    if (value && !selected) {
      const match = allSuggestions.find((s) => s.label === value);
      if (match) setSelected(match);
    }
  }, [value, allSuggestions, selected]);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleSelect = (suggestion: DocumentSuggestion) => {
    setSelected(suggestion);
    onChange(suggestion.label);
    setQuery("");
    setIsOpen(false);
  };

  const handleClear = () => {
    setSelected(null);
    onChange("");
    setQuery("");
    inputRef.current?.focus();
  };

  // If a document is selected, show as tag
  if (selected || (disabled && value)) {
    return (
      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2.5"
        style={{
          border: `1px solid ${config.borderColor}`,
          backgroundColor: disabled ? config.cardBg : "#fff",
          opacity: disabled ? 0.7 : 1,
        }}
      >
        <FileTextOutlined style={{ fontSize: 13, color: config.secondaryColor }} />
        <span
          className="text-sm font-medium px-2 py-0.5 rounded"
          style={{ backgroundColor: `${config.primaryColor}08`, color: config.primaryColor, border: `1px solid ${config.primaryColor}20` }}
        >
          {selected?.label || value}
        </span>
        {selected?.type && (
          <span className="text-[10px]" style={{ color: config.secondaryColor }}>
            {selected.type}
          </span>
        )}
        {!disabled && (
          <button
            onClick={handleClear}
            className="ml-auto flex items-center justify-center w-5 h-5 rounded-full bg-transparent border-none cursor-pointer p-0"
            style={{ color: config.secondaryColor }}
          >
            <CloseOutlined style={{ fontSize: 10 }} />
          </button>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <SearchOutlined
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ fontSize: 13, color: config.secondaryColor, pointerEvents: "none" }}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => { if (query.length >= 2) setIsOpen(true); }}
          placeholder={placeholder || "Search Invoice # or PO #"}
          className="w-full text-sm rounded-lg pl-9 pr-3 py-2.5 outline-none"
          style={{
            border: `1px solid ${config.borderColor}`,
            color: config.primaryColor,
            backgroundColor: "#fff",
          }}
        />
      </div>

      {/* Dropdown */}
      {isOpen && query.length >= 2 && (
        <div
          className="absolute left-0 right-0 mt-1 rounded-lg shadow-lg overflow-hidden z-20"
          style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff", maxHeight: 320, overflowY: "auto" }}
        >
          {filteredSuggestions.length === 0 ? (
            <div className="px-4 py-4 text-center text-xs" style={{ color: config.secondaryColor }}>
              No matching invoice or PO found.
            </div>
          ) : (
            filteredSuggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSelect(s)}
                className="w-full text-left px-4 py-3 cursor-pointer bg-transparent border-none hover:bg-gray-50 transition-colors block"
                style={{ borderBottom: `1px solid ${config.borderColor}` }}
              >
                <div className="flex items-center gap-2">
                  <FileTextOutlined style={{ fontSize: 12, color: config.secondaryColor }} />
                  <span className="text-sm font-medium" style={{ color: config.primaryColor }}>
                    {s.label}
                  </span>
                  <span
                    className="text-[10px] font-medium px-1.5 py-0.5 rounded"
                    style={{
                      backgroundColor: s.type === "Invoice" ? "rgba(22,163,74,0.08)" : "rgba(217,119,6,0.08)",
                      color: s.type === "Invoice" ? "#16A34A" : "#D97706",
                    }}
                  >
                    {s.type}
                  </span>
                </div>
                <p className="text-[11px] m-0 mt-1 ml-5" style={{ color: config.secondaryColor }}>
                  {s.subtitle}
                </p>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
