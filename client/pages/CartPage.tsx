import { Button } from "antd";
import { ShoppingOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { activeBrandConfig } from "../config/brandConfig";
import { useOrder, type OrderLineItem } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import CreditSummaryBlock from "../components/cart/CreditSummaryBlock";
import CartPromotionsSection from "../components/cart/CartPromotionsSection";
import CartLineItem from "../components/cart/CartLineItem";
import OrderSummaryCard from "../components/cart/OrderSummaryCard";
import { cartPromotions } from "../data/catalogData";
import { useState } from "react";

export default function CartPage() {
  const config = activeBrandConfig;
  const { items, totalUnits, totalValue, updateQuantity, removeItem, clearOrder } = useOrder();
  const { isAuthenticated } = useAuth();
  const [appliedPromoId, setAppliedPromoId] = useState<string | null>(null);

  const appliedPromo = appliedPromoId
    ? cartPromotions.find((p) => p.id === appliedPromoId) ?? null
    : null;
  const cartPromoDiscount =
    appliedPromo && totalValue >= appliedPromo.thresholdAmount
      ? (appliedPromo.discountAmount ?? 0)
      : 0;

  if (items.length === 0) {
    return (
      <div className="max-w-content mx-auto px-6 py-8 text-center">
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
        <Button size="small" danger onClick={clearOrder} className="text-xs">
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

        {/* Right: Sidebar */}
        <div className="space-y-5" style={{ position: "sticky", top: 124, alignSelf: "start" }}>
          <CartPromotionsSection
            appliedPromoId={appliedPromoId}
            onApply={(id) => setAppliedPromoId(id)}
            onRemove={() => setAppliedPromoId(null)}
          />

          <OrderSummaryCard
            items={items}
            totalUnits={totalUnits}
            totalValue={totalValue}
            appliedPromo={appliedPromo}
            cartPromoDiscount={cartPromoDiscount}
          />

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
  items: OrderLineItem[];
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
        style={{
          backgroundColor: config.cardBg,
          color: config.secondaryColor,
          borderBottom: `1px solid ${config.borderColor}`,
        }}
      >
        <span>Product</span>
        <span className="text-center">Quantity</span>
        <span className="text-right">Total</span>
        <span />
      </div>

      {/* Items */}
      {items.map((item, idx) => (
        <CartLineItem
          key={item.id}
          item={item}
          isLast={idx === items.length - 1}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
        />
      ))}
    </div>
  );
}
