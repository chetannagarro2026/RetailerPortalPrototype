import { useState, useMemo, useCallback } from "react";
import { InputNumber } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { useOrder } from "../../context/OrderContext";
import type { CatalogProduct } from "../../data/catalogData";

interface QuickMatrixProps {
  product: CatalogProduct;
  onClose: () => void;
}

export default function QuickMatrix({ product, onClose }: QuickMatrixProps) {
  const config = activeBrandConfig;
  const { addItems } = useOrder();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const attrs = product.variantAttributes;
  const variants = product.variants;
  const minQty = product.minOrderQty || 1;
  const step = product.casePackQty || 1;

  if (!attrs || !variants || attrs.length === 0) return null;

  const handleQtyChange = useCallback(
    (variantId: string, val: number | null) => {
      setQuantities((prev) => {
        const next = { ...prev };
        if (!val || val <= 0) delete next[variantId];
        else {
          const snapped = Math.max(minQty, Math.round(val / step) * step || step);
          next[variantId] = snapped;
        }
        return next;
      });
    },
    [minQty, step],
  );

  const { totalUnits, filledCount } = useMemo(() => {
    let units = 0;
    let count = 0;
    for (const qty of Object.values(quantities)) {
      if (qty > 0) { units += qty; count++; }
    }
    return { totalUnits: units, filledCount: count };
  }, [quantities]);

  const handleAddSelected = () => {
    if (filledCount === 0) return;
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([vid, qty]) => {
        const v = variants.find((x) => x.id === vid)!;
        return {
          id: v.id,
          productId: product.id,
          productName: product.name,
          upc: v.upc,
          variantAttributes: v.attributes,
          quantity: qty,
          unitPrice: v.price,
          imageUrl: product.imageUrl,
        };
      });
    addItems(items);
    setQuantities({});
    onClose();
  };

  // 1D: simple row list
  if (attrs.length === 1) {
    const attr = attrs[0];
    return (
      <div
        className="p-3 rounded-b-xl"
        style={{ backgroundColor: config.cardBg, borderTop: `1px solid ${config.borderColor}` }}
      >
        <div className="flex flex-wrap gap-2 mb-2">
          {attr.values.map((val) => {
            const v = variants.find((x) => x.attributes[attr.name] === val);
            if (!v) return null;
            const disabled = v.availabilityStatus === "out-of-stock";
            return (
              <div key={v.id} className="flex items-center gap-1.5">
                <span className="text-[10px] font-medium w-6" style={{ color: disabled ? "#ccc" : config.primaryColor }}>
                  {val}
                </span>
                <InputNumber
                  size="small"
                  min={0}
                  step={step}
                  value={quantities[v.id] || undefined}
                  placeholder="0"
                  onChange={(n) => handleQtyChange(v.id, n)}
                  disabled={disabled}
                  className="w-[52px]"
                  controls={false}
                />
              </div>
            );
          })}
        </div>
        <QuickMatrixFooter
          filledCount={filledCount}
          totalUnits={totalUnits}
          onAdd={handleAddSelected}
        />
      </div>
    );
  }

  // 2D: mini table
  const [rowAttr, colAttr] = attrs;
  return (
    <div
      className="p-3 rounded-b-xl overflow-x-auto"
      style={{ backgroundColor: config.cardBg, borderTop: `1px solid ${config.borderColor}` }}
    >
      <table className="w-full border-collapse text-[10px] mb-2">
        <thead>
          <tr>
            <th className="text-left px-1 py-1" style={{ color: config.secondaryColor }} />
            {colAttr.values.map((c) => (
              <th key={c} className="text-center px-1 py-1 font-semibold" style={{ color: config.primaryColor }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowAttr.values.map((r) => (
            <tr key={r}>
              <td className="px-1 py-1 font-medium whitespace-nowrap" style={{ color: config.primaryColor }}>
                {r}
              </td>
              {colAttr.values.map((c) => {
                const v = variants.find(
                  (x) => x.attributes[rowAttr.name] === r && x.attributes[colAttr.name] === c,
                );
                if (!v) return <td key={c} />;
                const disabled = v.availabilityStatus === "out-of-stock";
                return (
                  <td key={c} className="px-1 py-1 text-center">
                    <InputNumber
                      size="small"
                      min={0}
                      step={step}
                      value={quantities[v.id] || undefined}
                      placeholder={disabled ? "—" : "0"}
                      onChange={(n) => handleQtyChange(v.id, n)}
                      disabled={disabled}
                      className="w-[48px]"
                      controls={false}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <QuickMatrixFooter
        filledCount={filledCount}
        totalUnits={totalUnits}
        onAdd={handleAddSelected}
      />
    </div>
  );
}

function QuickMatrixFooter({
  filledCount,
  totalUnits,
  onAdd,
}: {
  filledCount: number;
  totalUnits: number;
  onAdd: () => void;
}) {
  const config = activeBrandConfig;
  const isEmpty = filledCount === 0;

  return (
    <div className="flex items-center justify-between">
      <span className="text-[10px]" style={{ color: config.secondaryColor }}>
        {isEmpty ? "Enter quantities" : `${totalUnits} units`}
      </span>
      <button
        onClick={onAdd}
        disabled={isEmpty}
        className="flex items-center gap-1 text-[10px] font-semibold px-3 py-1 rounded-md cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        style={{
          backgroundColor: isEmpty ? config.secondaryColor : config.primaryColor,
          color: "#fff",
          border: "none",
        }}
      >
        <ShoppingCartOutlined className="text-[10px]" />
        Add Selected
      </button>
    </div>
  );
}
