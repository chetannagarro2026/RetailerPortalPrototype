import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { InputNumber, Tooltip } from "antd";
import { CloseOutlined, WarningOutlined, ShoppingCartOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { activeBrandConfig, formatPrice } from "../../config/brandConfig";
import { useOrder } from "../../context/OrderContext";
import { useAuth } from "../../context/AuthContext";
import { useCreditState } from "../../hooks/useCreditState";
import { numberToWords } from "../../lib/utils";
import type { CatalogProduct } from "../../data/catalogData";

interface QuickAddPanelProps {
  product: CatalogProduct;
  familyLink: string;
  onClose: () => void;
  isLoading?: boolean;
}

export default function QuickAddPanel({
  product,
  familyLink,
  onClose,
}: QuickAddPanelProps) {
  const config = activeBrandConfig;
  const { addItems } = useOrder();
  const { isAuthenticated } = useAuth();
  const credit = useCreditState();
  const [quantity, setQuantity] = useState(1);

  const minQty = product.minOrderQty || 1;
  const step = product.casePackQty || 1;
  const subtotal = quantity * product.price;
  const wouldExceedCredit = credit.remainingAfterOrder - subtotal < 0 && subtotal > 0;

  const stockStatus = product.availabilityStatus || "in-stock";
  const isOutOfStock = stockStatus === "out-of-stock";
  const stockLabel = stockStatus === "in-stock" ? "In Stock" : 
                     stockStatus === "low-stock" ? "Low Stock" : 
                     stockStatus === "out-of-stock" ? "Out of Stock" : "Pre-Order";
  const stockColor = stockStatus === "in-stock" ? "#16A34A" : 
                     stockStatus === "low-stock" ? "#D97706" : 
                     stockStatus === "out-of-stock" ? "#DC2626" : "#7C3AED";

  const handleQtyChange = useCallback((val: number | null) => {
    if (!val || val <= 0) {
      setQuantity(minQty);
    } else {
      const snapped = Math.max(minQty, Math.round(val / step) * step || step);
      setQuantity(snapped);
    }
  }, [minQty, step]);

  const handleIncrement = useCallback(() => {
    setQuantity(prev => prev + step);
  }, [step]);

  const handleDecrement = useCallback(() => {
    setQuantity(prev => Math.max(minQty, prev - step));
  }, [minQty, step]);

  const handleAddToCart = useCallback(() => {
    if (isOutOfStock || wouldExceedCredit) return;

    addItems([{
      id: product.id,
      productId: product.id,
      productName: product.name,
      upc: product.upc,
      variantAttributes: {},
      quantity: quantity,
      unitPrice: product.price,
      originalPrice: product.originalPrice,
      imageUrl: product.imageUrl,
    }]);

    // Reset quantity and close panel
    setQuantity(1);
  }, [product, quantity, addItems, isOutOfStock, wouldExceedCredit]);

  return (
    <div
      className="flex flex-col h-full mb-2"
      style={{ backgroundColor: "#fff" }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between px-4 py-2.5 shrink-0"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        <div className="min-w-0 flex-1">
          <h3
            className="text-sm font-semibold mb-0.5 leading-tight"
            style={{ color: config.primaryColor }}
          >
            Quick Add
          </h3>
          <p className="text-[11px]" style={{ color: config.secondaryColor }}>
            Add to cart
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1 rounded-md cursor-pointer transition-colors hover:bg-gray-100"
          style={{ border: "none", background: "transparent", color: config.secondaryColor }}
          aria-label="Close panel"
        >
          <CloseOutlined className="text-sm" />
        </button>
      </div>

      {/* Product Info */}
      <div className="flex-1 overflow-auto px-4 py-3">
        <div className="flex gap-3 mb-3">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-20 h-20 object-contain rounded-lg flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/96x96?text=No+Img";
            }}
          />
          <div className="min-w-0 flex-1">
            <Tooltip title={product.name} placement="topLeft">
              <h4
                className="text-sm font-semibold mb-0.5 leading-snug line-clamp-2"
                style={{ color: config.primaryColor }}
              >
                {product.name}
              </h4>
            </Tooltip>
            {product.brand && (
              <p className="text-[10px] mb-1" style={{ color: config.secondaryColor }}>
                {product.brand}
              </p>
            )}
            <p className="text-[10px] font-mono mb-1" style={{ color: config.secondaryColor }}>
              UPC: {product.upc}
            </p>
            <div className="flex items-center gap-2">
              <span
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full"
                style={{
                  backgroundColor: `${stockColor}15`,
                  color: stockColor,
                }}
              >
                {stockLabel}
              </span>
            </div>
          </div>
        </div>

        {/* Price Section */}
        <div
          className="rounded-lg p-3 mb-3"
          style={{ backgroundColor: config.cardBg }}
        >
          <div className="flex items-baseline justify-between mb-0.5">
            <span className="text-[11px] font-medium" style={{ color: config.secondaryColor }}>
              Unit Price
            </span>
            <span className="text-base font-bold" style={{ color: config.primaryColor }}>
              {formatPrice(product.price)}
            </span>
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <>
              <div className="flex items-baseline justify-between mb-0.5">
                <span className="text-[10px]" style={{ color: config.secondaryColor }}>
                  Original
                </span>
                <span className="text-sm line-through" style={{ color: config.secondaryColor }}>
                  {formatPrice(product.originalPrice)}
                </span>
              </div>
              {isAuthenticated && (
                <div className="flex items-baseline justify-between gap-1">
                  <span className="text-[10px]" style={{ color: config.secondaryColor }}>
                    You Save
                  </span>
                  <div className="text-right flex items-baseline gap-0.5">
                    <span className="text-xs font-semibold" style={{ color: "#16A34A" }}>
                      {formatPrice(product.originalPrice - product.price)}
                    </span>
                    <span className="text-xs font-semibold" style={{ color: "#16A34A" }}>
                      ({Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)}%)
                    </span>
                  </div>
                </div>
              )}
            </>
          )}
          {product.unitMeasure && (
            <p className="text-[9px] mt-1" style={{ color: config.secondaryColor }}>
              {product.unitMeasure}
            </p>
          )}
        </div>

        {/* Quantity & Subtotal Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Quantity Selector */}
          <div>
            <label
              className="block text-[10px] font-semibold mb-1.5"
              style={{ color: config.primaryColor }}
            >
              Quantity
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={handleDecrement}
                disabled={quantity <= minQty || isOutOfStock}
                className="w-8 h-8 flex items-center justify-center rounded-md cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: config.cardBg,
                  border: `1px solid ${config.borderColor}`,
                  color: config.primaryColor,
                }}
              >
                <MinusOutlined className="text-xs" />
              </button>
              <InputNumber
                size="small"
                min={minQty}
                step={step}
                value={quantity}
                onChange={handleQtyChange}
                disabled={isOutOfStock}
                className="flex-1 text-center text-xs"
                controls={false}
                style={{ textAlign: 'center' }}
              />
              <button
                onClick={handleIncrement}
                disabled={isOutOfStock}
                className="w-8 h-8 flex items-center justify-center rounded-md cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                style={{
                  backgroundColor: config.cardBg,
                  border: `1px solid ${config.borderColor}`,
                  color: config.primaryColor,
                }}
              >
                <PlusOutlined className="text-xs" />
              </button>
            </div>
            <p className="text-[9px] mt-1 italic" style={{ color: config.secondaryColor }}>
              ({numberToWords(quantity)} {quantity === 1 ? 'Unit' : 'Units'})
            </p>
            {step > 1 && (
              <p className="text-[9px] mt-0.5" style={{ color: config.secondaryColor }}>
                Packs of {step}
              </p>
            )}
            {minQty > 1 && (
              <p className="text-[9px] mt-0.5" style={{ color: config.secondaryColor }}>
                Min: {minQty}
              </p>
            )}
          </div>

          {/* Subtotal */}
          <div
            className="rounded-lg p-3 flex flex-col justify-between"
            style={{ backgroundColor: config.primaryColor + "08" }}
          >
            <span className="text-xs font-medium" style={{ color: config.primaryColor }}>
              Subtotal
            </span>
            <span className="text-lg font-bold" style={{ color: config.primaryColor }}>
              {formatPrice(subtotal)}
            </span>
          </div>
        </div>
      </div>

      {/* Credit warning */}
      {wouldExceedCredit && (
        <div
          className="flex items-center gap-2 px-4 py-2 text-[9px] font-medium shrink-0"
          style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
        >
          <WarningOutlined className="text-xs flex-shrink-0" />
          <span>Exceeds available credit</span>
        </div>
      )}

      {/* Footer */}
      <div
        className="px-4 py-3 shrink-0"
        style={{ borderTop: `1px solid ${config.borderColor}`, backgroundColor: config.cardBg }}
      >
        <button
          onClick={handleAddToCart}
          disabled={isOutOfStock || wouldExceedCredit}
          className="w-full inline-flex items-center justify-center gap-2 text-xs font-semibold py-2.5 rounded-lg cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          style={{
            backgroundColor: config.primaryColor,
            color: "#fff",
            border: "none",
          }}
        >
          <ShoppingCartOutlined className="text-sm" />
          Add to Cart
        </button>
        <Link
          to={familyLink}
          className="block text-center text-[11px] font-medium mt-2 py-1.5 no-underline transition-colors hover:underline"
          style={{
            color: config.secondaryColor,
          }}
        >
          View Product Details →
        </Link>
      </div>
    </div>
  );
}
