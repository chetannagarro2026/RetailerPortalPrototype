import { useState, useMemo } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeftOutlined, CheckCircleOutlined, CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { INVOICES } from "../data/invoices";
import type { Invoice } from "../data/invoices";
import {
  RETURN_CLAIMS,
  RETURN_REASONS,
  EVIDENCE_REQUIRED_REASONS,
  generateClaimId,
  canRaiseReturn,
  totalClaimedAmount,
  totalReturnQty,
  itemsWithReturn,
} from "../data/returns";
import type { ReturnLineItem, ReturnReason } from "../data/returns";
import InvoiceSearchInput from "../components/returns/InvoiceSearchInput";

type Step = 1 | 2 | 3 | 4 | 5;

const STEP_LABELS = ["Select Invoice", "Return Type", "Select Items", "Evidence", "Review & Submit"];

export default function CreateReturnPage() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const presetInvoice = searchParams.get("invoice") || "";

  const [step, setStep] = useState<Step>(presetInvoice ? 2 : 1);
  const [selectedInvoiceNum, setSelectedInvoiceNum] = useState(presetInvoice);
  const [returnType, setReturnType] = useState<"full" | "partial" | "">(
    ""
  );
  const [lineItems, setLineItems] = useState<ReturnLineItem[]>([]);
  const [overallComment, setOverallComment] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const selectedInvoice: Invoice | null = useMemo(
    () => INVOICES.find((inv) => inv.invoiceNumber === selectedInvoiceNum) || null,
    [selectedInvoiceNum]
  );

  const isInvoiceLocked = !!presetInvoice;

  // Build line items from invoice
  const buildLineItems = (invoice: Invoice, type: "full" | "partial") => {
    const items: ReturnLineItem[] = invoice.items.map((item) => {
      // Check historical returns for this item
      const alreadyReturned = RETURN_CLAIMS.reduce((sum, claim) => {
        if (claim.invoiceNumber !== invoice.invoiceNumber) return sum;
        const found = claim.items.find((ci) => ci.itemId === item.id);
        return sum + (found ? found.returnQty : 0);
      }, 0);
      const eligible = item.quantity - alreadyReturned;
      return {
        itemId: item.id,
        productName: item.productName,
        sku: item.sku,
        deliveredQty: item.quantity,
        alreadyReturned,
        returnQty: type === "full" ? eligible : 0,
        unitPrice: item.unitPrice,
        reason: type === "full" ? ("Other" as ReturnReason) : "",
      };
    });
    setLineItems(items);
  };

  const handleInvoiceSelect = (invoiceNum: string) => {
    setSelectedInvoiceNum(invoiceNum);
    setReturnType("");
    setLineItems([]);
    setStep(2);
  };

  const handleReturnTypeSelect = (type: "full" | "partial") => {
    if (!selectedInvoice) return;
    setReturnType(type);
    buildLineItems(selectedInvoice, type);
    setStep(3);
  };

  const updateLineItem = (idx: number, field: keyof ReturnLineItem, value: number | string) => {
    setLineItems((prev) =>
      prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item))
    );
  };

  const activeItems = useMemo(() => itemsWithReturn(lineItems), [lineItems]);

  // Validation for step 3
  const step3Valid = useMemo(() => {
    if (activeItems.length === 0) return false;
    return activeItems.every((item) => {
      if (!item.reason) return false;
      const eligible = item.deliveredQty - item.alreadyReturned;
      if (item.returnQty > eligible || item.returnQty <= 0) return false;
      return true;
    });
  }, [activeItems]);

  // Check if evidence is required
  const evidenceRequired = useMemo(
    () => activeItems.some((item) => EVIDENCE_REQUIRED_REASONS.includes(item.reason as ReturnReason)),
    [activeItems]
  );

  const step4Valid = !evidenceRequired || files.length > 0;

  const handleSubmit = () => {
    if (submitting || !selectedInvoice) return;
    setSubmitting(true);

    const claimId = generateClaimId();
    const now = new Date().toISOString();

    RETURN_CLAIMS.unshift({
      id: String(RETURN_CLAIMS.length + 1),
      claimId,
      invoiceNumber: selectedInvoice.invoiceNumber,
      returnType: returnType as "full" | "partial",
      items: activeItems,
      status: "Submitted",
      claimedAmount: totalClaimedAmount(activeItems),
      comment: overallComment || undefined,
      attachments: files.map((f) => f.name),
      comments: [
        {
          id: `rc-${Date.now()}`,
          sender: "customer",
          senderName: "You",
          message: overallComment || `Return claim submitted for ${activeItems.length} item(s).`,
          timestamp: now,
        },
      ],
      createdAt: now,
    });

    navigate(`/account/returns/${claimId}`);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
  };

  const fmt = (v: number) => "$" + v.toLocaleString("en-US", { minimumFractionDigits: 2 });

  return (
    <div style={{ width: "100%", maxWidth: 1280, margin: "0 auto", padding: "24px 24px", boxSizing: "border-box" }}>
      {/* Back */}
      <button
        onClick={() => navigate("/account/returns")}
        className="flex items-center gap-2 text-sm font-medium cursor-pointer bg-transparent border-none mb-5 px-0"
        style={{ color: config.secondaryColor }}
      >
        <ArrowLeftOutlined style={{ fontSize: 12 }} />
        Back to Returns & Claims
      </button>

      <h1 className="text-xl font-bold m-0 mb-6" style={{ color: config.primaryColor }}>
        Create Return
      </h1>

      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEP_LABELS.map((label, idx) => {
          const stepNum = (idx + 1) as Step;
          const isActive = step === stepNum;
          const isCompleted = step > stepNum;
          return (
            <div key={label} className="flex items-center gap-2">
              {idx > 0 && (
                <div className="w-8 h-px" style={{ backgroundColor: isCompleted ? config.primaryColor : config.borderColor }} />
              )}
              <div className="flex items-center gap-1.5">
                <span
                  className="w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-semibold flex-shrink-0"
                  style={{
                    backgroundColor: isActive ? config.primaryColor : isCompleted ? config.primaryColor : config.cardBg,
                    color: isActive || isCompleted ? "#fff" : config.secondaryColor,
                    border: !isActive && !isCompleted ? `1px solid ${config.borderColor}` : "none",
                  }}
                >
                  {isCompleted ? <CheckCircleOutlined style={{ fontSize: 12 }} /> : stepNum}
                </span>
                <span
                  className="text-xs font-medium whitespace-nowrap hidden md:inline"
                  style={{ color: isActive ? config.primaryColor : config.secondaryColor }}
                >
                  {label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Step 1: Select Invoice */}
      {step === 1 && (
        <StepCard title="Select Invoice" config={config}>
          <p className="text-sm mb-4 m-0" style={{ color: config.secondaryColor }}>
            Search for the invoice you'd like to return items from.
          </p>
          <div style={{ maxWidth: 480 }}>
            <InvoiceSearchInput onSelect={handleInvoiceSelect} />
          </div>
        </StepCard>
      )}

      {/* Step 2: Return Type */}
      {step === 2 && selectedInvoice && (
        <StepCard title="Select Return Type" config={config}>
          <p className="text-sm mb-1 m-0" style={{ color: config.secondaryColor }}>
            Invoice: <strong style={{ color: config.primaryColor }}>{selectedInvoice.invoiceNumber}</strong>
          </p>
          {!canRaiseReturn(selectedInvoice.invoiceDate) && (
            <div className="rounded-lg px-4 py-3 mb-4 mt-3 text-xs" style={{ backgroundColor: "#FEF2F2", color: "#B91C1C", border: "1px solid #FECACA" }}>
              This invoice is outside the return window. Returns are only accepted within 60 days of the invoice date.
            </div>
          )}
          {canRaiseReturn(selectedInvoice.invoiceDate) && (
            <div className="flex flex-col gap-3 mt-5" style={{ maxWidth: 480 }}>
              {(["full", "partial"] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => handleReturnTypeSelect(type)}
                  className="flex items-start gap-3 p-4 rounded-lg cursor-pointer text-left transition-colors"
                  style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = "#F9FAFB"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = "#fff"; }}
                >
                  <span
                    className="w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5"
                    style={{ borderColor: config.primaryColor }}
                  />
                  <div>
                    <p className="text-sm font-semibold m-0" style={{ color: config.primaryColor }}>
                      {type === "full" ? "Return Entire Invoice" : "Return Partial Items"}
                    </p>
                    <p className="text-xs m-0 mt-1" style={{ color: config.secondaryColor }}>
                      {type === "full"
                        ? "Return all delivered items from this invoice."
                        : "Select specific items and quantities to return."}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="mt-4">
            <button
              onClick={() => { if (!isInvoiceLocked) { setStep(1); setSelectedInvoiceNum(""); } else navigate("/account/returns"); }}
              className="text-xs font-medium cursor-pointer bg-transparent border-none px-0"
              style={{ color: config.secondaryColor }}
            >
              ← {isInvoiceLocked ? "Cancel" : "Change Invoice"}
            </button>
          </div>
        </StepCard>
      )}

      {/* Step 3: SKU Grid */}
      {step === 3 && (
        <StepCard title={returnType === "full" ? "Confirm Items" : "Select Items & Quantities"} config={config}>
          {returnType === "full" && (
            <div className="rounded-lg px-4 py-3 mb-4 text-xs" style={{ backgroundColor: "#EFF6FF", color: "#2563EB", border: "1px solid #BFDBFE" }}>
              You are returning full delivered quantities.
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${config.borderColor}` }}>
                  {["Product", "SKU", "Delivered", "Returned", "Eligible", "Return Qty", "Reason"].map((h) => (
                    <th
                      key={h}
                      className="text-[11px] font-semibold uppercase tracking-wider py-3 px-3 text-left"
                      style={{ color: config.secondaryColor }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {lineItems.map((item, idx) => {
                  const eligible = item.deliveredQty - item.alreadyReturned;
                  const qtyError = item.returnQty > eligible;
                  return (
                    <tr key={item.itemId} style={{ borderBottom: `1px solid ${config.borderColor}` }}>
                      <td className="py-3 px-3 font-medium" style={{ color: config.primaryColor }}>{item.productName}</td>
                      <td className="py-3 px-3 text-xs" style={{ color: config.secondaryColor }}>{item.sku}</td>
                      <td className="py-3 px-3 text-center">{item.deliveredQty}</td>
                      <td className="py-3 px-3 text-center" style={{ color: item.alreadyReturned > 0 ? "#DC2626" : config.secondaryColor }}>
                        {item.alreadyReturned}
                      </td>
                      <td className="py-3 px-3 text-center font-medium">{eligible}</td>
                      <td className="py-3 px-3">
                        <input
                          type="number"
                          min={0}
                          max={eligible}
                          value={item.returnQty}
                          onChange={(e) => updateLineItem(idx, "returnQty", Math.max(0, parseInt(e.target.value) || 0))}
                          disabled={returnType === "full"}
                          className="w-16 text-sm text-center rounded-md px-2 py-1.5 outline-none"
                          style={{
                            border: `1px solid ${qtyError ? "#DC2626" : config.borderColor}`,
                            color: config.primaryColor,
                            backgroundColor: returnType === "full" ? config.cardBg : "#fff",
                          }}
                        />
                        {qtyError && (
                          <p className="text-[10px] m-0 mt-0.5" style={{ color: "#DC2626" }}>Max {eligible}</p>
                        )}
                      </td>
                      <td className="py-3 px-3">
                        <select
                          value={item.reason}
                          onChange={(e) => updateLineItem(idx, "reason", e.target.value)}
                          disabled={returnType === "full" && item.reason !== ""}
                          className="text-xs rounded-md px-2 py-1.5 outline-none appearance-none cursor-pointer"
                          style={{
                            border: `1px solid ${config.borderColor}`,
                            color: item.reason ? config.primaryColor : config.secondaryColor,
                            backgroundColor: "#fff",
                            minWidth: 110,
                          }}
                        >
                          <option value="">Select</option>
                          {RETURN_REASONS.map((r) => (
                            <option key={r} value={r}>{r}</option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between mt-5">
            <button
              onClick={() => setStep(2)}
              className="text-xs font-medium cursor-pointer bg-transparent border-none px-0"
              style={{ color: config.secondaryColor }}
            >
              ← Back
            </button>
            <button
              onClick={() => setStep(4)}
              disabled={!step3Valid}
              className="text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer text-white border-none"
              style={{ backgroundColor: step3Valid ? config.primaryColor : config.borderColor, color: step3Valid ? "#fff" : config.secondaryColor }}
            >
              Next
            </button>
          </div>
        </StepCard>
      )}

      {/* Step 4: Evidence & Comments */}
      {step === 4 && (
        <StepCard title="Evidence & Comments" config={config}>
          {evidenceRequired && (
            <div className="rounded-lg px-4 py-3 mb-4 text-xs" style={{ backgroundColor: "#FFFBEB", color: "#D97706", border: "1px solid #FDE68A" }}>
              Photo evidence is required for items marked as Damaged or Quality Issue.
            </div>
          )}

          <div className="mb-5" style={{ maxWidth: 600 }}>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: config.primaryColor }}>
              Overall Comment <span className="font-normal" style={{ color: config.secondaryColor }}>(optional)</span>
            </label>
            <textarea
              value={overallComment}
              onChange={(e) => setOverallComment(e.target.value)}
              placeholder="Add any additional context about this return..."
              rows={4}
              className="w-full text-sm rounded-lg px-3 py-2.5 outline-none resize-y"
              style={{ border: `1px solid ${config.borderColor}`, color: config.primaryColor, fontFamily: "inherit" }}
            />
          </div>

          <div style={{ maxWidth: 600 }}>
            <label className="text-xs font-semibold block mb-1.5" style={{ color: config.primaryColor }}>
              Attachments {evidenceRequired && <span style={{ color: "#DC2626" }}>*</span>}
            </label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="rounded-lg text-center cursor-pointer py-6 px-4"
              style={{ border: `2px dashed ${config.borderColor}`, backgroundColor: config.cardBg }}
              onClick={() => document.getElementById("return-file-input")?.click()}
            >
              <CloudUploadOutlined className="text-2xl mb-2 block" style={{ color: config.secondaryColor }} />
              <p className="text-xs m-0" style={{ color: config.secondaryColor }}>
                Drag & drop files or <span style={{ color: config.primaryColor, fontWeight: 500 }}>click to browse</span>
              </p>
              <p className="text-[10px] m-0 mt-1" style={{ color: config.secondaryColor }}>Max 10MB per file</p>
            </div>
            <input id="return-file-input" type="file" multiple onChange={handleFileChange} className="hidden" />
            {files.length > 0 && (
              <div className="flex flex-col gap-2 mt-3">
                {files.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between px-3 py-2 rounded-lg" style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}>
                    <span className="text-xs truncate flex-1" style={{ color: config.primaryColor }}>{file.name}</span>
                    <span className="text-[10px] mx-2" style={{ color: config.secondaryColor }}>{(file.size / 1024).toFixed(0)} KB</span>
                    <button onClick={() => setFiles((p) => p.filter((_, i) => i !== idx))} className="flex items-center justify-center w-6 h-6 rounded cursor-pointer bg-transparent border-none" style={{ color: "#DC2626" }}>
                      <DeleteOutlined style={{ fontSize: 12 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between mt-5">
            <button onClick={() => setStep(3)} className="text-xs font-medium cursor-pointer bg-transparent border-none px-0" style={{ color: config.secondaryColor }}>← Back</button>
            <button
              onClick={() => setStep(5)}
              disabled={!step4Valid}
              className="text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer text-white border-none"
              style={{ backgroundColor: step4Valid ? config.primaryColor : config.borderColor, color: step4Valid ? "#fff" : config.secondaryColor }}
            >
              Review
            </button>
          </div>
        </StepCard>
      )}

      {/* Step 5: Review & Submit */}
      {step === 5 && selectedInvoice && (
        <StepCard title="Review & Submit" config={config}>
          <div className="mb-5">
            <p className="text-xs font-semibold uppercase tracking-wider mb-2 m-0" style={{ color: config.secondaryColor }}>Invoice</p>
            <p className="text-sm font-medium m-0" style={{ color: config.primaryColor }}>{selectedInvoice.invoiceNumber}</p>
          </div>

          <div className="overflow-x-auto mb-5">
            <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${config.borderColor}` }}>
                  {["Product", "SKU", "Return Qty", "Unit Price", "Subtotal", "Reason"].map((h) => (
                    <th key={h} className="text-[11px] font-semibold uppercase tracking-wider py-3 px-3 text-left" style={{ color: config.secondaryColor }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {activeItems.map((item) => (
                  <tr key={item.itemId} style={{ borderBottom: `1px solid ${config.borderColor}` }}>
                    <td className="py-3 px-3 font-medium" style={{ color: config.primaryColor }}>{item.productName}</td>
                    <td className="py-3 px-3 text-xs" style={{ color: config.secondaryColor }}>{item.sku}</td>
                    <td className="py-3 px-3 text-center">{item.returnQty}</td>
                    <td className="py-3 px-3">{fmt(item.unitPrice)}</td>
                    <td className="py-3 px-3 font-medium">{fmt(item.returnQty * item.unitPrice)}</td>
                    <td className="py-3 px-3 text-xs">{item.reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Summary */}
          <div className="rounded-lg p-4 mb-5" style={{ backgroundColor: config.cardBg, border: `1px solid ${config.borderColor}` }}>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: config.secondaryColor }}>Items Selected</span>
              <span style={{ color: config.primaryColor }}>{activeItems.length}</span>
            </div>
            <div className="flex justify-between text-sm mb-2">
              <span style={{ color: config.secondaryColor }}>Total Return Qty</span>
              <span style={{ color: config.primaryColor }}>{totalReturnQty(activeItems)}</span>
            </div>
            <div className="my-2" style={{ borderBottom: `1px solid ${config.borderColor}` }} />
            <div className="flex justify-between text-sm font-bold">
              <span style={{ color: config.primaryColor }}>Net Expected Credit Note</span>
              <span style={{ color: config.primaryColor }}>{fmt(totalClaimedAmount(activeItems))}</span>
            </div>
          </div>

          {overallComment && (
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1 m-0" style={{ color: config.secondaryColor }}>Comment</p>
              <p className="text-sm m-0" style={{ color: config.primaryColor }}>{overallComment}</p>
            </div>
          )}

          {files.length > 0 && (
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-wider mb-1 m-0" style={{ color: config.secondaryColor }}>Attachments ({files.length})</p>
              <div className="flex flex-wrap gap-2">
                {files.map((f, i) => (
                  <span key={i} className="text-xs px-2 py-1 rounded" style={{ backgroundColor: config.cardBg, color: config.primaryColor, border: `1px solid ${config.borderColor}` }}>{f.name}</span>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mt-5">
            <button onClick={() => setStep(4)} className="text-xs font-medium cursor-pointer bg-transparent border-none px-0" style={{ color: config.secondaryColor }}>← Back</button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="text-sm font-medium px-6 py-2.5 rounded-lg cursor-pointer text-white border-none"
              style={{ backgroundColor: config.primaryColor }}
            >
              {submitting ? "Submitting..." : "Submit Claim"}
            </button>
          </div>
        </StepCard>
      )}
    </div>
  );
}

function StepCard({ title, config, children }: { title: string; config: typeof activeBrandConfig; children: React.ReactNode }) {
  return (
    <div className="rounded-xl p-6" style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}>
      <h2 className="text-base font-semibold m-0 mb-4" style={{ color: config.primaryColor }}>{title}</h2>
      {children}
    </div>
  );
}
