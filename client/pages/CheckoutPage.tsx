import { useState } from "react";
import { Button, Input, Steps } from "antd";
import { ArrowLeftOutlined, CheckCircleOutlined } from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { activeBrandConfig } from "../config/brandConfig";
import { useOrder } from "../context/OrderContext";
import { useCreditState } from "../hooks/useCreditState";
import CreditSummaryBlock from "../components/cart/CreditSummaryBlock";

interface ShippingForm {
  contactName: string;
  companyName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  notes: string;
}

const EMPTY_FORM: ShippingForm = {
  contactName: "",
  companyName: "",
  address: "",
  city: "",
  state: "",
  zip: "",
  phone: "",
  notes: "",
};

export default function CheckoutPage() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const { items, totalUnits, totalValue, clearOrder } = useOrder();
  const credit = useCreditState();
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState<ShippingForm>(EMPTY_FORM);

  if (items.length === 0) {
    return (
      <div className="max-w-content mx-auto px-6 py-16 text-center">
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          No items to checkout
        </h1>
        <p className="text-sm mb-4" style={{ color: config.secondaryColor }}>
          Add items to your cart before checking out.
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

  const fmt = (val: number) =>
    "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });

  const isShippingValid =
    shipping.contactName.trim() &&
    shipping.address.trim() &&
    shipping.city.trim() &&
    shipping.state.trim() &&
    shipping.zip.trim();

  const handleSubmit = () => {
    if (credit.isExceeded) return;
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;
    const orderSummary = {
      orderNumber,
      items: [...items],
      totalUnits,
      totalValue,
      shipping: { ...shipping },
      submittedAt: new Date().toISOString(),
    };
    clearOrder();
    navigate("/order-confirmation", { state: orderSummary });
  };

  return (
    <div className="max-w-content mx-auto px-6 py-8">
      <Link
        to="/cart"
        className="text-xs no-underline mb-4 flex items-center gap-1"
        style={{ color: config.secondaryColor }}
      >
        <ArrowLeftOutlined className="text-[10px]" />
        Back to Cart
      </Link>

      <h1 className="text-xl font-semibold mb-6" style={{ color: config.primaryColor }}>
        Checkout
      </h1>

      <Steps
        current={step}
        size="small"
        className="mb-8"
        items={[
          { title: "Shipping" },
          { title: "Review" },
          { title: "Confirm" },
        ]}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {step === 0 && (
            <ShippingStep
              shipping={shipping}
              onChange={setShipping}
              onNext={() => setStep(1)}
              isValid={!!isShippingValid}
            />
          )}
          {step === 1 && (
            <ReviewStep
              items={items}
              totalUnits={totalUnits}
              totalValue={totalValue}
              shipping={shipping}
              onBack={() => setStep(0)}
              onSubmit={handleSubmit}
              isExceeded={credit.isExceeded}
            />
          )}
        </div>

        <div className="space-y-5">
          {/* Order Total */}
          <div
            className="rounded-xl p-5"
            style={{ border: `1px solid ${config.borderColor}` }}
          >
            <h3 className="text-sm font-semibold mb-3" style={{ color: config.primaryColor }}>
              Order Total
            </h3>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: config.secondaryColor }}>Subtotal ({totalUnits} units)</span>
              <span className="font-medium" style={{ color: config.primaryColor }}>{fmt(totalValue)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span style={{ color: config.secondaryColor }}>Payment Method</span>
              <span className="font-medium" style={{ color: config.primaryColor }}>Credit Account</span>
            </div>
          </div>
          <CreditSummaryBlock />
        </div>
      </div>
    </div>
  );
}

// ── Step 1: Shipping ────────────────────────────────────────────────

function ShippingStep({
  shipping,
  onChange,
  onNext,
  isValid,
}: {
  shipping: ShippingForm;
  onChange: (s: ShippingForm) => void;
  onNext: () => void;
  isValid: boolean;
}) {
  const config = activeBrandConfig;
  const update = (field: keyof ShippingForm, value: string) =>
    onChange({ ...shipping, [field]: value });

  return (
    <div
      className="rounded-xl p-6"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      <h2 className="text-base font-semibold mb-5" style={{ color: config.primaryColor }}>
        Shipping Details
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Contact Name *" value={shipping.contactName} onChange={(v) => update("contactName", v)} />
        <FormField label="Company Name" value={shipping.companyName} onChange={(v) => update("companyName", v)} />
        <div className="md:col-span-2">
          <FormField label="Street Address *" value={shipping.address} onChange={(v) => update("address", v)} />
        </div>
        <FormField label="City *" value={shipping.city} onChange={(v) => update("city", v)} />
        <div className="grid grid-cols-2 gap-4">
          <FormField label="State *" value={shipping.state} onChange={(v) => update("state", v)} />
          <FormField label="ZIP Code *" value={shipping.zip} onChange={(v) => update("zip", v)} />
        </div>
        <FormField label="Phone" value={shipping.phone} onChange={(v) => update("phone", v)} />
        <div className="md:col-span-2">
          <FormField label="Order Notes" value={shipping.notes} onChange={(v) => update("notes", v)} textarea />
        </div>
      </div>

      <div className="flex justify-end mt-6">
        <Button
          type="primary"
          size="large"
          disabled={!isValid}
          onClick={onNext}
          style={{
            height: 44,
            fontWeight: 600,
            borderRadius: 8,
            backgroundColor: isValid ? config.primaryColor : undefined,
          }}
        >
          Continue to Review
        </Button>
      </div>
    </div>
  );
}

