import { Link } from "react-router-dom";
import { EyeOutlined, ShoppingCartOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { CatalogProduct } from "../../data/catalogData";

interface FamilyRowExpansionProps {
  product: CatalogProduct;
  familyLink: string;
  onQuickAdd: () => void;
}

export default function FamilyRowExpansion({
  product,
  familyLink,
  onQuickAdd,
}: FamilyRowExpansionProps) {
  const config = activeBrandConfig;
  const variants = product.variants || [];

  const skuCount = variants.length;
  const inStock = variants.filter((v) => v.availabilityStatus === "in-stock").length;
  const lowStock = variants.filter((v) => v.availabilityStatus === "low-stock").length;
  const outOfStock = variants.filter((v) => v.availabilityStatus === "out-of-stock").length;

  return (
    <div
      className="px-6 py-4 flex items-start gap-6"
      style={{ backgroundColor: config.cardBg }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Thumbnail */}
      <img
        src={product.imageUrl}
        alt={product.name}
        loading="lazy"
        className="w-16 h-16 object-cover rounded-lg shrink-0"
      />

      {/* Details */}
      <div className="flex-1 min-w-0">
        {product.description && (
          <p
            className="text-[11px] leading-relaxed mb-2 line-clamp-2"
            style={{ color: config.secondaryColor }}
          >
            {product.description}
          </p>
        )}

        <div className="flex flex-wrap gap-x-6 gap-y-1 text-[11px] mb-3">
          <span style={{ color: config.secondaryColor }}>
            <span className="font-medium" style={{ color: config.primaryColor }}>{skuCount}</span> SKUs total
          </span>
          {inStock > 0 && (
            <span style={{ color: "#16A34A" }}>
              <span className="font-medium">{inStock}</span> In Stock
            </span>
          )}
          {lowStock > 0 && (
            <span style={{ color: "#D97706" }}>
              <span className="font-medium">{lowStock}</span> Low Stock
            </span>
          )}
          {outOfStock > 0 && (
            <span style={{ color: "#DC2626" }}>
              <span className="font-medium">{outOfStock}</span> Out of Stock
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0">
        <Link
          to={familyLink}
          className="flex items-center gap-1.5 text-[11px] font-medium px-3.5 py-1.5 rounded-lg no-underline transition-colors"
          style={{
            border: `1px solid ${config.borderColor}`,
            color: config.primaryColor,
            backgroundColor: "#fff",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = config.cardBg;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "#fff";
          }}
        >
          <EyeOutlined className="text-[10px]" />
          View All SKUs
        </Link>
        <button
          onClick={onQuickAdd}
          className="flex items-center gap-1.5 text-[11px] font-medium px-3.5 py-1.5 rounded-lg cursor-pointer transition-opacity"
          style={{
            backgroundColor: config.primaryColor,
            color: "#fff",
            border: "none",
          }}
        >
          <ShoppingCartOutlined className="text-[10px]" />
          Quick Add
        </button>
      </div>
    </div>
  );
}
