import { useEffect, useCallback, useState } from "react";
import {
  CloseOutlined,
  LeftOutlined,
  RightOutlined,
  DownloadOutlined,
  FileImageOutlined,
  FilePdfOutlined,
  FileOutlined,
} from "@ant-design/icons";
import type { TicketAttachment } from "../../data/support";

interface Props {
  attachments: TicketAttachment[];
  initialIndex: number;
  onClose: () => void;
}

export default function AttachmentLightbox({ attachments, initialIndex, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);
  const current = attachments[index];

  const goPrev = useCallback(() => {
    setIndex((i) => (i > 0 ? i - 1 : attachments.length - 1));
  }, [attachments.length]);

  const goNext = useCallback(() => {
    setIndex((i) => (i < attachments.length - 1 ? i + 1 : 0));
  }, [attachments.length]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handleKey);
    // Prevent body scroll
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  const renderPreview = () => {
    if (current.type === "image") {
      return (
        <div className="flex items-center justify-center" style={{ maxHeight: "70vh", maxWidth: "80vw" }}>
          <FileImageOutlined style={{ fontSize: 120, color: "#D1D5DB" }} />
          <p className="absolute bottom-4 text-sm text-white opacity-70">Image preview: {current.name}</p>
        </div>
      );
    }
    if (current.type === "pdf") {
      return (
        <div className="flex flex-col items-center justify-center gap-4">
          <FilePdfOutlined style={{ fontSize: 80, color: "#DC2626" }} />
          <p className="text-sm text-white opacity-80 m-0">{current.name}</p>
          <p className="text-xs text-white opacity-50 m-0">PDF preview not available in prototype</p>
        </div>
      );
    }
    return (
      <div className="flex flex-col items-center justify-center gap-4">
        <FileOutlined style={{ fontSize: 80, color: "#9CA3AF" }} />
        <p className="text-sm text-white opacity-80 m-0">{current.name}</p>
        <p className="text-xs text-white opacity-50 m-0">Preview not available — download to view</p>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.85)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white font-medium">{current.name}</span>
          {current.size && <span className="text-xs text-white opacity-50">{current.size}</span>}
          <span className="text-xs text-white opacity-40">
            {index + 1} of {attachments.length}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {/* Mock download */}}
            className="flex items-center gap-1.5 text-xs text-white opacity-70 hover:opacity-100 bg-transparent border-none cursor-pointer px-3 py-1.5 rounded"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <DownloadOutlined style={{ fontSize: 12 }} />
            Download
          </button>
          <button
            onClick={onClose}
            className="flex items-center justify-center w-8 h-8 rounded-full bg-transparent border-none cursor-pointer text-white opacity-70 hover:opacity-100"
            style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
          >
            <CloseOutlined style={{ fontSize: 14 }} />
          </button>
        </div>
      </div>

      {/* Navigation arrows */}
      {attachments.length > 1 && (
        <>
          <button
            onClick={goPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer text-white"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <LeftOutlined style={{ fontSize: 16 }} />
          </button>
          <button
            onClick={goNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center border-none cursor-pointer text-white"
            style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
          >
            <RightOutlined style={{ fontSize: 16 }} />
          </button>
        </>
      )}

      {/* Content */}
      <div className="relative flex items-center justify-center">
        {renderPreview()}
      </div>
    </div>
  );
}
