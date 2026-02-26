import { useState, useEffect } from "react";
import { CheckCircleOutlined, LoadingOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";

interface Props {
  setDirty: (v: boolean) => void;
}

interface PasswordForm {
  current: string;
  newPassword: string;
  confirm: string;
}

interface PasswordErrors {
  current?: string;
  newPassword?: string;
  confirm?: string;
}

export default function SecurityTab({ setDirty }: Props) {
  const config = activeBrandConfig;
  const [form, setForm] = useState<PasswordForm>({ current: "", newPassword: "", confirm: "" });
  const [errors, setErrors] = useState<PasswordErrors>({});
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (field: keyof PasswordForm, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setDirty(true);
    setSuccess(false);
  };

  const validate = (): boolean => {
    const e: PasswordErrors = {};
    if (!form.current) e.current = "Current password is required.";
    if (!form.newPassword) e.newPassword = "New password is required.";
    else if (form.newPassword.length < 8) e.newPassword = "Password must be at least 8 characters.";
    if (!form.confirm) e.confirm = "Please confirm your password.";
    else if (form.confirm !== form.newPassword) e.confirm = "Passwords do not match.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    setSuccess(false);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setDirty(false);
    setForm({ current: "", newPassword: "", confirm: "" });
    setSuccess(true);
  };

  useEffect(() => () => setDirty(false), [setDirty]);

  return (
    <div>
      {/* Success banner */}
      {success && (
        <div
          className="rounded-lg px-4 py-3 mb-6 text-xs font-medium flex items-center gap-2"
          style={{ backgroundColor: "#F0FDF4", border: "1px solid #BBF7D0", color: "#166534" }}
        >
          <CheckCircleOutlined style={{ fontSize: 13 }} />
          Your password has been updated successfully.
        </div>
      )}

      {/* Block 1 — Change Password */}
      <div className="mb-8">
        <h3 className="text-base font-semibold m-0 mb-5" style={{ color: config.primaryColor }}>
          Security &amp; Password
        </h3>

        <div className="max-w-md space-y-4">
          <PasswordField
            label="Current Password"
            required
            value={form.current}
            error={errors.current}
            onChange={(v) => handleChange("current", v)}
          />
          <div>
            <PasswordField
              label="New Password"
              required
              value={form.newPassword}
              error={errors.newPassword}
              onChange={(v) => handleChange("newPassword", v)}
            />
            {!errors.newPassword && (
              <p className="text-[11px] mt-1 m-0" style={{ color: config.secondaryColor }}>
                Minimum 8 characters.
              </p>
            )}
          </div>
          <PasswordField
            label="Confirm Password"
            required
            value={form.confirm}
            error={errors.confirm}
            onChange={(v) => handleChange("confirm", v)}
          />
        </div>

        <div className="mt-6">
          <button
            onClick={handleSave}
            disabled={saving}
            className="text-sm font-medium px-6 py-2.5 rounded-lg text-white cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
            style={{ backgroundColor: config.primaryColor }}
          >
            {saving && <LoadingOutlined style={{ fontSize: 14 }} />}
            Update Password
          </button>
        </div>
      </div>

      {/* Divider */}
      <div className="w-full mb-6" style={{ borderBottom: `1px solid ${config.borderColor}` }} />

      {/* Block 2 — Login Information */}
      <div>
        <h3 className="text-base font-semibold m-0 mb-4" style={{ color: config.primaryColor }}>
          Login Information
        </h3>
        <div className="space-y-3">
          <InfoRow label="Last Login" value="Feb 26, 2026 at 10:45 AM" />
          <InfoRow label="Account Created" value="Jan 5, 2025" />
        </div>
      </div>
    </div>
  );
}

// ── Password field with toggle ──────────────────────────────────────

function PasswordField({
  label,
  value,
  onChange,
  error,
  required,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
}) {
  const config = activeBrandConfig;
  const [visible, setVisible] = useState(false);

  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: config.secondaryColor }}>
        {label}
        {required && <span style={{ color: "#DC2626" }}> *</span>}
      </label>
      <div className="relative">
        <input
          type={visible ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full text-sm rounded-lg px-3 py-2 pr-9 outline-none transition-colors"
          style={{
            border: `1px solid ${error ? "#DC2626" : config.borderColor}`,
            color: config.primaryColor,
            boxSizing: "border-box",
          }}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-transparent border-none cursor-pointer p-0 flex items-center"
          style={{ color: config.secondaryColor }}
        >
          {visible ? <EyeInvisibleOutlined style={{ fontSize: 14 }} /> : <EyeOutlined style={{ fontSize: 14 }} />}
        </button>
      </div>
      {error && (
        <p className="text-[11px] mt-1 m-0" style={{ color: "#DC2626" }}>
          {error}
        </p>
      )}
    </div>
  );
}

// ── Info row ────────────────────────────────────────────────────────

function InfoRow({ label, value }: { label: string; value: string }) {
  const config = activeBrandConfig;
  return (
    <div className="flex items-center justify-between max-w-md">
      <span className="text-xs" style={{ color: config.secondaryColor }}>{label}</span>
      <span className="text-xs font-medium" style={{ color: config.primaryColor }}>{value}</span>
    </div>
  );
}
