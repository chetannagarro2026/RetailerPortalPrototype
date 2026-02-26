import { useState, useEffect, useRef } from "react";
import { LoadingOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { useToast } from "../toast/ToastProvider";

interface Props {
  setDirty: (v: boolean) => void;
}

interface Preferences {
  orderSubmitted: boolean;
  orderApproved: boolean;
  orderShipped: boolean;
  orderRejected: boolean;
  creditApproval: boolean;
  paymentReminder: boolean;
  invoiceGenerated: boolean;
  inApp: boolean;
  emailNotifications: boolean;
}

const INITIAL: Preferences = {
  orderSubmitted: true,
  orderApproved: true,
  orderShipped: true,
  orderRejected: true,
  creditApproval: true,
  paymentReminder: true,
  invoiceGenerated: false,
  inApp: true,
  emailNotifications: true,
};

const ORDER_ITEMS: { key: keyof Preferences; label: string }[] = [
  { key: "orderSubmitted", label: "Order Submitted" },
  { key: "orderApproved", label: "Order Approved" },
  { key: "orderShipped", label: "Order Shipped" },
  { key: "orderRejected", label: "Order Rejected" },
];

const FINANCIAL_ITEMS: { key: keyof Preferences; label: string }[] = [
  { key: "creditApproval", label: "Credit Approval Required" },
  { key: "paymentReminder", label: "Payment Reminder" },
  { key: "invoiceGenerated", label: "Invoice Generated" },
];

const CHANNEL_ITEMS: { key: keyof Preferences; label: string }[] = [
  { key: "inApp", label: "In-App Notifications" },
  { key: "emailNotifications", label: "Email Notifications" },
];

export default function NotificationsTab({ setDirty }: Props) {
  const config = activeBrandConfig;
  const { showToast } = useToast();
  const [prefs, setPrefs] = useState<Preferences>(INITIAL);
  const lastSavedRef = useRef<Preferences>(INITIAL);
  const [saving, setSaving] = useState(false);

  const toggle = (key: keyof Preferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
    setDirty(true);
  };

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setDirty(false);
    lastSavedRef.current = { ...prefs };
    showToast("success", "Notification preferences saved.");
  };

  useEffect(() => () => setDirty(false), [setDirty]);

  return (
    <div>
      {/* Section title */}
      <div className="mb-6">
        <h3 className="text-base font-semibold m-0" style={{ color: config.primaryColor }}>
          Notification Preferences
        </h3>
      </div>

      {/* Group 1 — Order Updates */}
      <CheckboxGroup title="Order Updates" items={ORDER_ITEMS} values={prefs} onToggle={toggle} />

      {/* Group 2 — Financial Updates */}
      <CheckboxGroup title="Financial Updates" items={FINANCIAL_ITEMS} values={prefs} onToggle={toggle} />

      {/* Group 3 — Channel Preferences */}
      <CheckboxGroup title="Channel Preferences" items={CHANNEL_ITEMS} values={prefs} onToggle={toggle} />

      {/* Save button */}
      <div className="flex justify-end mt-6">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm font-medium px-6 py-2.5 rounded-lg text-white cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          style={{ backgroundColor: config.primaryColor }}
        >
          {saving && <LoadingOutlined style={{ fontSize: 14 }} />}
          Save Preferences
        </button>
      </div>
    </div>
  );
}

// ── Checkbox Group ──────────────────────────────────────────────────

function CheckboxGroup({
  title,
  items,
  values,
  onToggle,
}: {
  title: string;
  items: { key: keyof Preferences; label: string }[];
  values: Preferences;
  onToggle: (key: keyof Preferences) => void;
}) {
  const config = activeBrandConfig;

  return (
    <div className="mb-6">
      <h4 className="text-xs font-semibold uppercase tracking-wider m-0 mb-3" style={{ color: config.secondaryColor }}>
        {title}
      </h4>
      <div className="space-y-2.5">
        {items.map((item) => (
          <label
            key={item.key}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <input
              type="checkbox"
              checked={values[item.key]}
              onChange={() => onToggle(item.key)}
              className="w-4 h-4 rounded cursor-pointer"
              style={{ accentColor: config.primaryColor }}
            />
            <span className="text-sm" style={{ color: config.primaryColor }}>
              {item.label}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
