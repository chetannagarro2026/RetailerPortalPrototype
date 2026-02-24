import { useState, useCallback } from "react";
import { InputNumber, Button } from "antd";
import { ShoppingCartOutlined, RightOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import { useOrder } from "../../context/OrderContext";
import type { CatalogProduct, ProductVariant } from "../../data/catalogData";
import FulfillmentPanel from "./FulfillmentPanel";

interface SkuAccordionContentProps {
  product: CatalogProduct;
  variant: ProductVariant;
}

export default function SkuAccordionContent({ product, variant }: SkuAccordionContentProps) {
  const config = activeBrandConfig;
  const { addItem } = useOrder();
  const minQty = product.minOrderQty || 1;
  const step = product.casePackQty || 1;
  const [qty, setQty] = useState(minQty);

  const handleQtyChange = useCallback(
    (val: number | null) => {
      if (val === null) return;
      setQty(Math.max(minQty, Math.round(val / step) * step || step));
    },
    [minQty, step],
  );

  const handleAdd = useCallback(() => {
    addItem({
      id: variant.id,
      productId: product.id,
      productName: product.name,
      upc: variant.upc,
      variantAttributes: variant.attributes,
      quantity: qty,
      unitPrice: variant.price,
      imageUrl: product.imageUrl,
    });
  }, [variant, product, qty, addItem]);

  const disabled = variant.availabilityStatus === "out-of-stock";
  const variantDesc = Object.entries(variant.attributes)
    .map(([k, v]) => `${k}: ${v}`)
    .join(" · ");
  const skuPdpUrl = `/product/${product.id}/sku/${variant.id}`;

  return (
    <div
      className="px-5 py-4"
      style={{ backgroundColor: config.cardBg, borderTop: `1px solid ${config.borderColor}` }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="flex gap-5">
        {/* Left: Image */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-24 h-24 rounded-lg object-cover shrink-0"
        />

        {/* Right: Details + Actions */}
        <div className="flex-1 min-w-0 grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Details Column */}
          <div>
            <Link
              to={skuPdpUrl}
              className="text-sm font-semibold no-underline hover:underline block mb-1"
              style={{ color: config.primaryColor }}
            >
              {product.name}
            </Link>
            <p className="text-[11px] font-mono mb-1" style={{ color: config.secondaryColor }}>
              {variant.upc}
            </p>
            <p className="text-xs mb-2" style={{ color: config.secondaryColor }}>
              {variantDesc}
            </p>
            {product.description && (
              <p className="text-[11px] line-clamp-2 mb-2" style={{ color: config.secondaryColor }}>
                {product.description}
              </p>
            )}
            <div className="flex gap-4 text-[10px]" style={{ color: config.secondaryColor }}>
              {minQty > 1 && <span>Min Order: {minQty}</span>}
              {step > 1 && <span>Case Pack: {step}</span>}
            </div>
          </div>

          {/* Fulfillment + Order Column */}
          <div className="space-y-3">
            <FulfillmentPanel variant={variant} />

            <div className="flex items-center gap-3">
              <InputNumber
                size="small"
                min={minQty}
                step={step}
                value={qty}
                onChange={handleQtyChange}
                disabled={disabled}
                className="w-20"
              />
              <Button
                type="primary"
                size="small"
                icon={<ShoppingCartOutlined />}
                onClick={handleAdd}
                disabled={disabled}
                style={{
                  backgroundColor: disabled ? undefined : config.primaryColor,
                  borderRadius: 6,
                  fontWeight: 600,
                }}
              >
                Add to Cart
              </Button>
            </div>

            <Link
              to={skuPdpUrl}
              className="text-xs font-medium no-underline flex items-center gap-1"
              style={{ color: config.primaryColor }}
            >
              View Details <RightOutlined className="text-[9px]" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
