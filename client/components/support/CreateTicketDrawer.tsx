import { useState, useEffect, useRef, useCallback } from "react";
import { CloseOutlined, CloudUploadOutlined, DeleteOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import type { TicketCategory } from "../../data/support";
import { SUPPORT_TICKETS, generateTicketId } from "../../data/support";

const CATEGORIES: TicketCategory[] = [
  "Order Issue",
  "Missing Items",
  "Invoice Query",
  "Payment Query",
  "Product Issue",
  "Other",
];

export interface CreateTicketPreset {
  category?: TicketCategory;
  relatedDocument?: string;
  lockDocument?: boolean;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onCreated: (ticketId: string) => void;
  preset?: CreateTicketPreset;
}

export default function CreateTicketDrawer({ visible, onClose, onCreated, preset }: Props) {
  const config = activeBrandConfig;
  const subjectRef = useRef<HTMLInputElement>(null);

  const [category, setCategory] = useState<TicketCategory | "">(preset?.category || "");
  const [relatedDoc, setRelatedDoc] = useState(preset?.relatedDocument || "");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const lockDoc = preset?.lockDocument ?? false;
  const isDirty = !!(category || relatedDoc || subject || description || files.length);

  // Reset form when drawer opens
  useEffect(() => {
    if (visible) {
      setCategory(preset?.category || "");
      setRelatedDoc(preset?.relatedDocument || "");
      setSubject("");
      setDescription("");
      setFiles([]);
      setSubmitting(false);
      setTimeout(() => subjectRef.current?.focus(), 200);
    }
  }, [visible, preset]);

  // ESC key
  useEffect(() => {
    if (!visible) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") handleClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [visible, isDirty]);

  const handleClose = useCallback(() => {
    if (isDirty && !window.confirm("Discard changes?")) return;
    onClose();
  }, [isDirty, onClose]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFiles((prev) => [...prev, ...Array.from(e.target.files!)]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files) {
      setFiles((prev) => [...prev, ...Array.from(e.dataTransfer.files)]);
    }
  };

  const removeFile = (idx: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== idx));
  };

  const isValid = category && subject.trim().length > 0 && description.trim().length >= 20;

  const handleSubmit = () => {
    if (!isValid || submitting) return;
    setSubmitting(true);

    const ticketId = generateTicketId();
    const now = new Date().toISOString();

    SUPPORT_TICKETS.unshift({
      id: String(SUPPORT_TICKETS.length + 1),
      ticketId,
      category: category as TicketCategory,
      subject: subject.trim(),
      description: description.trim(),
      relatedDocument: relatedDoc || undefined,
      status: "Open",
      priority: "Medium",
      unread: false,
      createdAt: now,
      lastUpdated: now,
      conversation: [
        {
          id: `m-${Date.now()}`,
          sender: "customer",
          senderName: "You",
          message: description.trim(),
          timestamp: now,
        },
      ],
    });

    onCreated(ticketId);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        style={{ backgroundColor: "rgba(0,0,0,0.3)" }}
        onClick={handleClose}
      />

      {/* Drawer */}
      <div
        className="fixed top-0 right-0 bottom-0 z-50 flex flex-col bg-white"
        style={{
          width: 520,
          maxWidth: "100vw",
          boxShadow: "-8px 0 32px rgba(0,0,0,0.12)",
        }}
      >
        {/* Header */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderBottom: `1px solid ${config.borderColor}` }}
        >
          <div>
            <h2 className="text-base font-semibold m-0" style={{ color: config.primaryColor }}>
              Create Support Ticket
            </h2>
            <p className="text-xs m-0 mt-1" style={{ color: config.secondaryColor }}>
              We'll get back to you within 1–2 business days.
            </p>
          </div>
          <button
            onClick={handleClose}
            className="flex items-center justify-center w-8 h-8 rounded-lg cursor-pointer bg-transparent transition-colors"
            style={{ border: `1px solid ${config.borderColor}`, color: config.secondaryColor }}
          >
            <CloseOutlined style={{ fontSize: 12 }} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5 flex flex-col gap-5">
          {/* Category */}
          <FormField label="Category" required>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TicketCategory)}
              className="w-full text-sm rounded-lg px-3 py-2.5 outline-none appearance-none cursor-pointer"
              style={{
                border: `1px solid ${config.borderColor}`,
                color: category ? config.primaryColor : config.secondaryColor,
                backgroundColor: "#fff",
              }}
            >
              <option value="">Select a category</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </FormField>

          {/* Related Document */}
          <FormField label="Related Document" hint={lockDoc && relatedDoc ? `Linked to ${relatedDoc}` : undefined}>
            <input
              type="text"
              value={relatedDoc}
              onChange={(e) => setRelatedDoc(e.target.value)}
              disabled={lockDoc}
              placeholder="Search Invoice # or PO #"
              className="w-full text-sm rounded-lg px-3 py-2.5 outline-none"
              style={{
                border: `1px solid ${config.borderColor}`,
                color: config.primaryColor,
                backgroundColor: lockDoc ? config.cardBg : "#fff",
                opacity: lockDoc ? 0.7 : 1,
              }}
            />
          </FormField>

          {/* Subject */}
          <FormField label="Subject" required>
            <input
              ref={subjectRef}
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value.slice(0, 120))}
              placeholder="Brief summary of your issue"
              maxLength={120}
              className="w-full text-sm rounded-lg px-3 py-2.5 outline-none"
              style={{
                border: `1px solid ${config.borderColor}`,
                color: config.primaryColor,
              }}
            />
            <span className="text-[10px] mt-1 block" style={{ color: config.secondaryColor }}>
              {subject.length}/120 characters
            </span>
          </FormField>

          {/* Description */}
          <FormField label="Description" required>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the issue in detail (minimum 20 characters)"
              rows={5}
              className="w-full text-sm rounded-lg px-3 py-2.5 outline-none resize-y"
              style={{
                border: `1px solid ${config.borderColor}`,
                color: config.primaryColor,
                fontFamily: "inherit",
              }}
            />
            {description.length > 0 && description.length < 20 && (
              <span className="text-[10px] mt-1 block" style={{ color: "#DC2626" }}>
                Minimum 20 characters required ({20 - description.length} more)
              </span>
            )}
          </FormField>

          {/* Attachments */}
          <FormField label="Attachments">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="rounded-lg text-center cursor-pointer py-6 px-4 transition-colors"
              style={{
                border: `2px dashed ${config.borderColor}`,
                backgroundColor: config.cardBg,
              }}
              onClick={() => document.getElementById("ticket-file-input")?.click()}
            >
              <CloudUploadOutlined className="text-2xl mb-2 block" style={{ color: config.secondaryColor }} />
              <p className="text-xs m-0" style={{ color: config.secondaryColor }}>
                Drag & drop files or <span style={{ color: config.primaryColor, fontWeight: 500 }}>click to browse</span>
              </p>
              <p className="text-[10px] m-0 mt-1" style={{ color: config.secondaryColor }}>
                PDF, JPG, PNG, XLS — Max 10MB per file
              </p>
            </div>
            <input
              id="ticket-file-input"
              type="file"
              multiple
              accept=".pdf,.jpg,.jpeg,.png,.xls,.xlsx"
              onChange={handleFileChange}
              className="hidden"
            />
            {files.length > 0 && (
              <div className="flex flex-col gap-2 mt-3">
                {files.map((file, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between px-3 py-2 rounded-lg"
                    style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
                  >
                    <span className="text-xs truncate flex-1" style={{ color: config.primaryColor }}>
                      {file.name}
                    </span>
                    <span className="text-[10px] mx-2 flex-shrink-0" style={{ color: config.secondaryColor }}>
                      {(file.size / 1024).toFixed(0)} KB
                    </span>
                    <button
                      onClick={() => removeFile(idx)}
                      className="flex items-center justify-center w-6 h-6 rounded cursor-pointer bg-transparent border-none"
                      style={{ color: "#DC2626" }}
                    >
                      <DeleteOutlined style={{ fontSize: 12 }} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </FormField>
        </div>

        {/* Footer */}
        <div
          className="flex items-center justify-between px-6 py-4 flex-shrink-0"
          style={{ borderTop: `1px solid ${config.borderColor}` }}
        >
          <button
            onClick={handleClose}
            className="text-sm font-medium px-4 py-2.5 rounded-lg cursor-pointer transition-colors"
            style={{
              border: `1px solid ${config.borderColor}`,
              backgroundColor: "#fff",
              color: config.secondaryColor,
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!isValid || submitting}
            className="text-sm font-medium px-5 py-2.5 rounded-lg cursor-pointer text-white border-none transition-colors"
            style={{
              backgroundColor: isValid && !submitting ? config.primaryColor : config.borderColor,
              color: isValid && !submitting ? "#fff" : config.secondaryColor,
            }}
          >
            {submitting ? "Submitting..." : "Submit Ticket"}
          </button>
        </div>
      </div>
    </>
  );
}

function FormField({
  label,
  required,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}) {
  const config = activeBrandConfig;
  return (
    <div>
      <label className="text-xs font-semibold block mb-1.5" style={{ color: config.primaryColor }}>
        {label}
        {required && <span style={{ color: "#DC2626" }}> *</span>}
      </label>
      {children}
      {hint && (
        <span className="text-[10px] mt-1 block" style={{ color: config.secondaryColor }}>
          {hint}
        </span>
      )}
    </div>
  );
}
