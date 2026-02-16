import { activeBrandConfig } from "../../config/brandConfig";

interface PastePanelProps {
  value: string;
  onChange: (value: string) => void;
  onFocus: () => void;
  error: string | null;
}

export default function PastePanel({ value, onChange, onFocus, error }: PastePanelProps) {
  const config = activeBrandConfig;

  return (
    <div
      className="rounded-xl p-5 lg:p-6 flex flex-col"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <h3 className="text-base font-semibold mb-1" style={{ color: config.primaryColor }}>
        Copy & Paste from Line Sheet
      </h3>
      <p className="text-xs mb-1.5" style={{ color: config.secondaryColor }}>
        Copy and paste item codes and quantities separated by a comma.
        Ensure each item appears on a new line:
      </p>
      <p className="text-xs mb-4 font-mono" style={{ color: config.secondaryColor }}>
        ItemCode1, Qty<br />
        ItemCode2, Qty
      </p>

      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        placeholder={`CKK-FT26-101,12\nIZOD-FW26-204,8\nUA-PERF-312,15\nBUF-OUT-118,6`}
        className="flex-1 min-h-[240px] w-full resize-y text-sm leading-relaxed font-mono outline-none transition-colors"
        style={{
          borderRadius: 8,
          border: `1px solid ${error ? "#ff4d4f" : config.borderColor}`,
          padding: "12px 14px",
          color: "#1a1a1a",
          backgroundColor: config.cardBg,
        }}
        onMouseEnter={(e) => {
          if (!error) e.currentTarget.style.borderColor = config.secondaryColor;
        }}
        onMouseLeave={(e) => {
          if (!error) e.currentTarget.style.borderColor = config.borderColor;
        }}
      />

      {error && (
        <p className="text-[11px] text-red-500 mt-2">{error}</p>
      )}
    </div>
  );
}
