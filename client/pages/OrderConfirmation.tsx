import { Link, useLocation, Navigate } from "react-router-dom";
import { CheckCircleFilled } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";

interface OrderSummaryState {
  orderNumber: string;
  totalUnits: number;
  totalValue: number;
  items: Array<{
    productName: string;
    sku: string;
    quantity: number;
    unitPrice: number;
  }>;
  shipping: {
    contactName: string;
    companyName: string;
    address: string;
    city: string;
    state: string;
    zip: string;
  };
  submittedAt: string;
}

export default function OrderConfirmation() {
  const config = activeBrandConfig;
  const location = useLocation();
  const order = location.state as OrderSummaryState | undefined;

  if (!order) {
    return <Navigate to="/catalog" replace />;
  }

  const fmt = (val: number) =>
    "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <div className="max-w-2xl mx-auto px-6 py-12">
      {/* Success Header */}
      <div className="text-center mb-8">
        <CheckCircleFilled className="text-5xl mb-4" style={{ color: "#16A34A" }} />
        <h1 className="text-2xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          Order Submitted Successfully
        </h1>
        <p className="text-sm" style={{ color: config.secondaryColor }}>
          Your order has been placed and is being processed.
        </p>
      </div>

      {/* Order Details Card */}
      <div
        className="rounded-xl p-6 mb-6"
        style={{ border: `1px solid ${config.borderColor}` }}
      >
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: config.secondaryColor }}>
              Order Number
            </p>
            <p className="text-lg font-semibold mt-0.5" style={{ color: config.primaryColor }}>
              {order.orderNumber}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs uppercase tracking-wider font-semibold" style={{ color: config.secondaryColor }}>
              Order Total
            </p>
            <p className="text-lg font-semibold mt-0.5" style={{ color: config.primaryColor }}>
              {fmt(order.totalValue)}
            </p>
          </div>
        </div>

        <div className="border-t pt-4 mb-4" style={{ borderColor: config.borderColor }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: config.secondaryColor }}>
            Items Ordered ({order.items.length})
          </p>
          <div className="space-y-2">
            {order.items.slice(0, 10).map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span style={{ color: config.primaryColor }}>
                  {item.productName}
                  <span className="text-xs ml-1" style={{ color: config.secondaryColor }}>
                    × {item.quantity}
                  </span>
                </span>
                <span className="font-medium" style={{ color: config.primaryColor }}>
                  {fmt(item.quantity * item.unitPrice)}
                </span>
              </div>
            ))}
            {order.items.length > 10 && (
              <p className="text-xs" style={{ color: config.secondaryColor }}>
                ... and {order.items.length - 10} more items
              </p>
            )}
          </div>
        </div>

        <div className="border-t pt-4" style={{ borderColor: config.borderColor }}>
          <p className="text-xs font-semibold uppercase tracking-wider mb-2" style={{ color: config.secondaryColor }}>
            Ship To
          </p>
          <p className="text-sm" style={{ color: config.primaryColor }}>
            {order.shipping.contactName}
            {order.shipping.companyName && ` — ${order.shipping.companyName}`}
          </p>
          <p className="text-xs mt-1" style={{ color: config.secondaryColor }}>
            {order.shipping.address}, {order.shipping.city}, {order.shipping.state} {order.shipping.zip}
          </p>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
        <Link
          to="/catalog"
          className="text-sm font-medium no-underline px-8 py-2.5 rounded-lg text-white"
          style={{ backgroundColor: config.primaryColor }}
        >
          Continue Shopping
        </Link>
        <Link
          to="/"
          className="text-sm font-medium no-underline"
          style={{ color: config.secondaryColor }}
        >
          Return to Home
        </Link>
      </div>
    </div>
  );
}
