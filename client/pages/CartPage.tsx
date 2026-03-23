import { Button } from "antd";
import { ShoppingOutlined, PercentageOutlined, GiftOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";
import { activeBrandConfig } from "../config/brandConfig";
import { useOrder, type OrderLineItem } from "../context/OrderContext";
import { useAuth } from "../context/AuthContext";
import CreditSummaryBlock from "../components/cart/CreditSummaryBlock";
import CartPromotionsSection from "../components/cart/CartPromotionsSection";
import CartLineItem from "../components/cart/CartLineItem";
import OrderSummaryCard from "../components/cart/OrderSummaryCard";
import { cartPromotions, type CartPromotion, type PromotionBenefit } from "../data/catalogData";
import { useState, useMemo } from "react";

export interface CartPromoBenefitLine {
  label: string;
  amount: number;
}

export interface CartPromoFreeGood {
  promoName: string;
  freeQty: number;
  benefitLabel: string;
}

function computeCartPromoBenefits(
  promo: CartPromotion | null,
  cartTotal: number,
): { benefitLines: CartPromoBenefitLine[]; freeGoods: CartPromoFreeGood[]; totalDiscount: number } {
  if (!promo || cartTotal < promo.thresholdAmount) {
    return { benefitLines: [], freeGoods: [], totalDiscount: 0 };
  }

  const hasBenefits = promo.benefits && promo.benefits.length > 0;

  if (!hasBenefits) {
    // Legacy single-benefit promo
    const discount = promo.discountAmount ?? 0;
    return {
      benefitLines: [],
      freeGoods: [],
      totalDiscount: discount,
    };
  }

  const benefitLines: CartPromoBenefitLine[] = [];
  const freeGoods: CartPromoFreeGood[] = [];
  let totalDiscount = 0;

  for (const b of promo.benefits!) {
    if (b.type === "flat-discount" && b.discountPercent) {
      const amt = Math.round(cartTotal * (b.discountPercent / 100) * 100) / 100;
      benefitLines.push({ label: `${promo.label} \u00b7 ${b.discountPercent}% off`, amount: amt });
      totalDiscount += amt;
    } else if (b.type === "flat-amount" && b.discountAmount) {
      benefitLines.push({ label: `${promo.label} \u00b7 $${b.discountAmount} off`, amount: b.discountAmount });
      totalDiscount += b.discountAmount;
    } else if (b.type === "discount" && b.discountPercent) {
      const amt = Math.round(cartTotal * (b.discountPercent / 100) * 100) / 100;
      benefitLines.push({ label: `${promo.label} \u00b7 ${b.discountPercent}% off`, amount: amt });
      totalDiscount += amt;
    } else if (b.type === "free-goods") {
      freeGoods.push({
        promoName: promo.label,
        freeQty: b.freeQty ?? 1,
        benefitLabel: b.label,
      });
    }
  }

  return { benefitLines, freeGoods, totalDiscount };
}

export default function CartPage() {
  const config = activeBrandConfig;
  const { items, totalUnits, totalValue, updateQuantity, removeItem, clearOrder } = useOrder();
  const { isAuthenticated } = useAuth();
  const [appliedPromoId, setAppliedPromoId] = useState<string | null>(null);

  const appliedPromo = appliedPromoId
    ? cartPromotions.find((p) => p.id === appliedPromoId) ?? null
    : null;

  const { benefitLines, freeGoods, totalDiscount: cartPromoDiscount } = useMemo(
    () => computeCartPromoBenefits(appliedPromo, totalValue),
    [appliedPromo, totalValue],
  );

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
            cartPromoFreeGoods={freeGoods}
            appliedPromoName={appliedPromo?.label}
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
            cartPromoBenefitLines={benefitLines}
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
  cartPromoFreeGoods,
  appliedPromoName,
}: {
  items: OrderLineItem[];
  onUpdateQuantity: (id: string, qty: number) => void;
  onRemove: (id: string) => void;
  cartPromoFreeGoods: CartPromoFreeGood[];
  appliedPromoName?: string;
}) {
  const config = activeBrandConfig;
  const hasFreeGoods = cartPromoFreeGoods.length > 0;

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
          isLast={idx === items.length - 1 && !hasFreeGoods}
          onUpdateQuantity={onUpdateQuantity}
          onRemove={onRemove}
        />
      ))}

      {/* Cart promotion gift divider + free goods row(s) */}
      {hasFreeGoods && (
        <>
          <CartPromoGiftDivider promoName={cartPromoFreeGoods[0].promoName} />
          {cartPromoFreeGoods.map((fg, idx) => (
            <CartPromoFreeGoodRow
              key={`cart-free-${idx}`}
              freeGood={fg}
              isLast={idx === cartPromoFreeGoods.length - 1}
            />
          ))}
        </>
      )}
    </div>
  );
}

