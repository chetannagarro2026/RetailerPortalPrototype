import { useState, useCallback } from "react";
import { Link } from "react-router-dom";
import { InputNumber } from "antd";
import { CloseOutlined, WarningOutlined, ShoppingCartOutlined, PlusOutlined, MinusOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { useOrder } from "../../context/OrderContext";
import { useCreditState } from "../../hooks/useCreditState";
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
      imageUrl: product.imageUrl,
    }]);

    // Reset quantity and close panel
    setQuantity(1);
  }, [product, quantity, addItems, isOutOfStock, wouldExceedCredit]);

  return (
    <div
      className="flex flex-col h-full"
      style={{ backgroundColor: "#fff" }}
    >
      {/* Header */}
      <div
        className="flex items-start justify-between px-5 py-4 shrink-0"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        <div className="min-w-0 flex-1">
          <h3
            className="text-base font-semibold mb-1 leading-tight"
            style={{ color: config.primaryColor }}
          >
            Quick Add
          </h3>
          <p className="text-[11px]" style={{ color: config.secondaryColor }}>
            Add this product to your cart
          </p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-md cursor-pointer transition-colors hover:bg-gray-100"
          style={{ border: "none", background: "transparent", color: config.secondaryColor }}
          aria-label="Close panel"
        >
          <CloseOutlined className="text-sm" />
        </button>
      </div>

      {/* Product Info */}
      <div className="flex-1 overflow-auto px-5 py-4">
        <div className="flex gap-4 mb-6">
          <img
            src={product.imageUrl}
            alt={product.name}
            className="w-24 h-24 object-cover rounded-xl flex-shrink-0"
            onError={(e) => {
              e.currentTarget.src = "https://via.placeholder.com/96x96?text=No+Img";
            }}
          />
          <div className="min-w-0 flex-1">
            <h4
              className="text-sm font-semibold mb-1 leading-snug"
              style={{ color: config.primaryColor }}
            >
              {product.name}
            </h4>
            {product.brand && (
              <p className="text-[10px] mb-2" style={{ color: config.secondaryColor }}>
                {product.brand}
              </p>
            )}
            <p className="text-[10px] font-mono mb-2" style={{ color: config.secondaryColor }}>
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
          className="rounded-xl p-4 mb-4"
          style={{ backgroundColor: config.cardBg }}
        >
          <div className="flex items-baseline justify-between mb-1">
            <span className="text-[11px] font-medium" style={{ color: config.secondaryColor }}>
              Unit Price
            </span>
            <span className="text-lg font-bold" style={{ color: config.primaryColor }}>
              ${product.price.toFixed(2)}
            </span>
          </div>
          {product.originalPrice && product.originalPrice > product.price && (
            <div className="flex items-baseline justify-between">
              <span className="text-[10px]" style={{ color: config.secondaryColor }}>
                Original
              </span>
              <span className="text-sm line-through" style={{ color: config.secondaryColor }}>
                ${product.originalPrice.toFixed(2)}
              </span>
            </div>
          )}
          {product.unitMeasure && (
            <p className="text-[10px] mt-2" style={{ color: config.secondaryColor }}>
              {product.unitMeasure}
            </p>
          )}
        </div>

        {/* Quantity Selector */}
        <div className="mb-4">
          <label
            className="block text-[11px] font-semibold mb-2"
            style={{ color: config.primaryColor }}
          >
            Quantity
          </label>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDecrement}
              disabled={quantity <= minQty || isOutOfStock}
              className="w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: config.cardBg,
                border: `1px solid ${config.borderColor}`,
                color: config.primaryColor,
              }}
            >
              <MinusOutlined className="text-sm" />
            </button>
            <InputNumber
              size="large"
              min={minQty}
              step={step}
              value={quantity}
              onChange={handleQtyChange}
              disabled={isOutOfStock}
              className="flex-1 text-center"
              controls={false}
              style={{ textAlign: 'center' }}
            />
            <button
              onClick={handleIncrement}
              disabled={isOutOfStock}
              className="w-10 h-10 flex items-center justify-center rounded-lg cursor-pointer transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              style={{
                backgroundColor: config.cardBg,
                border: `1px solid ${config.borderColor}`,
                color: config.primaryColor,
              }}
            >
              <PlusOutlined className="text-sm" />
            </button>
          </div>
          {step > 1 && (
            <p className="text-[10px] mt-2" style={{ color: config.secondaryColor }}>
              Sold in packs of {step}
            </p>
          )}
          {minQty > 1 && (
            <p className="text-[10px] mt-1" style={{ color: config.secondaryColor }}>
              Minimum order: {minQty} units
            </p>
          )}
        </div>

        {/* Subtotal */}
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: config.primaryColor + "08" }}
        >
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium" style={{ color: config.primaryColor }}>
              Subtotal
            </span>
            <span className="text-xl font-bold" style={{ color: config.primaryColor }}>
              ${subtotal.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {/* Credit warning */}
      {wouldExceedCredit && (
        <div
          className="flex items-center gap-2 px-5 py-3 text-[11px] font-medium shrink-0"
          style={{ backgroundColor: "#FEF2F2", color: "#DC2626" }}
        >
          <WarningOutlined />
          Adding this item would exceed your available credit.
        </div>
      )}

      {/* Footer */}
      <div
        className="px-5 py-4 shrink-0"
        style={{ borderTop: `1px solid ${config.borderColor}`, backgroundColor: config.cardBg }}
      >
        <div className="flex items-center gap-3">
          <button
            onClick={handleAddToCart}
            disabled={isOutOfStock || wouldExceedCredit}
            className="flex-1 inline-flex items-center justify-center gap-2 text-sm font-semibold py-3 rounded-xl cursor-pointer transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{
              backgroundColor: config.primaryColor,
              color: "#fff",
              border: "none",
            }}
          >
            <ShoppingCartOutlined className="text-base" />
            Add to Cart
          </button>
        </div>
        <Link
          to={familyLink}
          className="block text-center text-[11px] font-medium mt-3 py-2 no-underline transition-colors hover:underline"
          style={{
            color: config.secondaryColor,
          }}
        >
          View Full Product Details →
        </Link>
      </div>
    </div>
  );
}
