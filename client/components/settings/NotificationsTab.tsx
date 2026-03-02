import { useState, useEffect } from "react";
import { activeBrandConfig } from "../../config/brandConfig";
import { useToast } from "../toast/ToastProvider";
import type { NotificationEventType } from "../../data/notifications";

interface Props {
  setDirty: (v: boolean) => void;
}

// ── Event definitions by category ───────────────────────────────────

interface EventRow {
  key: NotificationEventType;
  label: string;
  mandatory?: boolean; // cannot disable in-app
}

interface CategoryGroup {
  title: string;
  events: EventRow[];
}

const CATEGORIES: CategoryGroup[] = [
  {
    title: "Financial",
    events: [
      { key: "invoice_generated", label: "Invoice Generated" },
      { key: "invoice_due", label: "Invoice Due Reminder" },
      { key: "invoice_overdue", label: "Invoice Overdue", mandatory: true },
      { key: "credit_note_issued", label: "Credit Note Issued" },
      { key: "credit_note_reflected", label: "Credit Note Reflected in Ledger" },
    ],
  },
  {
    title: "Returns & Claims",
    events: [
      { key: "claim_submitted", label: "Claim Submitted" },
      { key: "claim_approved", label: "Claim Approved" },
      { key: "claim_rejected", label: "Claim Rejected", mandatory: true },
      { key: "return_credit_generated", label: "Credit Note Generated" },
      { key: "return_credit_reflected", label: "Credit Note Reflected" },
    ],
  },
  {
    title: "Support",
    events: [
      { key: "ticket_reply", label: "New Ticket Reply", mandatory: true },
      { key: "ticket_closed", label: "Ticket Closed" },
    ],
  },
  {
    title: "Orders",
    events: [
      { key: "po_confirmed", label: "PO Confirmed" },
      { key: "po_shipped", label: "PO Shipped" },
      { key: "po_delayed", label: "PO Delayed" },
    ],
  },
];

// ── Default preferences ─────────────────────────────────────────────

type ChannelPrefs = Record<NotificationEventType, { inApp: boolean; email: boolean }>;

function buildDefaults(): ChannelPrefs {
  const emailOnByDefault: NotificationEventType[] = [
    "invoice_due",
    "invoice_overdue",
    "claim_approved",
    "ticket_reply",
  ];
  const prefs = {} as ChannelPrefs;
  for (const cat of CATEGORIES) {
    for (const evt of cat.events) {
      prefs[evt.key] = {
        inApp: true,
        email: emailOnByDefault.includes(evt.key),
      };
    }
  }
  return prefs;
}

// ── Component ───────────────────────────────────────────────────────

