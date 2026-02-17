import { useState } from "react";
import { Pagination, InputNumber } from "antd";
import { ShoppingCartOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { type CatalogProduct } from "../../data/catalogData";

interface CatalogProductGridProps {
  products: CatalogProduct[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function CatalogProductGrid({ products, total, page, pageSize, onPageChange }: CatalogProductGridProps) {
  if (products.length === 0) {
    return (
      <div
        className="text-center py-16 text-sm"
        style={{ color: activeBrandConfig.secondaryColor }}
      >
        No products found in this category.
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>

      {total > pageSize && (
        <div className="flex justify-center mt-8">
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

const badgeColors: Record<string, { bg: string; text: string }> = {
  New: { bg: "#EEF2FF", text: "#4338CA" },
  Bestseller: { bg: "#F0FDF4", text: "#166534" },
  Limited: { bg: "#FFF7ED", text: "#9A3412" },
};

function ProductCard({ product }: { product: CatalogProduct }) {
  const config = activeBrandConfig;
  const [qty, setQty] = useState<number>(1);
  const badge = product.badge ? badgeColors[product.badge] : null;

  return (
    <div
      className="group rounded-xl overflow-hidden transition-shadow duration-200 hover:shadow-md"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      {/* Image */}
      <div className="relative w-full overflow-hidden" style={{ aspectRatio: "4 / 5" }}>
        <img
          src={product.imageUrl}
          alt={product.name}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {product.badge && badge && (
          <span
            className="absolute top-2.5 left-2.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
            style={{ backgroundColor: badge.bg, color: badge.text }}
          >
            {product.badge}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="p-3.5">
        <p
          className="text-[10px] font-semibold uppercase tracking-widest mb-0.5"
          style={{ color: config.secondaryColor }}
        >
          {product.brandName}
        </p>
        <p
          className="text-xs font-medium leading-snug mb-1 line-clamp-2"
          style={{ color: config.primaryColor }}
        >
          {product.name}
        </p>
        <p className="text-[11px] mb-2" style={{ color: config.secondaryColor }}>
          {product.itemCode}
        </p>
        <p className="text-sm font-semibold mb-3" style={{ color: config.primaryColor }}>
          ${product.wholesalePrice.toFixed(2)}
        </p>

        {/* Qty + Add to Order */}
        <div className="flex items-center gap-2">
          <InputNumber
            min={1}
            max={9999}
            value={qty}
            onChange={(v) => setQty(v || 1)}
            size="small"
            className="w-16"
          />
          <button
            className="flex-1 flex items-center justify-center gap-1.5 text-[11px] font-medium py-1.5 rounded-lg cursor-pointer transition-colors"
            style={{
              backgroundColor: config.primaryColor,
              color: "#fff",
              border: "none",
            }}
          >
            <ShoppingCartOutlined className="text-xs" />
            Add to Order
          </button>
        </div>
      </div>
    </div>
  );
}
