import { useState, useEffect, useCallback } from "react";
import { LoadingOutlined, UserOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { useToast } from "../toast/ToastProvider";

interface Props {
  setDirty: (v: boolean) => void;
}

interface FormData {
  firstName: string;
  lastName: string;
  designation: string;
  phone: string;
  email: string;
}

interface FormErrors {
  firstName?: string;
  lastName?: string;
}

const INITIAL: FormData = {
  firstName: "Jane",
  lastName: "Cooper",
  designation: "Buying Manager",
  phone: "(312) 555-0199",
  email: "jane.cooper@acmecorp.com",
};

export default function ProfileTab({ setDirty }: Props) {
  const config = activeBrandConfig;
  const { showToast } = useToast();
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);

  const handleChange = (field: keyof FormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
    setDirty(true);
  };

  const validate = (): boolean => {
    const e: FormErrors = {};
    if (!form.firstName.trim()) e.firstName = "First name is required.";
    if (!form.lastName.trim()) e.lastName = "Last name is required.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSaving(false);
    setDirty(false);
    showToast("success", "Profile updated successfully.");
  };

  useEffect(() => () => setDirty(false), [setDirty]);

  return (
    <div>
      {/* Section title */}
      <div className="mb-6">
        <h3 className="text-base font-semibold m-0" style={{ color: config.primaryColor }}>
          Profile Information
        </h3>
      </div>

      {/* Two-column form */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
        <FormField
          label="First Name"
          required
          value={form.firstName}
          error={errors.firstName}
          onChange={(v) => handleChange("firstName", v)}
        />
        <FormField
          label="Phone Number"
          value={form.phone}
          onChange={(v) => handleChange("phone", v)}
        />
        <FormField
          label="Last Name"
          required
          value={form.lastName}
          error={errors.lastName}
          onChange={(v) => handleChange("lastName", v)}
        />
        <FormField
          label="Email"
          value={form.email}
          disabled
          onChange={() => {}}
        />
        <FormField
          label="Designation"
          value={form.designation}
          onChange={(v) => handleChange("designation", v)}
        />
        {/* Profile image placeholder */}
        <div>
          <label className="block text-xs font-medium mb-1.5" style={{ color: config.secondaryColor }}>
            Profile Photo
          </label>
          <div className="flex items-center gap-3">
            <div
              className="w-12 h-12 rounded-full flex items-center justify-center"
              style={{ backgroundColor: config.cardBg, border: `1px solid ${config.borderColor}` }}
            >
              <UserOutlined style={{ fontSize: 20, color: config.secondaryColor }} />
            </div>
            <button
              className="text-xs font-medium cursor-pointer bg-transparent px-0 py-0"
              style={{ color: config.primaryColor, border: "none" }}
            >
              Upload Photo
            </button>
          </div>
        </div>
      </div>

      {/* Save button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={handleSave}
          disabled={saving}
          className="text-sm font-medium px-6 py-2.5 rounded-lg text-white cursor-pointer border-none disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
          style={{ backgroundColor: config.primaryColor }}
        >
          {saving && <LoadingOutlined style={{ fontSize: 14 }} />}
          Save Changes
        </button>
      </div>
    </div>
  );
}

// ── Reusable field ──────────────────────────────────────────────────

function FormField({
  label,
  value,
  onChange,
  error,
  required,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
  required?: boolean;
  disabled?: boolean;
}) {
  const config = activeBrandConfig;
  return (
    <div>
      <label className="block text-xs font-medium mb-1.5" style={{ color: config.secondaryColor }}>
        {label}
        {required && <span style={{ color: "#DC2626" }}> *</span>}
      </label>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        className="w-full text-sm rounded-lg px-3 py-2 outline-none transition-colors"
        style={{
          border: `1px solid ${error ? "#DC2626" : config.borderColor}`,
          color: disabled ? config.secondaryColor : config.primaryColor,
          backgroundColor: disabled ? config.cardBg : "#fff",
          boxSizing: "border-box",
        }}
      />
      {error && (
        <p className="text-[11px] mt-1 m-0" style={{ color: "#DC2626" }}>
          {error}
        </p>
      )}
    </div>
  );
}
