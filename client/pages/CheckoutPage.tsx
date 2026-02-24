import { useState, useCallback, useMemo } from "react";
import { Button, Input, Steps, Checkbox, App } from "antd";
import {
  ArrowLeftOutlined,
  CheckCircleOutlined,
  PlusOutlined,
  EnvironmentOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { activeBrandConfig } from "../config/brandConfig";
import { useOrder } from "../context/OrderContext";
import { useOrderHistory, type PurchaseOrder, type SavedAddress } from "../context/OrderHistoryContext";
import { useAuth } from "../context/AuthContext";
import { useCreditState } from "../hooks/useCreditState";
import { fetchBusinessAccountsByIdList } from "../services/businessAccountService";
import { createSalesOrder, type SalesOrderResponse } from "../services/salesOrderService";
import CreditSummaryBlock from "../components/cart/CreditSummaryBlock";

// ── Types ───────────────────────────────────────────────────────────

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

// ── Helpers ─────────────────────────────────────────────────────────

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

// ── Shipping Step ───────────────────────────────────────────────────

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
  const { addAddress } = useOrderHistory();
  const { user } = useAuth();
  
  // Get account ID from authenticated user
  const accountId = user?.accountId || "";
  const { data: businessAccounts, isLoading: isLoadingAddresses } = useQuery({
    queryKey: ["businessAccounts", accountId],
    queryFn: () => fetchBusinessAccountsByIdList(accountId),
    enabled: !!accountId, // Only fetch when accountId exists
    staleTime: 5 * 60 * 1000,
  });

  // Transform API addresses to SavedAddress format
  const addresses = useMemo<SavedAddress[]>(() => {
    if (!businessAccounts || businessAccounts.length === 0) return [];
    
    const account = businessAccounts[0];
    return account.addresses.map((addr, index) => ({
      id: `addr-${addr.id}`,
      contactName: account.contactPerson || "",
      companyName: account.tradeName || account.legalName || "",
      address: [addr.addrLine1, addr.addrLine2, addr.addrLine3]
        .filter(Boolean)
        .join(", "),
      city: addr.city,
      state: addr.state,
      zip: addr.zipCode,
      phone: account.phoneNumber || "",
      isDefault: index === 0, // First address is default
    }));
  }, [businessAccounts]);

  const defaultAddress = addresses.find(a => a.isDefault) || addresses[0] || null;

  const [selectedAddressId, setSelectedAddressId] = useState<string | "new">(
    defaultAddress ? defaultAddress.id : "new",
  );
  const [showNewForm, setShowNewForm] = useState(!defaultAddress);
  const [newForm, setNewForm] = useState<ShippingForm>(EMPTY_FORM);
  const [saveToBook, setSaveToBook] = useState(false);
  const [setAsDefault, setSetAsDefault] = useState(false);

  const selectSavedAddress = useCallback(
    (addrId: string) => {
      const addr = addresses.find((a) => a.id === addrId);
      if (!addr) return;
      setSelectedAddressId(addrId);
      setShowNewForm(false);
      onChange({
        contactName: addr.contactName,
        companyName: addr.companyName,
        address: addr.address,
        city: addr.city,
        state: addr.state,
        zip: addr.zip,
        phone: addr.phone,
        notes: "",
      });
    },
    [addresses, onChange],
  );

  // Pre-fill on mount if default exists and shipping is empty
  useState(() => {
    if (defaultAddress && !shipping.contactName) {
      selectSavedAddress(defaultAddress.id);
    }
  });

  const handleShowNewForm = () => {
    setSelectedAddressId("new");
    setShowNewForm(true);
    setNewForm(EMPTY_FORM);
    onChange(EMPTY_FORM);
  };

  const updateNew = (field: keyof ShippingForm, value: string) => {
    const updated = { ...newForm, [field]: value };
    setNewForm(updated);
    onChange(updated);
  };

  const handleNext = () => {
    if (showNewForm && saveToBook) {
      addAddress({
        contactName: newForm.contactName,
        companyName: newForm.companyName,
        address: newForm.address,
        city: newForm.city,
        state: newForm.state,
        zip: newForm.zip,
        phone: newForm.phone,
        isDefault: setAsDefault,
      });
    }
    onNext();
  };

  return (
    <div
      className="rounded-xl p-6"
      style={{ border: `1px solid ${config.borderColor}` }}
    >
      <h2 className="text-base font-semibold mb-5" style={{ color: config.primaryColor }}>
        Shipping Details
      </h2>

      {/* Loading State */}
      {isLoadingAddresses && (
        <div className="text-sm text-center py-4" style={{ color: config.secondaryColor }}>
          Loading addresses...
        </div>
      )}

      {/* Saved Addresses */}
      {!isLoadingAddresses && addresses.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider mb-3" style={{ color: config.secondaryColor }}>
            Saved Addresses
          </p>
          <div className="space-y-2">
            {addresses.map((addr) => (
              <button
                key={addr.id}
                onClick={() => selectSavedAddress(addr.id)}
                className="w-full text-left rounded-lg p-3.5 cursor-pointer transition-colors"
                style={{
                  border: selectedAddressId === addr.id
                    ? `2px solid ${config.primaryColor}`
                    : `1px solid ${config.borderColor}`,
                  backgroundColor: selectedAddressId === addr.id ? config.cardBg : "#fff",
                }}
              >
                <div className="flex items-start gap-2.5">
                  <EnvironmentOutlined
                    className="text-sm mt-0.5"
                    style={{ color: selectedAddressId === addr.id ? config.primaryColor : config.secondaryColor }}
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: config.primaryColor }}>
                        {addr.contactName}
                      </span>
                      {addr.isDefault && (
                        <span
                          className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded"
                          style={{ backgroundColor: "#EEF2FF", color: "#4338CA" }}
                        >
                          Default
                        </span>
                      )}
                    </div>
                    {addr.companyName && (
                      <p className="text-xs mt-0.5" style={{ color: config.secondaryColor }}>
                        {addr.companyName}
                      </p>
                    )}
                    <p className="text-xs mt-0.5" style={{ color: config.secondaryColor }}>
                      {addr.address}, {addr.city}, {addr.state} {addr.zip}
                    </p>
                    {addr.phone && (
                      <p className="text-xs mt-0.5" style={{ color: config.secondaryColor }}>
                        {addr.phone}
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Add New Address toggle */}
      {!isLoadingAddresses && !showNewForm && (
        <button
          onClick={handleShowNewForm}
          className="flex items-center gap-1.5 text-sm font-medium cursor-pointer bg-transparent border-none mb-5 px-0"
          style={{ color: config.primaryColor }}
        >
          <PlusOutlined className="text-xs" />
          Add New Address
        </button>
      )}

      {/* New Address Form */}
      {!isLoadingAddresses && showNewForm && (
        <div
          className="rounded-lg p-5 mb-5"
          style={{
            border: `2px solid ${config.primaryColor}`,
            backgroundColor: config.cardBg,
          }}
        >
          <p className="text-sm font-semibold mb-4" style={{ color: config.primaryColor }}>
            New Address
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField label="Contact Name *" value={newForm.contactName} onChange={(v) => updateNew("contactName", v)} />
            <FormField label="Company Name" value={newForm.companyName} onChange={(v) => updateNew("companyName", v)} />
            <div className="md:col-span-2">
              <FormField label="Street Address *" value={newForm.address} onChange={(v) => updateNew("address", v)} />
            </div>
            <FormField label="City *" value={newForm.city} onChange={(v) => updateNew("city", v)} />
            <div className="grid grid-cols-2 gap-4">
              <FormField label="State *" value={newForm.state} onChange={(v) => updateNew("state", v)} />
              <FormField label="ZIP Code *" value={newForm.zip} onChange={(v) => updateNew("zip", v)} />
            </div>
            <FormField label="Phone" value={newForm.phone} onChange={(v) => updateNew("phone", v)} />
          </div>

          <div className="flex flex-col gap-2 mt-4">
            <Checkbox checked={saveToBook} onChange={(e) => setSaveToBook(e.target.checked)}>
              <span className="text-xs" style={{ color: config.secondaryColor }}>
                Save to address book
              </span>
            </Checkbox>
            {saveToBook && (
              <Checkbox checked={setAsDefault} onChange={(e) => setSetAsDefault(e.target.checked)}>
                <span className="text-xs" style={{ color: config.secondaryColor }}>
                  Set as default address
                </span>
              </Checkbox>
            )}
          </div>
        </div>
      )}

      {/* Order Notes (always visible) */}
      <div className="mb-5">
        <FormField
          label="Order Notes"
          value={shipping.notes}
          onChange={(v) => onChange({ ...shipping, notes: v })}
          textarea
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="primary"
          size="large"
          disabled={!isValid}
          onClick={handleNext}
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

// ── Review Step ─────────────────────────────────────────────────────

function ReviewStep({
  items,
  totalUnits,
  totalValue,
  shipping,
  onBack,
  onSubmit,
  isExceeded,
  isSubmitting,
}: {
  items: ReturnType<typeof useOrder>["items"];
  totalUnits: number;
  totalValue: number;
  shipping: ShippingForm;
  onBack: () => void;
  onSubmit: () => void;
  isExceeded: boolean;
  isSubmitting: boolean;
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
                    {item.upc}{variantDesc ? ` · ${variantDesc}` : ""} · Qty: {item.quantity}
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
        <Button onClick={onBack} style={{ borderRadius: 8 }} disabled={isSubmitting}>
          <ArrowLeftOutlined className="text-xs" /> Back
        </Button>
        <Button
          type="primary"
          size="large"
          disabled={isExceeded || isSubmitting}
          loading={isSubmitting}
          onClick={onSubmit}
          icon={!isSubmitting && <CheckCircleOutlined />}
          style={{
            height: 44,
            fontWeight: 600,
            borderRadius: 8,
            backgroundColor: isExceeded ? undefined : config.primaryColor,
          }}
        >
          {isSubmitting ? "Submitting Order..." : isExceeded ? "Credit Limit Exceeded" : "Submit Order"}
        </Button>
      </div>
    </div>
  );
}

// ── Main Page ───────────────────────────────────────────────────────

export default function CheckoutPage() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const { message } = App.useApp();
  const { items, totalUnits, totalValue, clearOrder } = useOrder();
  const { addOrder } = useOrderHistory();
  const { user } = useAuth();
  const credit = useCreditState();
  const [step, setStep] = useState(0);
  const [shipping, setShipping] = useState<ShippingForm>(EMPTY_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleSubmit = async () => {
    if (credit.isExceeded || isSubmitting) return;
    
    setIsSubmitting(true);
    const orderNumber = `ORD-${Date.now().toString(36).toUpperCase()}`;

    try {
      // Create the sales order via API
      const apiResponse: SalesOrderResponse = await createSalesOrder({
        items,
        totalValue,
        totalUnits,
        shipping: {
          contactName: shipping.contactName,
          companyName: shipping.companyName,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          zip: shipping.zip,
          phone: shipping.phone,
        },
        accountId: user?.accountId || "",
        retailerAccountId: user?.accountId || "",
        orderNumber,
      });

      // Store order locally for order history
      const purchaseOrder: PurchaseOrder = {
        orderNumber: apiResponse.alternateOrderID || orderNumber,
        items: items.map((i) => ({
          id: i.id,
          productId: i.productId,
          productName: i.productName,
          upc: i.upc,
          variantAttributes: i.variantAttributes,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
          imageUrl: i.imageUrl,
        })),
        totalUnits,
        totalValue,
        shipping: {
          contactName: shipping.contactName,
          companyName: shipping.companyName,
          address: shipping.address,
          city: shipping.city,
          state: shipping.state,
          zip: shipping.zip,
          phone: shipping.phone,
        },
        paymentMethod: "Credit Account",
        status: (apiResponse.orderStatus === "Confirmed" || 
                 apiResponse.orderStatus === "Shipped" || 
                 apiResponse.orderStatus === "Delivered" 
                   ? apiResponse.orderStatus 
                   : "Pending") as PurchaseOrder["status"],
        submittedAt: new Date().toISOString(),
      };

      addOrder(purchaseOrder);
      clearOrder();
      
      message.success(`Order #${apiResponse.omsOrderId} submitted successfully!`);
      navigate("/order-confirmation", { state: { ...purchaseOrder, apiResponse } });
    } catch (error) {
      console.error("Failed to submit order:", error);
      message.error(
        error instanceof Error 
          ? `Failed to submit order: ${error.message}` 
          : "Failed to submit order. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
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
              isSubmitting={isSubmitting}
            />
          )}
        </div>

        <div className="space-y-5">
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
