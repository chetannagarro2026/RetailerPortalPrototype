import { Drawer } from "antd";
import { CheckCircleFilled } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { PromotionInfo } from "../../data/catalogData";

interface PromotionInfoDrawerProps {
  open: boolean;
  onClose: () => void;
  productName: string;
  promotions: PromotionInfo[];
}

export default function PromotionInfoDrawer({
  open,
  onClose,
  productName,
  promotions,
}: PromotionInfoDrawerProps) {
  const config = activeBrandConfig;

  return (
    <Drawer
      title={
        <span className="text-base font-semibold" style={{ color: config.primaryColor }}>
          Promotions — {productName}
        </span>
      }
      placement="right"
      width={400}
      open={open}
      onClose={onClose}
      styles={{ body: { padding: "16px 20px", display: "flex", flexDirection: "column" } }}
    >
      {/* Info note — just below title */}
      <div
        className="flex items-center gap-1.5 pb-3 mb-3"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        <CheckCircleFilled style={{ fontSize: 14, color: "#0D7A4A", flexShrink: 0 }} />
        <span className="text-xs font-medium" style={{ color: "#0D7A4A" }}>
          Best promotion is applied automatically when added to cart
        </span>
      </div>

      <div className="flex-1 space-y-3">
        {promotions.length === 0 && (
          <p className="text-xs py-4" style={{ color: config.secondaryColor }}>
            No promotions available for this product.
          </p>
        )}

        {promotions.map((promo) => (
          <PromoInfoCard key={promo.id} promo={promo} />
        ))}
      </div>
    </Drawer>
  );
}

function PromoInfoCard({ promo }: { promo: PromotionInfo }) {
  const config = activeBrandConfig;

  const conditionChips: string[] = [];
  if (promo.minQty && promo.minQty > 1) conditionChips.push(`Min: ${promo.minQty} units`);
  if (promo.qualifyingQty && promo.freeQty) {
    conditionChips.push(`Buy ${promo.qualifyingQty} Get ${promo.freeQty} Free`);
  }
  if (promo.validFrom || promo.validTo) {
    const from = promo.validFrom ? new Date(promo.validFrom).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
    const to = promo.validTo ? new Date(promo.validTo).toLocaleDateString("en-US", { month: "short", year: "numeric" }) : "";
    if (from && to) conditionChips.push(`Valid: ${from} – ${to}`);
    else if (from) conditionChips.push(`From: ${from}`);
    else if (to) conditionChips.push(`Until: ${to}`);
  }
  if (promo.scope) conditionChips.push(`Scope: ${promo.scope === "sku" ? "SKU Level" : "Family Level"}`);

  return (
    <div
      className="rounded-lg"
      style={{
        border: `1px solid ${config.borderColor}`,
        backgroundColor: "#fff",
        padding: "14px 16px",
      }}
    >
      <p className="text-sm font-semibold" style={{ color: config.primaryColor }}>
        {promo.label}
      </p>

      {promo.description && (
        <p className="text-xs mt-1" style={{ color: config.secondaryColor }}>
          {promo.description}
        </p>
      )}

      {promo.rules && promo.rules.length > 0 && (
        <div className="mt-1.5">
          {promo.rules.map((rule, i) => (
            <p key={i} className="text-[11px]" style={{ color: config.secondaryColor }}>
              • {rule}
            </p>
          ))}
        </div>
      )}

      {conditionChips.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {conditionChips.map((chip) => (
            <span
              key={chip}
              className="text-[11px] px-2 py-0.5 rounded"
              style={{
                backgroundColor: config.cardBg,
                color: config.secondaryColor,
                border: `1px solid ${config.borderColor}`,
              }}
            >
              {chip}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
