import { useState } from "react";
import { Input, Button, Radio } from "antd";
import { EnvironmentOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { ProductVariant } from "../../data/catalogData";

interface FulfillmentPanelProps {
  variant: ProductVariant;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  "in-stock": { label: "In Stock", color: "#16A34A", bg: "#F0FDF4" },
  "low-stock": { label: "Low Stock", color: "#D97706", bg: "#FFF7ED" },
  "out-of-stock": { label: "Not Available", color: "#DC2626", bg: "#FEF2F2" },
  "pre-order": { label: "Pre-Order", color: "#7C3AED", bg: "#F5F3FF" },
};

export default function FulfillmentPanel({ variant }: FulfillmentPanelProps) {
  const config = activeBrandConfig;
  const [method, setMethod] = useState<"ship" | "pickup">("ship");
  const [zip, setZip] = useState("");
  const [checked, setChecked] = useState(false);

  const status = STATUS_CONFIG[variant.availabilityStatus] || STATUS_CONFIG["in-stock"];

  return (
    <div className="space-y-2.5">
      <div className="flex items-center gap-1 text-[11px] font-semibold" style={{ color: config.secondaryColor }}>
        <EnvironmentOutlined className="text-[10px]" />
        Fulfillment
      </div>

      <Radio.Group
        value={method}
        onChange={(e) => { setMethod(e.target.value); setChecked(false); }}
        size="small"
      >
        <Radio.Button value="ship">Ship</Radio.Button>
        <Radio.Button value="pickup">Pickup</Radio.Button>
      </Radio.Group>

      <div className="flex items-center gap-2">
        <Input
          size="small"
          placeholder="ZIP / Postal code"
          value={zip}
          onChange={(e) => { setZip(e.target.value); setChecked(false); }}
          style={{ width: 140, borderRadius: 6 }}
        />
        <Button
          size="small"
          onClick={() => setChecked(true)}
          disabled={!zip.trim()}
          style={{ borderRadius: 6 }}
        >
          Check
        </Button>
      </div>

      {checked && (
        <div
          className="flex items-center gap-1.5 text-[11px] px-2.5 py-1.5 rounded-md"
          style={{ backgroundColor: status.bg, color: status.color }}
        >
          <CheckCircleOutlined className="text-[10px]" />
          <span className="font-medium">{status.label}</span>
          {method === "ship" && variant.availabilityStatus !== "out-of-stock" && (
            <span className="font-normal">— Est. 3–5 business days</span>
          )}
        </div>
      )}
    </div>
  );
}
