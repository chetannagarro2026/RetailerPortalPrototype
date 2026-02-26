import { createContext, useContext, useCallback, useState, useEffect, useRef, type ReactNode } from "react";
import { CheckCircleOutlined, CloseCircleOutlined, WarningOutlined, CloseOutlined } from "@ant-design/icons";

// ── Types ───────────────────────────────────────────────────────────

type ToastType = "success" | "error" | "warning";

interface Toast {
  id: number;
  type: ToastType;
  message: string;
  exiting?: boolean;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string) => void;
}

// ── Context ─────────────────────────────────────────────────────────

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>");
  return ctx;
}

// ── Provider ────────────────────────────────────────────────────────

let nextId = 0;

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, exiting: true } : t)));
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 200);
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string) => {
      const id = ++nextId;
      setToasts((prev) => [...prev, { id, type, message }]);
      // Auto-dismiss success & warning after 3s
      if (type === "success" || type === "warning") {
        setTimeout(() => dismiss(id), 3000);
      }
    },
    [dismiss],
  );

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      {toasts.length > 0 && (
        <div
          style={{
            position: "fixed",
            top: 16,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 9999,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            pointerEvents: "none",
            width: "100%",
            maxWidth: 420,
          }}
        >
          {toasts.map((toast) => (
            <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
          ))}
        </div>
      )}
    </ToastContext.Provider>
  );
}

// ── Single Toast ────────────────────────────────────────────────────

const STYLES: Record<ToastType, { bg: string; border: string; color: string; icon: ReactNode }> = {
  success: {
    bg: "#F0FDF4",
    border: "#BBF7D0",
    color: "#166534",
    icon: <CheckCircleOutlined style={{ fontSize: 16, color: "#16A34A" }} />,
  },
  error: {
    bg: "#FEF2F2",
    border: "#FECACA",
    color: "#991B1B",
    icon: <CloseCircleOutlined style={{ fontSize: 16, color: "#DC2626" }} />,
  },
  warning: {
    bg: "#FFFBEB",
    border: "#FDE68A",
    color: "#92400E",
    icon: <WarningOutlined style={{ fontSize: 16, color: "#D97706" }} />,
  },
};

function ToastItem({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const s = STYLES[toast.type];
  const ref = useRef<HTMLDivElement>(null);

  // Entry animation
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    el.style.opacity = "0";
    el.style.transform = "translateY(-8px)";
    requestAnimationFrame(() => {
      el.style.transition = "opacity 200ms ease, transform 200ms ease";
      el.style.opacity = "1";
      el.style.transform = "translateY(0)";
    });
  }, []);

  // Exit animation
  useEffect(() => {
    if (!toast.exiting) return;
    const el = ref.current;
    if (!el) return;
    el.style.transition = "opacity 200ms ease, transform 200ms ease";
    el.style.opacity = "0";
    el.style.transform = "translateY(-8px)";
  }, [toast.exiting]);

  return (
    <div
      ref={ref}
      style={{
        backgroundColor: s.bg,
        border: `1px solid ${s.border}`,
        borderRadius: 8,
        padding: "12px 16px",
        display: "flex",
        alignItems: "center",
        gap: 10,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        pointerEvents: "auto",
      }}
    >
      <span style={{ flexShrink: 0 }}>{s.icon}</span>
      <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: s.color }}>{toast.message}</span>
      {toast.type === "error" && (
        <button
          onClick={onDismiss}
          style={{
            background: "none",
            border: "none",
            cursor: "pointer",
            padding: 0,
            color: s.color,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
          }}
        >
          <CloseOutlined style={{ fontSize: 12 }} />
        </button>
      )}
    </div>
  );
}
