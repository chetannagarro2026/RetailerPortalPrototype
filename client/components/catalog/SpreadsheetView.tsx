import { useState, useMemo, useCallback } from "react";
import { InputNumber, Pagination } from "antd";
import { ShoppingCartOutlined, CaretUpOutlined, CaretDownOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { useOrder } from "../../context/OrderContext";
import type { CatalogProduct, ProductVariant } from "../../data/catalogData";

interface SpreadsheetViewProps {
  products: CatalogProduct[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

/** Flatten all products into variant-level rows for the spreadsheet */
interface SpreadsheetRow {
  product: CatalogProduct;
  variant: ProductVariant;
  attrColumns: Record<string, string>;
}

type SortDir = "asc" | "desc" | null;
interface SortState {
  column: string;
  dir: SortDir;
}

export default function SpreadsheetView({
  products,
  total,
  page,
  pageSize,
  onPageChange,
}: SpreadsheetViewProps) {
  const config = activeBrandConfig;
  const { addItems } = useOrder();
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [sort, setSort] = useState<SortState>({ column: "", dir: null });

  // Collect all unique attribute column names across all products
  const attrColumns = useMemo(() => {
    const colSet = new Set<string>();
    for (const p of products) {
      if (p.variantAttributes) {
        for (const a of p.variantAttributes) colSet.add(a.name);
      }
    }
    return Array.from(colSet);
  }, [products]);

  // Flatten products into rows
  const rows = useMemo<SpreadsheetRow[]>(() => {
    const result: SpreadsheetRow[] = [];
    for (const p of products) {
      if (p.variants && p.variants.length > 0) {
        for (const v of p.variants) {
          result.push({ product: p, variant: v, attrColumns: v.attributes });
        }
      } else {
        // Product without variants — show as single row
        result.push({
          product: p,
          variant: {
            id: p.id,
            upc: p.upc,
            attributes: {},
            price: p.price,
            availabilityStatus: p.availabilityStatus || "in-stock",
            stockQty: 100,
          },
          attrColumns: {},
        });
      }
    }
    return result;
  }, [products]);

  // Sort rows
  const sortedRows = useMemo(() => {
    if (!sort.column || !sort.dir) return rows;
    const sorted = [...rows];
    const dir = sort.dir === "asc" ? 1 : -1;
    sorted.sort((a, b) => {
      let aVal: string | number;
      let bVal: string | number;
      switch (sort.column) {
        case "upc":
          aVal = a.variant.upc;
          bVal = b.variant.upc;
          break;
        case "product":
          aVal = a.product.name;
          bVal = b.product.name;
          break;
        case "price":
          aVal = a.variant.price;
          bVal = b.variant.price;
          return (aVal - bVal) * dir;
        case "stock":
          aVal = a.variant.stockQty;
          bVal = b.variant.stockQty;
          return (aVal - bVal) * dir;
        default:
          aVal = a.attrColumns[sort.column] || "";
          bVal = b.attrColumns[sort.column] || "";
      }
      return String(aVal).localeCompare(String(bVal)) * dir;
    });
    return sorted;
  }, [rows, sort]);

  const toggleSort = useCallback((col: string) => {
    setSort((prev) => {
      if (prev.column !== col) return { column: col, dir: "asc" };
      if (prev.dir === "asc") return { column: col, dir: "desc" };
      return { column: "", dir: null };
    });
  }, []);

  const handleQtyChange = useCallback(
    (variantId: string, val: number | null) => {
      setQuantities((prev) => {
        const next = { ...prev };
        if (!val || val <= 0) delete next[variantId];
        else next[variantId] = val;
        return next;
      });
    },
    [],
  );

  const filledEntries = useMemo(
    () => Object.entries(quantities).filter(([, q]) => q > 0),
    [quantities],
  );
  const totalUnits = filledEntries.reduce((s, [, q]) => s + q, 0);

  const handleBulkAdd = () => {
    if (filledEntries.length === 0) return;
    const items = filledEntries.map(([vid, qty]) => {
      const row = rows.find((r) => r.variant.id === vid);
      if (!row) return null;
      return {
        id: row.variant.id,
        productId: row.product.id,
        productName: row.product.name,
        upc: row.variant.upc,
        variantAttributes: row.variant.attributes,
        quantity: qty,
        unitPrice: row.variant.price,
        imageUrl: row.product.imageUrl,
      };
    }).filter(Boolean) as Parameters<typeof addItems>[0];
    addItems(items);
    setQuantities({});
  };

  const SortIcon = ({ col }: { col: string }) => (
    <span className="inline-flex flex-col ml-1 leading-none">
      <CaretUpOutlined
        className="text-[8px]"
        style={{ color: sort.column === col && sort.dir === "asc" ? config.primaryColor : "#ccc" }}
      />
      <CaretDownOutlined
        className="text-[8px] -mt-0.5"
        style={{ color: sort.column === col && sort.dir === "desc" ? config.primaryColor : "#ccc" }}
      />
    </span>
  );

  return (
    <div>
      {/* Bulk action bar */}
      <div
        className="flex items-center justify-between px-4 py-2.5 rounded-t-xl"
        style={{
          backgroundColor: config.cardBg,
          border: `1px solid ${config.borderColor}`,
          borderBottom: "none",
        }}
      >
        <span className="text-xs" style={{ color: config.secondaryColor }}>
          {sortedRows.length} variants · {products.length} products
        </span>
        <div className="flex items-center gap-3">
          {filledEntries.length > 0 && (
            <span className="text-xs font-medium" style={{ color: config.primaryColor }}>
              {totalUnits} units selected
            </span>
          )}
          <button
            onClick={handleBulkAdd}
            disabled={filledEntries.length === 0}
            className="flex items-center gap-1.5 text-[11px] font-semibold px-4 py-1.5 rounded-lg cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: filledEntries.length === 0 ? config.secondaryColor : config.primaryColor,
              color: "#fff",
              border: "none",
            }}
          >
            <ShoppingCartOutlined />
            Add All Visible
          </button>
        </div>
      </div>

      {/* Table */}
      <div
        className="overflow-x-auto rounded-b-xl"
        style={{ border: `1px solid ${config.borderColor}` }}
      >
        <table className="w-full border-collapse text-xs">
          <thead>
            <tr style={{ backgroundColor: config.cardBg }}>
              <SortableHeader label="UPC" col="upc" sort={sort} onSort={toggleSort} icon={<SortIcon col="upc" />} />
              <SortableHeader label="Product" col="product" sort={sort} onSort={toggleSort} icon={<SortIcon col="product" />} />
              {attrColumns.map((col) => (
                <SortableHeader key={col} label={col} col={col} sort={sort} onSort={toggleSort} icon={<SortIcon col={col} />} />
              ))}
              <SortableHeader label="Stock" col="stock" sort={sort} onSort={toggleSort} icon={<SortIcon col="stock" />} />
              <SortableHeader label="Price" col="price" sort={sort} onSort={toggleSort} icon={<SortIcon col="price" />} />
              <th
                className="text-center px-3 py-2.5 font-semibold whitespace-nowrap sticky right-0 bg-inherit"
                style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}`, backgroundColor: config.cardBg }}
              >
                Qty
              </th>
            </tr>
          </thead>
          <tbody>
            {sortedRows.map((row) => {
              const disabled = row.variant.availabilityStatus === "out-of-stock";
              return (
                <tr
                  key={row.variant.id}
                  className="transition-colors"
                  style={{ opacity: disabled ? 0.5 : 1 }}
                  onMouseEnter={(e) => { if (!disabled) e.currentTarget.style.backgroundColor = config.cardBg; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "transparent"; }}
                >
                  <td
                    className="px-3 py-2 font-mono text-[11px] whitespace-nowrap"
                    style={{ color: config.secondaryColor, borderBottom: `1px solid ${config.borderColor}` }}
                  >
                    {row.variant.upc}
                  </td>
                  <td
                    className="px-3 py-2 font-medium max-w-[200px] truncate"
                    style={{ color: config.primaryColor, borderBottom: `1px solid ${config.borderColor}` }}
                  >
                    {row.product.name}
                  </td>
                  {attrColumns.map((col) => (
                    <td
                      key={col}
                      className="px-3 py-2 whitespace-nowrap"
                      style={{ color: config.primaryColor, borderBottom: `1px solid ${config.borderColor}` }}
                    >
                      {row.attrColumns[col] || "—"}
                    </td>
                  ))}
                  <td
                    className="px-3 py-2 text-center whitespace-nowrap"
                    style={{ borderBottom: `1px solid ${config.borderColor}` }}
                  >
                    <StockBadge status={row.variant.availabilityStatus} qty={row.variant.stockQty} />
                  </td>
                  <td
                    className="px-3 py-2 font-medium whitespace-nowrap"
                    style={{ color: config.primaryColor, borderBottom: `1px solid ${config.borderColor}` }}
                  >
                    ${row.variant.price.toFixed(2)}
                  </td>
                  <td
                    className="px-3 py-2 text-center sticky right-0"
                    style={{ borderBottom: `1px solid ${config.borderColor}`, backgroundColor: "inherit" }}
                  >
                    <InputNumber
                      size="small"
                      min={0}
                      value={quantities[row.variant.id] || undefined}
                      placeholder="0"
                      onChange={(v) => handleQtyChange(row.variant.id, v)}
                      disabled={disabled}
                      className="w-[64px]"
                      controls={false}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {total > pageSize && (
        <div className="flex justify-center mt-6">
          <Pagination
            current={page}
            total={total}
            pageSize={pageSize}
            onChange={onPageChange}
            showSizeChanger={false}
            size="small"
          />
        </div>
      )}
    </div>
  );
}

// ── Sub-components ──────────────────────────────────────────────────

function SortableHeader({
  label,
  col,
  sort,
  onSort,
  icon,
}: {
  label: string;
  col: string;
  sort: SortState;
  onSort: (col: string) => void;
  icon: React.ReactNode;
}) {
  const config = activeBrandConfig;
  return (
    <th
      className="text-left px-3 py-2.5 font-semibold whitespace-nowrap cursor-pointer select-none"
      style={{ color: config.primaryColor, borderBottom: `2px solid ${config.borderColor}` }}
      onClick={() => onSort(col)}
    >
      {label}
      {icon}
    </th>
  );
}

function StockBadge({ status, qty }: { status: string; qty: number }) {
  if (status === "out-of-stock") {
    return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}>OOS</span>;
  }
  if (status === "low-stock") {
    return <span className="text-[9px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: "#FFF7ED", color: "#9A3412" }}>{qty}</span>;
  }
  return <span className="text-[10px]" style={{ color: "#16A34A" }}>{qty}</span>;
}
