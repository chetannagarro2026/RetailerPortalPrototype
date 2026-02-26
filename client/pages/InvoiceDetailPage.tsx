import { useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeftOutlined, LeftOutlined, RightOutlined, DownloadOutlined, CustomerServiceOutlined, FileTextOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { INVOICES, outstanding } from "../data/invoices";
import InvoiceDetailSummary from "../components/invoices/InvoiceDetailSummary";
import InvoiceDetailItems from "../components/invoices/InvoiceDetailItems";
import InvoiceDetailPayments from "../components/invoices/InvoiceDetailPayments";
import { downloadInvoicePdf } from "../utils/invoicePdf";
import CreateTicketDrawer from "../components/support/CreateTicketDrawer";

export default function InvoiceDetailPage() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const { invoiceId } = useParams<{ invoiceId: string }>();
  const [drawerOpen, setDrawerOpen] = useState(false);

  // Sort same as list page (latest first)
  const sorted = [...INVOICES].sort((a, b) => (b.invoiceDate > a.invoiceDate ? 1 : -1));
  const currentIdx = sorted.findIndex((inv) => inv.invoiceNumber === invoiceId);
  const invoice = currentIdx >= 0 ? sorted[currentIdx] : null;

  if (!invoice) {
    return (
      <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "64px 24px", boxSizing: "border-box" }} className="text-center">
        <FileTextOutlined className="text-5xl mb-4" style={{ color: config.secondaryColor }} />
        <h1 className="text-xl font-semibold mb-2" style={{ color: config.primaryColor }}>
          Invoice Not Found
        </h1>
        <p className="text-sm mb-6" style={{ color: config.secondaryColor }}>
          The invoice you're looking for doesn't exist or has been removed.
        </p>
        <Link
          to="/account/invoices"
          className="text-sm font-medium no-underline px-6 py-2.5 rounded-lg text-white inline-block"
          style={{ backgroundColor: config.primaryColor }}
        >
          Back to Invoices
        </Link>
      </div>
    );
  }

  const prev = currentIdx > 0 ? sorted[currentIdx - 1] : null;
  const next = currentIdx < sorted.length - 1 ? sorted[currentIdx + 1] : null;

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "24px 24px", boxSizing: "border-box" }}>
      {/* Back link */}
      <button
        onClick={() => navigate("/account/invoices")}
        className="flex items-center gap-2 text-sm font-medium cursor-pointer bg-transparent border-none mb-6 px-0"
        style={{ color: config.secondaryColor }}
      >
        <ArrowLeftOutlined style={{ fontSize: 12 }} />
        Back to Invoices
      </button>

      {/* Top Navigation Strip */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold m-0" style={{ color: config.primaryColor }}>
            Invoice {invoice.invoiceNumber}
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-xs" style={{ color: config.secondaryColor }}>
            Invoice {currentIdx + 1} of {sorted.length}
          </span>
          <button
            disabled={!prev}
            onClick={() => prev && navigate(`/account/invoices/${prev.invoiceNumber}`)}
            className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-colors"
            style={{
              border: `1px solid ${config.borderColor}`,
              backgroundColor: "#fff",
              color: prev ? config.primaryColor : config.borderColor,
              opacity: prev ? 1 : 0.5,
            }}
          >
            <LeftOutlined style={{ fontSize: 11 }} />
          </button>
          <button
            disabled={!next}
            onClick={() => next && navigate(`/account/invoices/${next.invoiceNumber}`)}
            className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer transition-colors"
            style={{
              border: `1px solid ${config.borderColor}`,
              backgroundColor: "#fff",
              color: next ? config.primaryColor : config.borderColor,
              opacity: next ? 1 : 0.5,
            }}
          >
            <RightOutlined style={{ fontSize: 11 }} />
          </button>
        </div>
      </div>

      {/* Summary */}
      <InvoiceDetailSummary invoice={invoice} />

      {/* Line Items */}
      <InvoiceDetailItems items={invoice.items} orderDiscount={invoice.orderDiscount} />

      {/* Payment History */}
      <InvoiceDetailPayments payments={invoice.payments} outstandingAmount={outstanding(invoice)} />

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3">
        <button
          onClick={() => setDrawerOpen(true)}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
          style={{
            border: `1px solid ${config.borderColor}`,
            backgroundColor: "#fff",
            color: config.secondaryColor,
          }}
        >
          <CustomerServiceOutlined style={{ fontSize: 14 }} />
          Contact Support
        </button>
        <button
          onClick={() => downloadInvoicePdf(invoice)}
          className="flex items-center gap-2 text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer text-white border-none transition-colors"
          style={{ backgroundColor: config.primaryColor }}
        >
          <DownloadOutlined style={{ fontSize: 14 }} />
          Download PDF
        </button>
      </div>

      {/* Create Ticket Drawer */}
      <CreateTicketDrawer
        visible={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        onCreated={(ticketId) => {
          setDrawerOpen(false);
          navigate(`/account/support/${ticketId}`);
        }}
        preset={{
          category: "Invoice Query",
          relatedDocument: invoice.invoiceNumber,
          lockDocument: true,
        }}
      />
    </div>
  );
}
