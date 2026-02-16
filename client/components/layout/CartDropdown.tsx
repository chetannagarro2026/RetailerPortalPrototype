import { useState } from "react";
import { Button, InputNumber } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";

interface CartItem {
  id: string;
  name: string;
  styleCode: string;
  color: string;
  quantity: number;
  unitPrice: number;
}

const initialCartItems: CartItem[] = [
  { id: "1", name: "CK Kids Puffer Jacket", styleCode: "CKK-4521", color: "Navy", quantity: 120, unitPrice: 42.5 },
  { id: "2", name: "IZOD Performance Polo", styleCode: "IZD-8834", color: "White", quantity: 200, unitPrice: 18.75 },
  { id: "3", name: "Buffalo Denim Trucker", styleCode: "BUF-3310", color: "Indigo", quantity: 80, unitPrice: 36.0 },
];

interface CartDropdownProps {
  visible: boolean;
  onClose: () => void;
}

export default function CartDropdown({ visible, onClose }: CartDropdownProps) {
  const config = activeBrandConfig;
  const [items, setItems] = useState<CartItem[]>(initialCartItems);

  const updateQuantity = (id: string, qty: number | null) => {
    if (qty === null || qty < 1) return;
    setItems((prev) => prev.map((item) => (item.id === id ? { ...item, quantity: qty } : item)));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

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
            {totalItems} units · {items.length} style{items.length !== 1 ? "s" : ""}
          </span>
        </div>

        {/* Items List */}
        <div className="max-h-[320px] overflow-y-auto">
          {items.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm text-gray-400">Your cart is empty</p>
            </div>
          ) : (
            items.map((item, idx) => (
              <div
                key={item.id}
                className="px-5 py-3.5"
                style={{
                  borderBottom: idx < items.length - 1 ? `1px solid ${config.borderColor}` : "none",
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  {/* Item Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">{item.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: config.secondaryColor }}>
                      {item.styleCode} · {item.color}
                    </p>
                    <p className="text-xs mt-1 text-gray-400">
                      ${item.unitPrice.toFixed(2)} / unit
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="flex items-center">
                      <Button
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        disabled={item.quantity <= 1}
                        style={{
                          width: 28,
                          height: 28,
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "6px 0 0 6px",
                          fontSize: 14,
                        }}
                      >
                        −
                      </Button>
                      <InputNumber
                        size="small"
                        min={1}
                        value={item.quantity}
                        onChange={(val) => updateQuantity(item.id, val)}
                        controls={false}
                        style={{
                          width: 52,
                          height: 28,
                          borderRadius: 0,
                          textAlign: "center",
                        }}
                      />
                      <Button
                        size="small"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        style={{
                          width: 28,
                          height: 28,
                          padding: 0,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          borderRadius: "0 6px 6px 0",
                          fontSize: 14,
                        }}
                      >
                        +
                      </Button>
                    </div>

                    <button
                      onClick={() => removeItem(item.id)}
                      className="p-1.5 rounded-md transition-colors cursor-pointer"
                      style={{ color: config.secondaryColor }}
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

                {/* Line Total */}
                <div className="flex justify-end mt-1.5">
                  <span className="text-xs font-medium" style={{ color: config.primaryColor }}>
                    ${(item.quantity * item.unitPrice).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div
            className="px-5 py-3.5"
            style={{ borderTop: `1px solid ${config.borderColor}` }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">Estimated Total</span>
              <span className="text-base font-semibold" style={{ color: config.primaryColor }}>
                ${totalValue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <Button
              type="primary"
              block
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

export function useCartCount() {
  // In a real app, this would come from global state/context
  return initialCartItems.reduce((sum, item) => sum + item.quantity, 0);
}
