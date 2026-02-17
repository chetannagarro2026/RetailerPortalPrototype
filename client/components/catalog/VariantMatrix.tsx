import { useState, useMemo, useCallback } from "react";
import { InputNumber } from "antd";
import { DownOutlined, RightOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogProduct, ProductVariant, VariantAttribute } from "../../data/catalogData";

interface VariantMatrixProps {
  product: CatalogProduct;
  quantities: Record<string, number>;
  onQuantityChange: (variantId: string, qty: number) => void;
}

export default function VariantMatrix({ product, quantities, onQuantityChange }: VariantMatrixProps) {
  const attrs = product.variantAttributes;
  if (!attrs || attrs.length === 0 || !product.variants) return null;

  if (attrs.length === 1) return <Matrix1D product={product} quantities={quantities} onQuantityChange={onQuantityChange} />;
  if (attrs.length === 2) return <Matrix2D product={product} quantities={quantities} onQuantityChange={onQuantityChange} />;
  return <Matrix3D product={product} quantities={quantities} onQuantityChange={onQuantityChange} />;
}

// ── 1D Matrix (single attribute list) ───────────────────────────────

function Matrix1D({ product, quantities, onQuantityChange }: VariantMatrixProps) {
  const config = activeBrandConfig;
  const attr = product.variantAttributes![0];
  const variants = product.variants!;
  const minQty = product.minOrderQty || 1;
  const step = product.casePackQty || 1;

  return (
    <div>
      <div className="text-xs font-semibold mb-3" style={{ color: config.primaryColor }}>
        {attr.name}
      </div>
      <div className="space-y-1">
        {attr.values.map((val) => {
          const variant = variants.find((v) => v.attributes[attr.name] === val);
          if (!variant) return null;
          const disabled = variant.availabilityStatus === "out-of-stock";
          return (
            <VariantRow
              key={variant.id}
              label={val}
              variant={variant}
              qty={quantities[variant.id] || 0}
              onQtyChange={(q) => onQuantityChange(variant.id, q)}
              minQty={minQty}
              step={step}
              disabled={disabled}
            />
          );
        })}
      </div>
    </div>
  );
}

// ── 2D Matrix (rows × columns table) ───────────────────────────────