export default function NotificationsTab({ setDirty }: Props) {
  const config = activeBrandConfig;
  const { showToast } = useToast();
  const [prefs, setPrefs] = useState<ChannelPrefs>(buildDefaults);
  const [masterEmail, setMasterEmail] = useState(true);

  // Keep parent dirty state in sync (not used for save button anymore)
  useEffect(() => () => setDirty(false), [setDirty]);

  const toggleChannel = (
    key: NotificationEventType,
    channel: "inApp" | "email",
    mandatory: boolean | undefined,
  ) => {
    if (mandatory && channel === "inApp") return; // can't disable mandatory in-app
    setPrefs((prev) => {
      const updated = {
        ...prev,
        [key]: { ...prev[key], [channel]: !prev[key][channel] },
      };
      return updated;
    });
    // Instant save with toast
    showToast("success", "Preferences updated.");
  };

  const toggleMasterEmail = () => {
    const next = !masterEmail;
    setMasterEmail(next);
    if (!next) {
      // Turn off all emails
      setPrefs((prev) => {
        const updated = { ...prev };
        for (const key of Object.keys(updated) as NotificationEventType[]) {
          updated[key] = { ...updated[key], email: false };
        }
        return updated;
      });
    }
    showToast("success", "Preferences updated.");
  };

  return (
    <div>
      {/* Page title */}
      <div className="mb-6">
        <h3
          className="text-base font-semibold m-0 mb-1"
          style={{ color: config.primaryColor }}
        >
          Notification Preferences
        </h3>
        <p className="text-xs m-0" style={{ color: config.secondaryColor }}>
          Settings apply to your entire business account. Changes save instantly.
        </p>
      </div>

      {/* Master email toggle */}
      <MasterToggle
        label="Email Notifications"
        description="Enable or disable all email notifications"
        checked={masterEmail}
        onToggle={toggleMasterEmail}
      />

      {/* Column headers */}
      <div
        className="flex items-center py-2 px-1 mb-2"
        style={{ borderBottom: `1px solid ${config.borderColor}` }}
      >
        <span className="flex-1 text-[11px] font-semibold uppercase tracking-wider" style={{ color: config.secondaryColor }}>
          Event
        </span>
        <span className="w-16 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: config.secondaryColor }}>
          In-App
        </span>
        <span className="w-16 text-center text-[11px] font-semibold uppercase tracking-wider" style={{ color: config.secondaryColor }}>
          Email
        </span>
      </div>

      {/* Category groups */}
      {CATEGORIES.map((cat) => (
        <div key={cat.title} className="mb-5">
          <h4
            className="text-xs font-semibold uppercase tracking-wider m-0 mb-2 px-1"
            style={{ color: config.secondaryColor }}
          >
            {cat.title}
          </h4>
          <div
            className="rounded-lg overflow-hidden"
            style={{ border: `1px solid ${config.borderColor}` }}
          >
            {cat.events.map((evt, i) => (
              <EventToggleRow
                key={evt.key}
                event={evt}
                inApp={prefs[evt.key].inApp}
                email={prefs[evt.key].email}
                emailDisabled={!masterEmail}
                onToggle={(channel) =>
                  toggleChannel(evt.key, channel, evt.mandatory)
                }
                isLast={i === cat.events.length - 1}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── Master Toggle ───────────────────────────────────────────────────

function MasterToggle({
  label,
  description,
  checked,
  onToggle,
}: {
  label: string;
  description: string;
  checked: boolean;
  onToggle: () => void;
}) {
  const config = activeBrandConfig;

  return (
    <div
      className="flex items-center justify-between p-4 rounded-lg mb-5"
      style={{
        border: `1px solid ${config.borderColor}`,
        backgroundColor: config.cardBg,
      }}
    >
      <div>
        <p className="text-sm font-medium m-0" style={{ color: config.primaryColor }}>
          {label}
        </p>
        <p className="text-xs m-0 mt-0.5" style={{ color: config.secondaryColor }}>
          {description}
        </p>
      </div>
      <ToggleSwitch checked={checked} onChange={onToggle} />
    </div>
  );
}

// ── Event Toggle Row ────────────────────────────────────────────────

function EventToggleRow({
  event,
  inApp,
  email,
  emailDisabled,
  onToggle,
  isLast,
}: {
  event: EventRow;
  inApp: boolean;
  email: boolean;
  emailDisabled: boolean;
  onToggle: (channel: "inApp" | "email") => void;
  isLast: boolean;
}) {
  const config = activeBrandConfig;

  return (
    <div
      className="flex items-center px-4 py-3"
      style={{
        backgroundColor: "#fff",
        borderBottom: isLast ? "none" : `1px solid ${config.borderColor}`,
      }}
    >
      {/* Label */}
      <div className="flex-1 min-w-0">
        <span className="text-sm" style={{ color: config.primaryColor }}>
          {event.label}
        </span>
        {event.mandatory && (
          <span
            className="ml-2 text-[10px] px-1.5 py-0.5 rounded font-medium"
            style={{ backgroundColor: "#FEF3C7", color: "#92400E" }}
            title="Required notification"
          >
            Required
          </span>
        )}
      </div>

      {/* In-App toggle */}
      <div className="w-16 flex justify-center" title={event.mandatory ? "Required notification" : ""}>
        <ToggleSwitch
          checked={inApp}
          onChange={() => onToggle("inApp")}
          disabled={event.mandatory}
          size="small"
        />
      </div>

      {/* Email toggle */}
      <div className="w-16 flex justify-center">
        <ToggleSwitch
          checked={email}
          onChange={() => onToggle("email")}
          disabled={emailDisabled}
          size="small"
        />
      </div>
    </div>
  );
}

// ── Toggle Switch ───────────────────────────────────────────────────

function ToggleSwitch({
  checked,
  onChange,
  disabled,
  size = "default",
}: {
  checked: boolean;
  onChange: () => void;
  disabled?: boolean;
  size?: "default" | "small";
}) {
  const config = activeBrandConfig;
  const w = size === "small" ? 36 : 44;
  const h = size === "small" ? 20 : 24;
  const dot = size === "small" ? 16 : 20;
  const offset = checked ? w - dot - 2 : 2;

  return (
    <button
      role="switch"
      aria-checked={checked}
      onClick={disabled ? undefined : onChange}
      className="relative rounded-full border-none p-0 transition-colors"
      style={{
        width: w,
        height: h,
        backgroundColor: disabled
          ? "#E5E7EB"
          : checked
          ? config.primaryColor
          : "#D1D5DB",
        cursor: disabled ? "not-allowed" : "pointer",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      <span
        className="absolute rounded-full bg-white transition-all shadow-sm"
        style={{
          width: dot,
          height: dot,
          top: 2,
          left: offset,
        }}
      />
    </button>
  );
}
