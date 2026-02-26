import { useState, useRef, useCallback } from "react";
import {
  PaperClipOutlined,
  CloseOutlined,
  SendOutlined,
  InboxOutlined,
} from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";

interface Props {
  onSubmit: (message: string, attachments: File[]) => void;
}

export default function ReplyComposer({ onSubmit }: Props) {
  const config = activeBrandConfig;
  const [message, setMessage] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const canSubmit = message.trim().length > 0 || files.length > 0;

  const handleSubmit = () => {
    if (!canSubmit) return;
    onSubmit(message.trim(), files);
    setMessage("");
    setFiles([]);
    if (textareaRef.current) textareaRef.current.style.height = "auto";
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    // Auto-expand
    const el = e.target;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 200) + "px";
  };

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    setFiles((prev) => [...prev, ...arr]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      if (e.dataTransfer.files.length) addFiles(e.dataTransfer.files);
    },
    [addFiles]
  );

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(0) + " KB";
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  };

  return (
    <div
      onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      {/* Drag overlay */}
      {dragOver && (
        <div
          className="rounded-lg flex items-center justify-center gap-2 py-6 mb-3 text-sm"
          style={{ border: `2px dashed ${config.primaryColor}`, backgroundColor: `${config.primaryColor}08`, color: config.primaryColor }}
        >
          <InboxOutlined style={{ fontSize: 18 }} />
          Drop files here
        </div>
      )}

      {/* Textarea */}
      <textarea
        ref={textareaRef}
        value={message}
        onChange={handleTextChange}
        placeholder="Write your message…"
        className="w-full text-sm rounded-lg px-4 py-3 resize-none outline-none"
        style={{
          border: `1px solid ${config.borderColor}`,
          backgroundColor: "#fff",
          color: config.primaryColor,
          minHeight: 80,
          maxHeight: 200,
          fontFamily: "inherit",
          boxSizing: "border-box",
        }}
      />

      {/* Attached files */}
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2 mt-2">
          {files.map((file, idx) => (
            <div
              key={`${file.name}-${idx}`}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs"
              style={{ border: `1px solid ${config.borderColor}`, backgroundColor: config.cardBg }}
            >
              <PaperClipOutlined style={{ fontSize: 11, color: config.secondaryColor }} />
              <span style={{ color: config.primaryColor }}>{file.name}</span>
              <span style={{ color: config.secondaryColor }}>{formatSize(file.size)}</span>
              <button
                onClick={() => removeFile(idx)}
                className="flex items-center justify-center w-4 h-4 rounded-full bg-transparent border-none cursor-pointer p-0"
                style={{ color: config.secondaryColor }}
              >
                <CloseOutlined style={{ fontSize: 8 }} />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Actions row */}
      <div className="flex items-center justify-between mt-3">
        <button
          onClick={() => fileInputRef.current?.click()}
          className="flex items-center gap-1.5 text-xs font-medium cursor-pointer bg-transparent border-none px-0"
          style={{ color: config.secondaryColor }}
        >
          <PaperClipOutlined style={{ fontSize: 13 }} />
          Attach files
        </button>
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }}
        />
        <button
          onClick={handleSubmit}
          disabled={!canSubmit}
          className="flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-lg text-white border-none cursor-pointer transition-opacity"
          style={{
            backgroundColor: config.primaryColor,
            opacity: canSubmit ? 1 : 0.4,
            cursor: canSubmit ? "pointer" : "not-allowed",
          }}
        >
          <SendOutlined style={{ fontSize: 12 }} />
          Send Reply
        </button>
      </div>
    </div>
  );
}