function Matrix2D({ product, quantities, onQuantityChange }: VariantMatrixProps) {
  const config = activeBrandConfig;
  const [rowAttr, colAttr] = product.variantAttributes!;
  const variants = product.variants!;
  const minQty = product.minOrderQty || 1;
  const step = product.casePackQty || 1;

  const findVariant = useCallback(
    (rowVal: string, colVal: string) =>
      variants.find((v) => v.attributes[rowAttr.name] === rowVal && v.attributes[colAttr.name] === colVal),
    [variants, rowAttr.name, colAttr.name],
  );

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse text-xs">
        <thead>
          <tr>
            <th
              className="text-left px-3 py-2 font-semibold"
              style={{ color: config.secondaryColor, borderBottom: `2px solid ${config.borderColor}` }}
            >
              {rowAttr.name} / {colAttr.name}
            </th>
            {colAttr.values.map((col) => (
              <th
                key={col}
                className="text-center px-2 py-2 font-semibold min-w-[72px]"
                style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rowAttr.values.map((row) => (
            <tr key={row}>
              <td
                className="px-3 py-2 font-medium whitespace-nowrap"
                style={{ color: config.primaryColor, borderBottom: `1px solid ${config.borderColor}` }}
              >
                {row}
              </td>
              {colAttr.values.map((col) => {
                const variant = findVariant(row, col);
                if (!variant) return <td key={col} className="px-2 py-2" style={{ borderBottom: `1px solid ${config.borderColor}` }} />;
                const disabled = variant.availabilityStatus === "out-of-stock";
                return (
                  <td
                    key={col}
                    className="px-2 py-2 text-center"
                    style={{ borderBottom: `1px solid ${config.borderColor}` }}
                  >
                    <MatrixCell
                      variant={variant}
                      qty={quantities[variant.id] || 0}
                      onQtyChange={(q) => onQuantityChange(variant.id, q)}
                      minQty={minQty}
                      step={step}
                      disabled={disabled}
                    />
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── 3D Matrix (expandable rows for third dimension) ─────────────────

function Matrix3D({ product, quantities, onQuantityChange }: VariantMatrixProps) {
  const config = activeBrandConfig;
  const attrs = product.variantAttributes!;
  const [primaryAttr, secondaryAttr, ...tertiaryAttrs] = attrs;
  const variants = product.variants!;
  const minQty = product.minOrderQty || 1;
  const step = product.casePackQty || 1;
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  // For 3D we use the third attribute as an expansion layer
  const tertiaryAttr = tertiaryAttrs[0];

  const toggleExpand = useCallback((key: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  return (
    <div className="overflow-x-auto">
      <div className="text-[11px] mb-2" style={{ color: config.secondaryColor }}>
        Expand each {tertiaryAttr.name} to enter quantities
      </div>
      {tertiaryAttr.values.map((tVal) => {
        const key = tVal;
        const isOpen = expanded.has(key);
        return (
          <div key={tVal} className="mb-2">
            <button
              onClick={() => toggleExpand(key)}
              className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg text-xs font-medium cursor-pointer transition-colors"
              style={{
                backgroundColor: isOpen ? config.cardBg : "#fff",
                color: config.primaryColor,
                border: `1px solid ${config.borderColor}`,
              }}
            >
              {isOpen ? <DownOutlined className="text-[10px]" /> : <RightOutlined className="text-[10px]" />}
              {tertiaryAttr.name}: {tVal}
            </button>
            {isOpen && (
              <div className="mt-1 ml-4">
                <table className="w-full border-collapse text-xs">
                  <thead>
                    <tr>
                      <th
                        className="text-left px-3 py-1.5 font-semibold"
                        style={{ color: config.secondaryColor, borderBottom: `1px solid ${config.borderColor}` }}
                      >
                        {primaryAttr.name}
                      </th>
                      {secondaryAttr.values.map((col) => (
                        <th
                          key={col}
                          className="text-center px-2 py-1.5 font-semibold min-w-[68px]"
                          style={{ color: config.primaryColor, borderBottom: `1px solid ${config.borderColor}` }}
                        >
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {primaryAttr.values.map((pVal) => (
                      <tr key={pVal}>
                        <td
                          className="px-3 py-1.5 font-medium"
                          style={{ color: config.primaryColor, borderBottom: `1px solid ${config.borderColor}` }}
                        >
                          {pVal}
                        </td>
                        {secondaryAttr.values.map((sVal) => {
                          const variant = variants.find(
                            (v) =>
                              v.attributes[primaryAttr.name] === pVal &&
                              v.attributes[secondaryAttr.name] === sVal &&
                              v.attributes[tertiaryAttr.name] === tVal,
                          );
                          if (!variant) return <td key={sVal} style={{ borderBottom: `1px solid ${config.borderColor}` }} />;
                          const disabled = variant.availabilityStatus === "out-of-stock";
                          return (
                            <td
                              key={sVal}
                              className="px-2 py-1.5 text-center"
                              style={{ borderBottom: `1px solid ${config.borderColor}` }}
                            >
                              <MatrixCell
                                variant={variant}
                                qty={quantities[variant.id] || 0}
                                onQtyChange={(q) => onQuantityChange(variant.id, q)}
                                minQty={minQty}
                                step={step}
                                disabled={disabled}
                              />
                            </td>
                          );
                        })}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Shared: Matrix Cell (input inside 2D/3D table) ──────────────────

function MatrixCell({
  variant,
  qty,
  onQtyChange,
  minQty,
  step,
  disabled,
}: {
  variant: ProductVariant;
  qty: number;
  onQtyChange: (q: number) => void;
  minQty: number;
  step: number;
  disabled: boolean;
}) {
  const config = activeBrandConfig;

  const handleChange = useCallback(
    (val: number | null) => {
      if (val === null || val === 0) {
        onQtyChange(0);
        return;
      }
      const snapped = Math.max(minQty, Math.round(val / step) * step || step);
      onQtyChange(snapped);
    },
    [onQtyChange, minQty, step],
  );

  return (
    <div className="relative">
      <InputNumber
        size="small"
        min={0}
        step={step}
        value={qty || undefined}
        placeholder={disabled ? "—" : "0"}
        onChange={handleChange}
        disabled={disabled}
        className="w-[60px]"
        controls={false}
      />
      {variant.availabilityStatus === "low-stock" && qty === 0 && (
        <div className="text-[8px] mt-0.5" style={{ color: "#D97706" }}>Low</div>
      )}
    </div>
  );
}

// ── Shared: 1D Variant Row ──────────────────────────────────────────

function VariantRow({
  label,
  variant,
  qty,
  onQtyChange,
  minQty,
  step,
  disabled,
}: {
  label: string;
  variant: ProductVariant;
  qty: number;
  onQtyChange: (q: number) => void;
  minQty: number;
  step: number;
  disabled: boolean;
}) {
  const config = activeBrandConfig;

  const handleChange = useCallback(
    (val: number | null) => {
      if (val === null || val === 0) {
        onQtyChange(0);
        return;
      }
      const snapped = Math.max(minQty, Math.round(val / step) * step || step);
      onQtyChange(snapped);
    },
    [onQtyChange, minQty, step],
  );

  return (
    <div
      className="flex items-center justify-between px-3 py-2 rounded-lg"
      style={{
        backgroundColor: disabled ? "#f9fafb" : "#fff",
        border: `1px solid ${config.borderColor}`,
        opacity: disabled ? 0.5 : 1,
      }}
    >
      <div className="flex items-center gap-3">
        <span className="text-xs font-medium" style={{ color: config.primaryColor }}>
          {label}
        </span>
        {variant.availabilityStatus === "low-stock" && (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#FFF7ED", color: "#9A3412" }}>
            Low Stock
          </span>
        )}
        {disabled && (
          <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>
            Out of Stock
          </span>
        )}
        <span className="text-[10px]" style={{ color: config.secondaryColor }}>
          ${variant.price.toFixed(2)}
        </span>
      </div>
      <InputNumber
        size="small"
        min={0}
        step={step}
        value={qty || undefined}
        placeholder="0"
        onChange={handleChange}
        disabled={disabled}
        className="w-[72px]"
      />
    </div>
  );
}