// ── Cart Promotion Gift Divider ─────────────────────────────────────

function CartPromoGiftDivider({ promoName }: { promoName: string }) {
  const config = activeBrandConfig;

  return (
    <div
      className="flex items-center gap-1.5"
      style={{
        backgroundColor: config.cardBg,
        borderTop: `1.5px dashed ${config.secondaryColor}40`,
        padding: "8px 14px",
      }}
    >
      <GiftOutlined style={{ fontSize: 16, color: config.secondaryColor }} />
      <span
        className="uppercase"
        style={{
          fontSize: 11,
          fontWeight: 500,
          letterSpacing: "0.06em",
          color: config.secondaryColor,
        }}
      >
        Cart Promotion Gift · {promoName}
      </span>
    </div>
  );
}

// ── Cart Promotion Free Good Row ────────────────────────────────────

function CartPromoFreeGoodRow({
  freeGood,
  isLast,
}: {
  freeGood: CartPromoFreeGood;
  isLast: boolean;
}) {
  const config = activeBrandConfig;

  return (
    <div
      className="grid grid-cols-[1fr_120px_100px_40px] gap-4 px-5 py-4 items-center"
      style={{
        borderBottom: !isLast ? `1px solid ${config.borderColor}` : "none",
        backgroundColor: "#f6fdf9",
        borderLeft: "3px solid #1a7a4a",
      }}
    >
      {/* Product Info */}
      <div className="flex items-center gap-3 min-w-0">
        {/* GIFT thumbnail */}
        <div
          className="flex items-center justify-center shrink-0 rounded-lg"
          style={{
            width: 44,
            height: 44,
            backgroundColor: "#e0f5ea",
            border: "1px solid #63c99a",
          }}
        >
          <span style={{ fontSize: 11, fontWeight: 700, color: "#1a7a4a" }}>GIFT</span>
        </div>

        <div className="min-w-0">
          <span
            className="text-[13px] font-semibold block"
            style={{ color: "#1a7a4a" }}
          >
            Complimentary Product
          </span>
          <p className="text-xs mt-0.5" style={{ color: "#3B8B5A" }}>
            Free product \u00b7 {freeGood.promoName}
          </p>

          {/* Benefit chip */}
          <div className="mt-1.5">
            <span
              className="inline-flex items-center gap-1 text-[11px] font-semibold rounded-full"
              style={{
                backgroundColor: "#e0f5ea",
                border: "1px solid #63c99a",
                color: "#1a7a4a",
                padding: "2px 10px",
              }}
            >
              <PercentageOutlined style={{ fontSize: 11 }} />
              FREE GOODS \u00b7 Cart Promotion \u00b7 {freeGood.promoName}
            </span>
          </div>
        </div>
      </div>

      {/* Quantity — static */}
      <div className="flex justify-center">
        <span className="text-xs font-medium" style={{ color: "#1a7a4a" }}>
          {freeGood.freeQty}
        </span>
      </div>

      {/* Total */}
      <div className="text-right">
        <span className="text-[13px] font-semibold" style={{ color: "#1a7a4a" }}>$0.00</span>
      </div>

      {/* Delete — empty */}
      <div />
    </div>
  );
}
