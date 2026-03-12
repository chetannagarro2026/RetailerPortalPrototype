import { Button, InputNumber } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { activeBrandConfig, formatPrice, formatCurrency } from "../../config/brandConfig";
import { useOrder } from "../../context/OrderContext";
import { useAuth } from "../../context/AuthContext";

interface CartDropdownProps {
  visible: boolean;
  onClose: () => void;
}

export default function CartDropdown({ visible, onClose }: CartDropdownProps) {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const { items, totalUnits, totalValue, updateQuantity, removeItem } = useOrder();
  const { isAuthenticated } = useAuth();

  // Calculate total savings
  const totalSavings = isAuthenticated
    ? items.reduce((sum, item) => {
        if (item.originalPrice && item.originalPrice > item.unitPrice) {
          return sum + (item.originalPrice - item.unitPrice) * item.quantity;
        }
        return sum;
      }, 0)
    : 0;

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 z-40" onClick={onClose} />

      {/* Dropdown Panel */}
      <div
        className="absolute right-0 z-50 bg-white"
        style={{
          width: 420,
          borderRadius: 10,
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.12)",
          border: `1px solid ${config.borderColor}`,
          top: "100%",
          marginTop: 8,
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-5 py-3.5"
          style={{ borderBottom: `1px solid ${config.borderColor}` }}
        >
          <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
            Order Cart
          </span>
          <span className="text-xs" style={{ color: config.secondaryColor }}>
            {totalUnits} units · {items.length} item{items.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Items List */}
        <div className="max-h-[320px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">Your cart is empty</p>
            </div>
          ) : (
            items.map((item, idx) => {
              const variantDesc = Object.values(item.variantAttributes || {}).join(" · ");
              return (
                <div
                  key={item.id}
                  className="px-5 py-3.5"
                  style={{
                    borderBottom: idx < items.length - 1 ? `1px solid ${config.borderColor}` : "none",
                  }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{item.productName}</p>
                      <p className="text-xs mt-0.5" style={{ color: config.secondaryColor }}>
                        {item.upc}{variantDesc ? ` · ${variantDesc}` : ""}
                      </p>
                      <p className="text-xs mt-1 text-gray-400">
                        {formatPrice(item.unitPrice)} / unit
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <div className="flex items-center">
                        <Button
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          style={{
                            width: 28, height: 28, padding: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            borderRadius: "6px 0 0 6px", fontSize: 14,
                          }}
                        >
                          −
                        </Button>
                        <InputNumber
                          size="small"
                          min={1}
                          value={item.quantity}
                          onChange={(val) => val && updateQuantity(item.id, val)}
                          controls={false}
                          style={{ width: 65, height: 28, borderRadius: 0, textAlign: "center" }}
                        />
                        <Button
                          size="small"
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          style={{
                            width: 28, height: 28, padding: 0,
                            display: "flex", alignItems: "center", justifyContent: "center",
                            borderRadius: "0 6px 6px 0", fontSize: 14,
                          }}
                        >
                          +
                        </Button>
                      </div>

                      <button
                        onClick={() => removeItem(item.id)}
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

                  <div className="flex justify-end gap-3 mt-1.5">
                    {isAuthenticated && item.originalPrice && item.originalPrice > item.unitPrice && (
                      <span className="text-xs font-medium" style={{ color: "#16A34A" }}>
                        Save {formatPrice((item.originalPrice - item.unitPrice) * item.quantity)}
                      </span>
                    )}
                    <span className="text-xs font-medium" style={{ color: config.primaryColor }}>
                      {formatPrice(item.quantity * item.unitPrice)}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="px-5 py-3.5"
            style={{ borderTop: `1px solid ${config.borderColor}` }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-600">Estimated Total</span>
              <span className="text-base font-semibold" style={{ color: config.primaryColor }}>
                {formatCurrency(totalValue)}
              </span>
            </div>
            {isAuthenticated && totalSavings > 0 && (
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-600">You Save</span>
                <span className="text-sm font-semibold" style={{ color: "#16A34A" }}>
                  −{formatCurrency(totalSavings)}
                </span>
              </div>
            )}
            <Button
              type="primary"
              block
              onClick={() => {
                onClose();
                navigate("/cart");
              }}
              style={{
                height: 38,
                fontWeight: 600,
                borderRadius: 8,
                backgroundColor: config.primaryColor,
              }}
            >
              Review Order
            </Button>
          </div>
        )}
      </div>
    </>
  );
}

/** Hook to get cart count — reads from global OrderContext */
export function useCartCount() {
  const { totalUnits } = useOrder();
  return totalUnits;
}