function FormField({
  label,
  value,
  onChange,
  textarea,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  textarea?: boolean;
}) {
  const config = activeBrandConfig;
  return (
    <div>
      <label className="text-xs font-medium mb-1 block" style={{ color: config.secondaryColor }}>
        {label}
      </label>
      {textarea ? (
        <Input.TextArea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          style={{ borderRadius: 8 }}
        />
      ) : (
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{ borderRadius: 8 }}
        />
      )}
    </div>
  );
}

// ── Step 2: Review ──────────────────────────────────────────────────

function ReviewStep({
  items,
  totalUnits,
  totalValue,
  shipping,
  onBack,
  onSubmit,
  isExceeded,
}: {
  items: ReturnType<typeof useOrder>["items"];
  totalUnits: number;
  totalValue: number;
  shipping: ShippingForm;
  onBack: () => void;
  onSubmit: () => void;
  isExceeded: boolean;
}) {
  const config = activeBrandConfig;
  const fmt = (val: number) =>
    "$" + val.toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <div className="space-y-5">
      {/* Shipping Summary */}
      <div
        className="rounded-xl p-5"
        style={{ border: `1px solid ${config.borderColor}` }}
      >
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold" style={{ color: config.primaryColor }}>Ship To</h3>
          <button
            onClick={onBack}
            className="text-xs font-medium cursor-pointer bg-transparent border-none"
            style={{ color: config.primaryColor }}
          >
            Edit
          </button>
        </div>
        <p className="text-sm" style={{ color: config.primaryColor }}>
          {shipping.contactName}
          {shipping.companyName && <span className="text-xs ml-1" style={{ color: config.secondaryColor }}>({shipping.companyName})</span>}
        </p>
        <p className="text-xs mt-1" style={{ color: config.secondaryColor }}>
          {shipping.address}, {shipping.city}, {shipping.state} {shipping.zip}
        </p>
        {shipping.phone && (
          <p className="text-xs mt-0.5" style={{ color: config.secondaryColor }}>{shipping.phone}</p>
        )}
      </div>

      {/* Order Items */}
      <div
        className="rounded-xl p-5"
        style={{ border: `1px solid ${config.borderColor}` }}
      >
        <h3 className="text-sm font-semibold mb-4" style={{ color: config.primaryColor }}>
          Order Items ({items.length})
        </h3>
        <div className="space-y-3">
          {items.map((item) => {
            const variantDesc = Object.values(item.variantAttributes || {}).join(" · ");
            return (
              <div key={item.id} className="flex justify-between items-center">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate" style={{ color: config.primaryColor }}>
                    {item.productName}
                  </p>
                  <p className="text-xs" style={{ color: config.secondaryColor }}>
                    {item.sku}{variantDesc ? ` · ${variantDesc}` : ""} · Qty: {item.quantity}
                  </p>
                </div>
                <span className="text-sm font-medium shrink-0 ml-4" style={{ color: config.primaryColor }}>
                  {fmt(item.quantity * item.unitPrice)}
                </span>
              </div>
            );
          })}
        </div>
        <div className="border-t mt-4 pt-3" style={{ borderColor: config.borderColor }}>
          <div className="flex justify-between">
            <span className="text-sm font-semibold" style={{ color: config.primaryColor }}>
              Total ({totalUnits} units)
            </span>
            <span className="text-base font-semibold" style={{ color: config.primaryColor }}>
              {fmt(totalValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <Button onClick={onBack} style={{ borderRadius: 8 }}>
          <ArrowLeftOutlined className="text-xs" /> Back
        </Button>
        <Button
          type="primary"
          size="large"
          disabled={isExceeded}
          onClick={onSubmit}
          icon={<CheckCircleOutlined />}
          style={{
            height: 44,
            fontWeight: 600,
            borderRadius: 8,
            backgroundColor: isExceeded ? undefined : config.primaryColor,
          }}
        >
          {isExceeded ? "Credit Limit Exceeded" : "Submit Order"}
        </Button>
      </div>
    </div>
  );
}
