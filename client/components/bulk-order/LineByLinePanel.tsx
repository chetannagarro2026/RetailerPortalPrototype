import { Input, Button } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";

export interface OrderEntry {
  itemCode: string;
  quantity: string;
}

export interface EntryError {
  row: number;
  field: "itemCode" | "quantity";
  message: string;
}

interface LineByLinePanelProps {
  entries: OrderEntry[];
  errors: EntryError[];
  onUpdate: (entries: OrderEntry[]) => void;
  onFocus: () => void;
}

export default function LineByLinePanel({ entries, errors, onUpdate, onFocus }: LineByLinePanelProps) {
  const config = activeBrandConfig;

  const updateRow = (index: number, field: keyof OrderEntry, value: string) => {
    const updated = entries.map((entry, i) =>
      i === index ? { ...entry, [field]: value } : entry
    );
    onUpdate(updated);
  };

  const addRow = () => {
    onUpdate([...entries, { itemCode: "", quantity: "" }]);
  };

  const removeRow = (index: number) => {
    if (entries.length <= 1) return;
    onUpdate(entries.filter((_, i) => i !== index));
  };

  const getError = (row: number, field: "itemCode" | "quantity") =>
    errors.find((e) => e.row === row && e.field === field);

  return (
    <div
      className="rounded-xl p-5 lg:p-6"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <h3 className="text-base font-semibold mb-1" style={{ color: config.primaryColor }}>
        Enter Line by Line
      </h3>
      <p className="text-xs mb-5" style={{ color: config.secondaryColor }}>
        Enter individual item codes and quantities.
      </p>

      {/* Column Headers */}
      <div className="flex items-center gap-3 mb-2 px-0.5">
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: config.secondaryColor }}>
          Item Code
        </span>
        <span className="w-[90px] text-[11px] font-semibold uppercase tracking-wider" style={{ color: config.secondaryColor }}>
          Qty
        </span>
        <span className="w-[32px]" />
      </div>

      {/* Rows */}
      <div className="space-y-2.5">
        {entries.map((entry, index) => {
          const codeErr = getError(index, "itemCode");
          const qtyErr = getError(index, "quantity");

          return (
            <div key={index} className="flex items-start gap-3">
              <div className="flex-1">
                <Input
                  placeholder="e.g. CKK-FT26-101"
                  value={entry.itemCode}
                  onChange={(e) => updateRow(index, "itemCode", e.target.value)}
                  onFocus={onFocus}
                  status={codeErr ? "error" : undefined}
                  size="middle"
                  style={{ borderRadius: 8 }}
                />
                {codeErr && (
                  <p className="text-[11px] text-red-500 mt-0.5 ml-0.5">{codeErr.message}</p>
                )}
              </div>
              <div className="w-[90px]">
                <Input
                  placeholder="Qty"
                  value={entry.quantity}
                  onChange={(e) => updateRow(index, "quantity", e.target.value)}
                  onFocus={onFocus}
                  status={qtyErr ? "error" : undefined}
                  size="middle"
                  style={{ borderRadius: 8 }}
                />
                {qtyErr && (
                  <p className="text-[11px] text-red-500 mt-0.5 ml-0.5">{qtyErr.message}</p>
                )}
              </div>
              <button
                onClick={() => removeRow(index)}
                disabled={entries.length <= 1}
                className="mt-1 p-1.5 rounded-md transition-colors cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed"
                style={{ color: config.secondaryColor }}
                onMouseEnter={(e) => {
                  if (entries.length > 1) {
                    e.currentTarget.style.color = "#DC2626";
                    e.currentTarget.style.backgroundColor = "#FEF2F2";
                  }
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = config.secondaryColor;
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <DeleteOutlined className="text-sm" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Add Row */}
      <Button
        type="dashed"
        icon={<PlusOutlined />}
        onClick={addRow}
        className="mt-4"
        block
        style={{ borderRadius: 8, height: 36, color: config.secondaryColor }}
      >
        Add More Items
      </Button>
    </div>
  );
}
