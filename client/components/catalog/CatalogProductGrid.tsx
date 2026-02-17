import { useState } from "react";
import { Pagination } from "antd";
import { activeBrandConfig } from "../../config/brandConfig";
import { type CatalogProduct } from "../../data/catalogData";
import ProductCard from "./ProductCard";

interface CatalogProductGridProps {
  products: CatalogProduct[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export default function CatalogProductGrid({
  products,
  total,
  page,
  pageSize,
  onPageChange,
}: CatalogProductGridProps) {
  const config = activeBrandConfig;
  const variant = config.productCardVariant;
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);

  if (products.length === 0) {
    return (
      <div
        className="text-center py-16 text-sm"
        style={{ color: config.secondaryColor }}
      >
        No products match the current filters.
      </div>
    );
  }

  const gridCols =
    variant === "compact"
      ? "grid-cols-2 sm:grid-cols-3 lg:grid-cols-4"
      : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3";

  const gap = variant === "compact" ? "gap-3" : "gap-5";

  return (
    <div>
      <div className={`grid ${gridCols} ${gap}`}>
        {products.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            variant={variant}
            expandedCardId={expandedCardId}
            onToggleExpand={setExpandedCardId}
          />
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
