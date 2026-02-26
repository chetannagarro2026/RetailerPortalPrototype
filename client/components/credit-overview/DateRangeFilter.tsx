import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import { CalendarOutlined, DownOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";

// ── FY helpers ──────────────────────────────────────────────────────

function getFYStart(today: Date): Date {
  const year = today.getMonth() >= 3 ? today.getFullYear() : today.getFullYear() - 1;
  return new Date(year, 3, 1); // Apr 1
}

function getFYEnd(today: Date): Date {
  const year = today.getMonth() >= 3 ? today.getFullYear() + 1 : today.getFullYear();
  return new Date(year, 2, 31); // Mar 31
}

function getQuarterRange(q: number, today: Date): [Date, Date] {
  const fyStart = getFYStart(today);
  const fyYear = fyStart.getFullYear();
  const quarters: [Date, Date][] = [
    [new Date(fyYear, 3, 1), new Date(fyYear, 5, 30)],       // Q1 Apr–Jun
    [new Date(fyYear, 6, 1), new Date(fyYear, 8, 30)],       // Q2 Jul–Sep
    [new Date(fyYear, 9, 1), new Date(fyYear, 11, 31)],      // Q3 Oct–Dec
    [new Date(fyYear + 1, 0, 1), new Date(fyYear + 1, 2, 31)], // Q4 Jan–Mar
  ];
  return quarters[q];
}

function getLast30(today: Date): [Date, Date] {
  const start = new Date(today);
  start.setDate(start.getDate() - 30);
  return [start, today];
}

function toISODate(d: Date): string {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatShort(d: Date): string {
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function datesEqual(a: Date, b: Date): boolean {
  return toISODate(a) === toISODate(b);
}

// ── Chip definitions ────────────────────────────────────────────────

type ChipKey = "fy" | "last30" | "q1" | "q2" | "q3" | "q4";

interface Chip {
  key: ChipKey;
  label: string;
  getRange: (today: Date) => [Date, Date];
}

const CHIPS: Chip[] = [
  { key: "fy", label: "This FY", getRange: (t) => [getFYStart(t), getFYEnd(t)] },
  { key: "last30", label: "Last 30 Days", getRange: getLast30 },
  { key: "q1", label: "Q1", getRange: (t) => getQuarterRange(0, t) },
  { key: "q2", label: "Q2", getRange: (t) => getQuarterRange(1, t) },
  { key: "q3", label: "Q3", getRange: (t) => getQuarterRange(2, t) },
  { key: "q4", label: "Q4", getRange: (t) => getQuarterRange(3, t) },
];

// ── Props ───────────────────────────────────────────────────────────

export interface DateRange {
  start: Date;
  end: Date;
}

interface Props {
  value: DateRange;
  onChange: (range: DateRange) => void;
}

// ── Component ───────────────────────────────────────────────────────

export default function DateRangeFilter({ value, onChange }: Props) {
  const config = activeBrandConfig;
  const today = useMemo(() => new Date(), []);
  const [open, setOpen] = useState(false);
  const [tempStart, setTempStart] = useState(toISODate(value.start));
  const [tempEnd, setTempEnd] = useState(toISODate(value.end));
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    if (open) document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  // Sync temp inputs when value changes externally
  useEffect(() => {
    setTempStart(toISODate(value.start));
    setTempEnd(toISODate(value.end));
  }, [value]);

  // Detect which chip matches current range
  const activeChip = useMemo<ChipKey | null>(() => {
    for (const chip of CHIPS) {
      const [s, e] = chip.getRange(today);
      if (datesEqual(value.start, s) && datesEqual(value.end, e)) return chip.key;
    }
    return null;
  }, [value, today]);

  // Button label
  const buttonLabel = useMemo(() => {
    if (activeChip) {
      const chip = CHIPS.find((c) => c.key === activeChip);
      if (chip) {
        if (chip.key === "fy") return "This Financial Year";
        if (chip.key === "last30") return "Last 30 Days";
        return chip.label;
      }
    }
    return `${formatShort(value.start)} – ${formatShort(value.end)}`;
  }, [activeChip, value]);

  const handleChipClick = useCallback(
    (chip: Chip) => {
      const [s, e] = chip.getRange(today);
      onChange({ start: s, end: e });
      setOpen(false);
    },
    [today, onChange],
  );

  const handleApply = () => {
    onChange({ start: new Date(tempStart), end: new Date(tempEnd) });
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      {/* Trigger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 text-sm rounded-lg px-3 py-2 cursor-pointer transition-colors"
        style={{
          border: `1px solid ${config.borderColor}`,
          color: config.primaryColor,
          backgroundColor: "#fff",
        }}
      >
        <CalendarOutlined style={{ fontSize: 13, color: config.secondaryColor }} />
        <span>{buttonLabel}</span>
        <DownOutlined style={{ fontSize: 10, color: config.secondaryColor }} />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className="absolute left-0 top-full mt-1 rounded-xl p-4 z-50"
          style={{
            backgroundColor: "#fff",
            border: `1px solid ${config.borderColor}`,
            boxShadow: "0 4px 16px rgba(0,0,0,0.1)",
            width: 340,
          }}
        >
          {/* Quick Select Chips */}
          <p className="text-[11px] font-semibold uppercase tracking-wider m-0 mb-2" style={{ color: config.secondaryColor }}>
            Quick Select
          </p>
          <div className="flex flex-wrap gap-2 mb-4">
            {CHIPS.map((chip) => {
              const isActive = activeChip === chip.key;
              return (
                <button
                  key={chip.key}
                  onClick={() => handleChipClick(chip)}
                  className="text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                  style={{
                    backgroundColor: isActive ? config.primaryColor : "#fff",
                    color: isActive ? "#fff" : config.primaryColor,
                    border: `1px solid ${isActive ? config.primaryColor : config.borderColor}`,
                  }}
                >
                  {chip.label}
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="mb-4" style={{ borderBottom: `1px solid ${config.borderColor}` }} />

          {/* Custom Date Range */}
          <p className="text-[11px] font-semibold uppercase tracking-wider m-0 mb-2" style={{ color: config.secondaryColor }}>
            Custom Range
          </p>
          <div className="flex items-center gap-2 mb-3">
            <input
              type="date"
              value={tempStart}
              onChange={(e) => setTempStart(e.target.value)}
              className="text-xs rounded-lg px-2.5 py-2 outline-none flex-1"
              style={{ border: `1px solid ${config.borderColor}`, color: config.primaryColor, boxSizing: "border-box" }}
            />
            <span className="text-xs" style={{ color: config.secondaryColor }}>to</span>
            <input
              type="date"
              value={tempEnd}
              onChange={(e) => setTempEnd(e.target.value)}
              className="text-xs rounded-lg px-2.5 py-2 outline-none flex-1"
              style={{ border: `1px solid ${config.borderColor}`, color: config.primaryColor, boxSizing: "border-box" }}
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              onClick={() => setOpen(false)}
              className="text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer"
              style={{ backgroundColor: "#fff", color: config.secondaryColor, border: `1px solid ${config.borderColor}` }}
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="text-xs font-medium px-3 py-1.5 rounded-lg cursor-pointer text-white border-none"
              style={{ backgroundColor: config.primaryColor }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Export helpers for use in TransactionLedger
export { getFYStart, getFYEnd, toISODate };
