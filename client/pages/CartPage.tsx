import { Button, InputNumber } from "antd";
import { DeleteOutlined, ShoppingOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { activeBrandConfig } from "../config/brandConfig";
import { useOrder } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import { useCreditState } from "../hooks/useCreditState";
import CreditSummaryBlock from "../components/cart/CreditSummaryBlock";

export default function CartPage() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const { items, totalUnits, totalValue, updateQuantity, removeItem, clearOrder } = useOrder();
  const { isAuthenticated, showSignInModal } = useAuth();
  const { isExceeded } = useCreditState();

  const formatCurrency = (val: number) =>
    "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });

  if (items.length === 0) {
    return (
      <div className="max-w-content mx-auto px-6 py-16 text-center">
        <ShoppingOutlined className="text-5xl mb-4" style={{ color: config.secondaryColor }} />
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          Your cart is empty
        </h1>
        <p className="text-sm mb-6" style={{ color: config.secondaryColor }}>
          Browse the catalog and add items to get started.
        </p>
        <Link
          to="/catalog"
          className="text-sm font-medium no-underline px-6 py-2.5 rounded-lg text-white inline-block"
          style={{ backgroundColor: config.primaryColor }}
        >
          Browse Catalog
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-content mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold mb-1" style={{ color: config.primaryColor }}>
            Order Cart
          </h1>
          <p className="text-sm" style={{ color: config.secondaryColor }}>
            {items.length} item{items.length !== 1 ? "s" : ""} · {totalUnits} total units
          </p>
        </div>
        <Button
          size="small"
          danger
          onClick={clearOrder}
          className="text-xs"
        >
          Clear Cart
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Line Items */}
        <div className="lg:col-span-2">
          <CartItemList
            items={items}
            onUpdateQuantity={updateQuantity}
            onRemove={removeItem}
          />
        </div>

        {/* Right: Order + Credit Summary */}
        <div className="space-y-5">
          {/* Order Summary */}
          <div
            className="rounded-xl p-5"
            style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
          >
            <h3 className="text-sm font-semibold mb-4" style={{ color: config.primaryColor }}>
              Order Summary
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span style={{ color: config.secondaryColor }}>Subtotal ({totalUnits} units)</span>
                <span className="font-medium" style={{ color: config.primaryColor }}>{formatCurrency(totalValue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: config.secondaryColor }}>Estimated Shipping</span>
                <span className="text-xs font-medium" style={{ color: "#16A34A" }}>Calculated at checkout</span>
              </div>
              <div className="border-t pt-3" style={{ borderColor: config.borderColor }}>
                <div className="flex justify-between">
                  <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>Estimated Total</span>
                  <span className="text-lg font-semibold" style={{ color: config.primaryColor }}>
                    {formatCurrency(totalValue)}
                  </span>
                </div>
              </div>
            </div>

            <Button
              type="primary"
              block
              size="large"
              disabled={isAuthenticated && isExceeded}
              onClick={() => {
                if (!isAuthenticated) {
                  showSignInModal("To complete your purchase and use your credit account, please sign in.");
                  return;
                }
                navigate("/checkout");
              }}
              className="mt-5"
              style={{
                height: 44,
                fontWeight: 600,
                borderRadius: 8,
                backgroundColor: (isAuthenticated && isExceeded) ? undefined : config.primaryColor,
              }}
            >
              {isAuthenticated && isExceeded ? "Credit Limit Exceeded" : "Proceed to Checkout"}
            </Button>

            <Link
              to="/catalog"
              className="flex items-center justify-center gap-1.5 text-xs font-medium mt-3 no-underline"
              style={{ color: config.secondaryColor }}
            >
              <ArrowLeftOutlined className="text-[10px]" />
              Continue Shopping
            </Link>
          </div>

          {/* Credit Summary — authenticated only */}
          {isAuthenticated && <CreditSummaryBlock />}
        </div>
      </div>
    </div>
  );
}

// ── Cart Item List ──────────────────────────────────────────────────

function CartItemList({
  items,
  onUpdateQuantity,
  onRemove,
}: {
  items: ReturnType<typeof useOrder>["items"];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
}) {
  const config = activeBrandConfig;

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      {/* Table Header */}
      <div
        className="grid grid-cols-[1fr_120px_100px_40px] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wider"
        style={{ backgroundColor: config.cardBg, color: config.secondaryColor, borderBottom: `1px solid ${config.borderColor}` }}
      >
        <span>Product</span>
        <span className="text-center">Quantity</span>
        <span className="text-right">Total</span>
        <span />
      </div>

      {/* Items */}
      {items.map((item, idx) => {
        const variantDesc = Object.values(item.variantAttributes || {}).join(" · ");
        const lineTotal = item.quantity * item.unitPrice;

        return (
          <div
            key={item.id}
            className="grid grid-cols-[1fr_120px_100px_40px] gap-4 px-5 py-4 items-center"
            style={{
              borderBottom: idx < items.length - 1 ? `1px solid ${config.borderColor}` : "none",
            }}
          >
            {/* Product Info */}
            <div className="flex items-center gap-3 min-w-0">
              {item.imageUrl && (
                <img
                  src={item.imageUrl}
                  alt={item.productName}
                  className="w-12 h-12 rounded-lg object-cover shrink-0"
                />
              )}
              <div className="min-w-0">
                <Link
                  to={`/product/${encodeURIComponent(item.productId)}/sku/${encodeURIComponent(item.id)}`}
                  className="text-sm font-medium truncate block no-underline hover:underline"
                  style={{ color: config.primaryColor }}
                >
                  {item.productName}
                </Link>
                <p className="text-xs mt-0.5" style={{ color: config.secondaryColor }}>
                  {item.sku}{variantDesc ? ` · ${variantDesc}` : ""}
                </p>
                <p className="text-xs mt-0.5" style={{ color: config.secondaryColor }}>
                  ${item.unitPrice.toFixed(2)} / unit
                </p>
              </div>
            </div>

            {/* Quantity */}
            <div className="flex justify-center">
              <InputNumber
                size="small"
                min={1}
                value={item.quantity}
                onChange={(val) => val && onUpdateQuantity(item.id, val)}
                style={{ width: 80 }}
              />
            </div>

            {/* Line Total */}
            <div className="text-right">
              <span className="text-sm font-medium" style={{ color: config.primaryColor }}>
                ${lineTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>

            {/* Remove */}
            <div className="flex justify-center">
              <button
                onClick={() => onRemove(item.id)}
                className="p-1.5 rounded-md transition-colors cursor-pointer"
                style={{ color: config.secondaryColor, border: "none", background: "none" }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#DC2626";
                  e.currentTarget.style.backgroundColor = "#FEF2F2";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = config.secondaryColor;
                  e.currentTarget.style.backgroundColor = "transparent";
                }}
              >
                <DeleteOutlined className="text-sm" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
