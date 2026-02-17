import { ShoppingCartOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogProduct } from "../../data/catalogData";

interface PDPSubtotalProps {
  totalUnits: number;
  totalValue: number;
  filledCount: number;
  onAddAll: () => void;
  product: CatalogProduct;
}

export default function PDPSubtotal({ totalUnits, totalValue, filledCount, onAddAll }: PDPSubtotalProps) {
  const config = activeBrandConfig;
  const isEmpty = filledCount === 0;

  return (
    <div
      className="rounded-xl p-5 mb-6 flex items-center justify-between flex-wrap gap-4"
      style={{
        border: `1px solid ${config.borderColor}`,
        backgroundColor: isEmpty ? "#fff" : config.cardBg,
      }}
    >
      <div>
        <p className="text-xs mb-0.5" style={{ color: config.secondaryColor }}>
          Order Summary
        </p>
        <div className="flex items-baseline gap-4">
          <span className="text-sm font-medium" style={{ color: config.primaryColor }}>
            {filledCount} variant{filledCount !== 1 ? "s" : ""} · {totalUnits} unit{totalUnits !== 1 ? "s" : ""}
          </span>
          <span className="text-lg font-semibold" style={{ color: config.primaryColor }}>
            ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </div>

      <button
        onClick={onAddAll}
        disabled={isEmpty}
        className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isEmpty ? config.secondaryColor : config.primaryColor,
          color: "#fff",
          border: "none",
        }}
      >
        <ShoppingCartOutlined />
        Add All to Order
      </button>
    </div>
  );
}
