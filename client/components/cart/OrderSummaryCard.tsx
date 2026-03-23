import { Button } from "antd";
import { ArrowLeftOutlined, PercentageOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import { useAuth } from "../../context/AuthContext";
import { useCreditState } from "../../hooks/useCreditState";
import type { OrderLineItem } from "../../context/OrderContext";
import type { CartPromotion } from "../../data/catalogData";
import type { CartPromoBenefitLine } from "../../pages/CartPage";

interface OrderSummaryCardProps {
  items: OrderLineItem[];
  totalUnits: number;
  totalValue: number;
  appliedPromo: CartPromotion | null;
  cartPromoDiscount: number;
  cartPromoBenefitLines?: CartPromoBenefitLine[];
}

export default function OrderSummaryCard({
  items,
  totalUnits,
  totalValue,
  appliedPromo,
  cartPromoDiscount,
  cartPromoBenefitLines = [],
}: OrderSummaryCardProps) {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const { isAuthenticated, showSignInModal } = useAuth();
  const { isExceeded } = useCreditState();

  const fmt = (val: number) =>
    "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });

  // Product-level savings per item (for detail rows)
  const promoItems = items.filter((item) => {
    if (item.isFreeItem) return false;
    const listPrice = item.listPrice ?? item.unitPrice;
    return listPrice > item.unitPrice && item.promotionLabel;
  });

  // Free goods items for BXGY savings display
  const freeItems = items.filter((i) => i.isFreeItem);

  const productSavings = items.reduce((sum, item) => {
    if (item.isFreeItem) return false;
    const listPrice = item.listPrice ?? item.unitPrice;
    return (sum as number) + (listPrice - item.unitPrice) * item.quantity;
  }, 0) as number;

  // Estimate free goods value for BXGY items
  const freeGoodsSavings = freeItems.reduce((sum, item) => {
    // Use the parent item's unit price if available via listPrice, otherwise estimate
    const parentItem = items.find(
      (i) => !i.isFreeItem && i.productId === item.productId,
    );
    const unitVal = parentItem?.unitPrice ?? item.listPrice ?? 0;
    return sum + unitVal * item.quantity;
  }, 0);

  const totalProductSavings = productSavings + freeGoodsSavings;
  const totalSavings = totalProductSavings + cartPromoDiscount;
  const grandTotal = totalValue - cartPromoDiscount;

  const hasProductSavings = totalProductSavings > 0;
  const hasCartPromo = cartPromoDiscount > 0 && appliedPromo;

  // Count of line items with an auto-applied promotion (exclude free goods rows)
  const promoItemCount = promoItems.length;

  return (
    <div
      className="rounded-xl p-5"
      style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
    >
      <h3 className="text-sm font-semibold mb-4" style={{ color: config.primaryColor }}>
        Order Summary
      </h3>

      {/* Subtotal */}
      <div className="flex justify-between py-1.5 text-xs">
        <span style={{ color: config.secondaryColor }}>Subtotal ({totalUnits} units)</span>
        <span className="font-medium" style={{ color: config.primaryColor }}>{fmt(totalValue)}</span>
      </div>

      {/* Shipping */}
      <div className="flex justify-between py-1.5 text-xs">
        <span style={{ color: config.secondaryColor }}>Estimated Shipping</span>
        <span className="text-[11px] font-medium" style={{ color: "#16A34A" }}>Calculated at checkout</span>
      </div>

      {/* Product Promotions — single collapsed row */}
      {hasProductSavings && (
        <>
          <div className="my-2.5" style={{ borderTop: `1px solid ${config.borderColor}` }} />

          <div className="flex justify-between py-1.5 text-xs">
            <span className="font-medium" style={{ color: "#16A34A" }}>
              Product Promotions ({promoItemCount} {promoItemCount === 1 ? "product" : "products"})
            </span>
            <span className="font-semibold" style={{ color: "#16A34A" }}>
              −{fmt(totalProductSavings)}
            </span>
          </div>
        </>
      )}

      {/* Cart Promotion section */}
      {hasCartPromo && appliedPromo && (
        <>
          <div className="my-2.5" style={{ borderTop: `1px solid ${config.borderColor}` }} />

          {cartPromoBenefitLines.length > 0 ? (
            /* Multi-benefit: one line per monetary benefit */
            cartPromoBenefitLines.map((line, idx) => (
              <div key={idx} className="flex justify-between py-1.5 text-[13px]">
                <span className="font-medium" style={{ color: "#16A34A" }}>
                  {line.label}
                </span>
                <span className="font-semibold" style={{ color: "#16A34A" }}>
                  −{fmt(line.amount)}
                </span>
              </div>
            ))
          ) : (
            /* Legacy single-benefit cart promo */
            <>
              <div className="flex justify-between py-1.5 text-xs">
                <span className="font-medium" style={{ color: "#16A34A" }}>Cart Promotion</span>
                <span className="font-semibold" style={{ color: "#16A34A" }}>
                  −{fmt(cartPromoDiscount)}
                </span>
              </div>

              <div className="pl-3">
                <div className="flex justify-between text-[11px] py-0.5">
                  <span style={{ color: config.secondaryColor }}>
                    GET {appliedPromo.label} · order over ${appliedPromo.thresholdAmount.toLocaleString()}
                  </span>
                  <span style={{ color: config.secondaryColor }}>−{fmt(cartPromoDiscount)}</span>
                </div>
              </div>
            </>
          )}
        </>
      )}

      {/* Total Savings highlight */}
      {totalSavings > 0 && (
        <>
          <div className="my-3" style={{ borderTop: "1px solid #E5E5E0" }} />

          <div
            className="flex justify-between items-center px-3 py-2.5 rounded-lg"
            style={{ backgroundColor: "#ECFDF3" }}
          >
            <span className="text-xs font-semibold flex items-center gap-1.5" style={{ color: "#0D7A4A" }}>
              <PercentageOutlined style={{ fontSize: 14 }} />
              Total Savings
            </span>
            <span className="text-sm font-bold" style={{ color: "#0D7A4A" }}>
              −{fmt(totalSavings)}
            </span>
          </div>
        </>
      )}

      {/* Grand Total */}
      <div className="my-3" style={{ borderTop: `1px solid ${config.borderColor}` }} />

      <div className="flex justify-between py-1">
        <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>Grand Total</span>
        <span className="text-lg font-semibold" style={{ color: config.primaryColor }}>
          {fmt(grandTotal)}
        </span>
      </div>

      {/* Checkout button */}
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
  );
}
