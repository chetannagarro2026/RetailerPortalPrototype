import { useState, useEffect, useCallback } from "react";
import { CloseOutlined, LeftOutlined, RightOutlined, FileImageOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";

interface Props {
  attachments: string[];
}

export default function ClaimAttachments({ attachments }: Props) {
  const config = activeBrandConfig;
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (attachments.length === 0) return null;

  return (
    <>
      <div
        className="rounded-xl p-5 sticky top-6 mt-4"
        style={{ border: `1px solid ${config.borderColor}`, backgroundColor: "#fff" }}
      >
        <h3 className="text-sm font-semibold m-0 mb-3" style={{ color: config.primaryColor }}>
          Attachments
        </h3>
        <div className="grid grid-cols-2 gap-2">
          {attachments.map((name, i) => (
            <button
              key={i}
              onClick={() => setLightboxIndex(i)}
              className="flex flex-col items-center gap-1.5 p-3 rounded-lg cursor-pointer bg-transparent transition-colors"
              style={{ border: `1px solid ${config.borderColor}`, backgroundColor: config.cardBg }}
            >
              <FileImageOutlined style={{ fontSize: 24, color: config.secondaryColor }} />
              <span
                className="text-[10px] text-center leading-tight w-full truncate"
                style={{ color: config.primaryColor }}
                title={name}
              >
                {name}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightboxIndex !== null && (
        <AttachmentLightbox
          attachments={attachments}
          index={lightboxIndex}
          onIndexChange={setLightboxIndex}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}

function AttachmentLightbox({
  attachments,
  index,
  onIndexChange,
  onClose,
}: {
  attachments: string[];
  index: number;
  onIndexChange: (i: number) => void;
  onClose: () => void;
}) {
  const current = attachments[index];

  const goPrev = useCallback(() => {
    onIndexChange(index > 0 ? index - 1 : attachments.length - 1);
  }, [index, attachments.length, onIndexChange]);

  const goNext = useCallback(() => {
    onIndexChange(index < attachments.length - 1 ? index + 1 : 0);
  }, [index, attachments.length, onIndexChange]);

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    document.addEventListener("keydown", handleKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKey);
      document.body.style.overflow = "";
    };
  }, [onClose, goPrev, goNext]);

  return (
    <div
      className="fixed inset-0 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.85)", zIndex: 1100 }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top bar */}
      <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10">
        <div className="flex items-center gap-3">
          <span className="text-sm text-white font-medium">{current}</span>
          <span className="text-xs text-white opacity-40">
            {index + 1} of {attachments.length}
          </span>
        </div>
        <button
          onClick={onClose}
          className="flex items-center justify-center w-8 h-8 rounded-full bg-transparent border-none cursor-pointer text-white opacity-70 hover:opacity-100"
          style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
        >
          <CloseOutlined style={{ fontSize: 14 }} />
        </button>
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

      {/* Preview placeholder */}
      <div className="flex flex-col items-center justify-center gap-4">
        <FileImageOutlined style={{ fontSize: 120, color: "#D1D5DB" }} />
        <p className="text-sm text-white opacity-80 m-0">{current}</p>
        <p className="text-xs text-white opacity-50 m-0">Image preview placeholder</p>
      </div>
    </div>
  );
}
