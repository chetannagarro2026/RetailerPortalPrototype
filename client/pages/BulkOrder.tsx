import { useState, useCallback, useRef, useEffect } from "react";
import { Button, Row, Col } from "antd";
import { ShoppingCartOutlined, SyncOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import LineByLinePanel, {
  type OrderEntry,
  type EntryError,
} from "../components/bulk-order/LineByLinePanel";
import PastePanel from "../components/bulk-order/PastePanel";

type Source = "lines" | "paste" | null;

const EMPTY_ROWS: OrderEntry[] = [
  { itemCode: "", quantity: "" },
  { itemCode: "", quantity: "" },
  { itemCode: "", quantity: "" },
];

function entriesToText(entries: OrderEntry[]): string {
  return entries
    .filter((e) => e.itemCode.trim() || e.quantity.trim())
    .map((e) => `${e.itemCode.trim()},${e.quantity.trim()}`)
    .join("\n");
}

function textToEntries(text: string): OrderEntry[] {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return [...EMPTY_ROWS];

  return lines.map((line) => {
    const parts = line.split(",").map((p) => p.trim());
    return {
      itemCode: parts[0] || "",
      quantity: parts[1] || "",
    };
  });
}

function validateEntries(entries: OrderEntry[]): {
  errors: EntryError[];
  validCount: number;
} {
  const errors: EntryError[] = [];
  let validCount = 0;

  entries.forEach((entry, row) => {
    const hasCode = entry.itemCode.trim().length > 0;
    const hasQty = entry.quantity.trim().length > 0;

    // Skip fully empty rows
    if (!hasCode && !hasQty) return;

    let rowValid = true;

    if (!hasCode) {
      errors.push({ row, field: "itemCode", message: "Required" });
      rowValid = false;
    }

    if (!hasQty) {
      errors.push({ row, field: "quantity", message: "Required" });
      rowValid = false;
    } else if (isNaN(Number(entry.quantity)) || Number(entry.quantity) <= 0) {
      errors.push({ row, field: "quantity", message: "Must be > 0" });
      rowValid = false;
    }

    if (rowValid) validCount++;
  });

  return { errors, validCount };
}

function validatePasteText(text: string): string | null {
  const lines = text.split("\n").filter((l) => l.trim());
  if (lines.length === 0) return null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    const parts = line.split(",");
    if (parts.length < 2 || !parts[0].trim() || !parts[1].trim()) {
      return `Invalid format on line ${i + 1}. Please use ItemCode,Qty format.`;
    }
    const qty = Number(parts[1].trim());
    if (isNaN(qty) || qty <= 0) {
      return `Invalid quantity on line ${i + 1}. Qty must be a number greater than 0.`;
    }
  }
  return null;
}

export default function BulkOrder() {
  const config = activeBrandConfig;
  const [entries, setEntries] = useState<OrderEntry[]>([...EMPTY_ROWS]);
  const [pasteText, setPasteText] = useState("");
  const [lastSource, setLastSource] = useState<Source>(null);
  const [lineErrors, setLineErrors] = useState<EntryError[]>([]);
  const [pasteError, setPasteError] = useState<string | null>(null);
  const syncTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Sync: lines → textarea (debounced)
  useEffect(() => {
    if (lastSource !== "lines") return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

    syncTimerRef.current = setTimeout(() => {
      const { errors } = validateEntries(entries);
      setLineErrors(errors);
      // Only sync valid entries to textarea
      const validEntries = entries.filter((e, i) => {
        const hasCode = e.itemCode.trim().length > 0;
        const hasQty = e.quantity.trim().length > 0;
        if (!hasCode && !hasQty) return false;
        return !errors.some((err) => err.row === i);
      });
      setPasteText(entriesToText(validEntries));
      setPasteError(null);
    }, 500);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [entries, lastSource]);

  // Sync: textarea → lines (debounced)
  useEffect(() => {
    if (lastSource !== "paste") return;
    if (syncTimerRef.current) clearTimeout(syncTimerRef.current);

    syncTimerRef.current = setTimeout(() => {
      const error = validatePasteText(pasteText);
      setPasteError(error);
      if (!error) {
        const parsed = textToEntries(pasteText);
        setEntries(parsed.length > 0 ? parsed : [...EMPTY_ROWS]);
        setLineErrors([]);
      }
    }, 500);

    return () => {
      if (syncTimerRef.current) clearTimeout(syncTimerRef.current);
    };
  }, [pasteText, lastSource]);

  const handleLinesUpdate = useCallback((updated: OrderEntry[]) => {
    setEntries(updated);
  }, []);

  const handleLinesFocus = useCallback(() => {
    setLastSource("lines");
  }, []);

  const handlePasteChange = useCallback((value: string) => {
    setPasteText(value);
  }, []);

  const handlePasteFocus = useCallback(() => {
    setLastSource("paste");
  }, []);

  // Count valid entries for CTA state
  const { validCount } = validateEntries(entries);

  return (
    <div className="max-w-content mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8">
        <h1
          className="text-2xl font-semibold mb-2"
          style={{ color: config.primaryColor }}
        >
          Bulk Order
        </h1>
        <p className="text-sm leading-relaxed" style={{ color: "#4B5563" }}>
          Save time and place orders faster by entering your preselected item codes
          and quantities using one or both of the methods below.
        </p>
        <p
          className="text-xs mt-2 flex items-center gap-1.5"
          style={{ color: config.secondaryColor }}
        >
          <SyncOutlined className="text-[11px]" />
          Entries added in one section will automatically reflect in the other.
        </p>
      </div>

      {/* Two-Column Layout */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={12}>
          <LineByLinePanel
            entries={entries}
            errors={lineErrors}
            onUpdate={handleLinesUpdate}
            onFocus={handleLinesFocus}
          />
        </Col>
        <Col xs={24} lg={12}>
          <PastePanel
            value={pasteText}
            onChange={handlePasteChange}
            onFocus={handlePasteFocus}
            error={pasteError}
          />
        </Col>
      </Row>

      {/* CTA */}
      <div className="mt-8 flex items-center justify-between">
        <span className="text-sm" style={{ color: config.secondaryColor }}>
          {validCount > 0
            ? `${validCount} valid item${validCount !== 1 ? "s" : ""} ready to add`
            : "No valid items entered yet"}
        </span>
        <Button
          type="primary"
          size="large"
          icon={<ShoppingCartOutlined />}
          disabled={validCount === 0}
          style={{
            height: 44,
            paddingLeft: 28,
            paddingRight: 28,
            fontWeight: 600,
            borderRadius: 8,
            backgroundColor: validCount > 0 ? config.primaryColor : undefined,
          }}
        >
          Add to Order
        </Button>
      </div>
    </div>
  );
}
