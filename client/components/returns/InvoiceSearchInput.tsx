import { useState, useRef, useEffect, useMemo } from "react";
import { SearchOutlined, FileTextOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { INVOICES, outstanding } from "../../data/invoices";
import { canRaiseReturn } from "../../data/returns";

interface Props {
  onSelect: (invoiceNumber: string) => void;
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "2-digit", year: "numeric" });
}

function fmt(val: number): string {
  return "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });
}

export default function InvoiceSearchInput({ onSelect }: Props) {
  const config = activeBrandConfig;
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const suggestions = useMemo(() => {
    if (query.length < 2) return [];
    const q = query.toLowerCase();
    return INVOICES.filter((inv) => inv.invoiceNumber.toLowerCase().includes(q)).slice(0, 8);
  }, [query]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <div className="relative">
        <SearchOutlined
          className="absolute left-3 top-1/2 -translate-y-1/2"
          style={{ fontSize: 13, color: config.secondaryColor, pointerEvents: "none" }}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setIsOpen(true); }}
          onFocus={() => { if (query.length >= 2) setIsOpen(true); }}
          placeholder="Search Invoice #"
          className="w-full text-sm rounded-lg pl-9 pr-3 py-2.5 outline-none"
          style={{ border: `1px solid ${config.borderColor}`, color: config.primaryColor, backgroundColor: "#fff" }}
        />
      </div>

      {isOpen && query.length >= 2 && (
        <div
          className="absolute left-0 right-0 mt-1 rounded-lg shadow-lg overflow-hidden z-20"
          style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff", maxHeight: 320, overflowY: "auto" }}
        >
          {suggestions.length === 0 ? (
            <div className="px-4 py-4 text-center text-xs" style={{ color: config.secondaryColor }}>
              No matching invoices found.
            </div>
          ) : (
            suggestions.map((inv) => {
              const bal = outstanding(inv);
              const eligible = canRaiseReturn(inv.invoiceDate);
              return (
                <button
                  key={inv.id}
                  onClick={() => { onSelect(inv.invoiceNumber); setQuery(""); setIsOpen(false); }}
                  className="w-full text-left px-4 py-3 cursor-pointer bg-transparent border-none hover:bg-gray-50 transition-colors block"
                  style={{ borderBottom: `1px solid ${config.borderColor}`, opacity: eligible ? 1 : 0.5 }}
                >
                  <div className="flex items-center gap-2">
                    <FileTextOutlined style={{ fontSize: 12, color: config.secondaryColor }} />
                    <span className="text-sm font-medium" style={{ color: config.primaryColor }}>
                      {inv.invoiceNumber}
                    </span>
                    {!eligible && (
                      <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>
                        Outside return window
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] m-0 mt-1 ml-5" style={{ color: config.secondaryColor }}>
                    {formatDate(inv.invoiceDate)} • {fmt(inv.amount)} • Balance: {fmt(bal)}
                  </p>
                </button>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}
