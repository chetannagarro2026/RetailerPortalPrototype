import { useEffect } from "react";
import { CloseOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { INVOICES, outstanding } from "../../data/invoices";
import InvoiceDetailSummary from "../invoices/InvoiceDetailSummary";
import InvoiceDetailItems from "../invoices/InvoiceDetailItems";
import InvoiceDetailPayments from "../invoices/InvoiceDetailPayments";

interface Props {
  invoiceNumber: string;
  visible: boolean;
  onClose: () => void;
}

export default function InvoiceOverlayPanel({ invoiceNumber, visible, onClose }: Props) {
  const config = activeBrandConfig;
  const invoice = INVOICES.find((inv) => inv.invoiceNumber === invoiceNumber) || null;

  // Lock body scroll when open
  useEffect(() => {
    if (visible) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [visible]);

  // Close on ESC
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [visible, onClose]);

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: "fixed",
          inset: 0,
          backgroundColor: "rgba(0,0,0,0.35)",
          zIndex: 999,
        }}
      />

      {/* Panel */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          bottom: 0,
          width: "min(680px, 85vw)",
          backgroundColor: "#fff",
          zIndex: 1000,
          display: "flex",
          flexDirection: "column",
          boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${config.borderColor}` }}
        >
          <div>
            <h2 className="text-base font-bold m-0" style={{ color: config.primaryColor }}>
              Invoice {invoiceNumber}
            </h2>
            <p className="text-xs m-0 mt-0.5" style={{ color: config.secondaryColor }}>
              Read-only preview
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer bg-transparent"
            style={{ border: `1px solid ${config.borderColor}`, color: config.secondaryColor }}
          >
            <CloseOutlined style={{ fontSize: 12 }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5" style={{ backgroundColor: config.cardBg }}>
          {!invoice ? (
            <div className="text-center py-16">
              <p className="text-sm" style={{ color: config.secondaryColor }}>
                Invoice {invoiceNumber} not found.
              </p>
            </div>
          ) : (
            <>
              <InvoiceDetailSummary invoice={invoice} />
              <InvoiceDetailItems items={invoice.items} orderDiscount={invoice.orderDiscount} />
              <InvoiceDetailPayments payments={invoice.payments} outstandingAmount={outstanding(invoice)} />
            </>
          )}
        </div>
      </div>
    </>
  );
}
