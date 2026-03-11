import { useState, useEffect } from "react";
import { LoadingOutlined, UserOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { useToast } from "../toast/ToastProvider";
import { useAuth } from "../../context/AuthContext";
import { searchUserByUsername, updateUserProfile, type UserDetails } from "../../services/userManagementService";

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

export default function ProfileTab({ setDirty }: Props) {
  const config = activeBrandConfig;
  const { showToast } = useToast();
  const { user, accessToken } = useAuth();
  const [form, setForm] = useState<FormData>({
    firstName: "",
    lastName: "",
    designation: "",
    phone: "",
    email: "",
  });
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [errors, setErrors] = useState<FormErrors>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch user details on mount
  useEffect(() => {
    const fetchUser = async () => {
      if (!user?.username || !accessToken) {
        setLoading(false);
        return;
      }

      try {
        const details = await searchUserByUsername(user.username, accessToken);
        if (details) {
          setUserDetails(details);
          setForm({
            firstName: details.firstName,
            lastName: details.lastName,
            designation: "", // We don't have designation in the API response
            phone: details.phone,
            email: details.businessEmail,
          });
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
        showToast("error", "Failed to load profile information");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [user?.username, accessToken, showToast]);

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
    if (!userDetails || !accessToken) {
      showToast("error", "Unable to update profile. Please try again.");
      return;
    }

    setSaving(true);
    try {
      // Extract role IDs from roles array
      const roleIds = userDetails.roles?.map(role => role.roleId) || [];

      // Update user with only modified fields
      await updateUserProfile(
        {
          userId: userDetails.userId,
          version: userDetails.version,
          username: userDetails.username,
          firstName: form.firstName,
          lastName: form.lastName,
          businessEmail: userDetails.businessEmail,
          phone: form.phone,
          roleIds: roleIds,
          sourceCodes: userDetails.sourceCodes,
          serviceabilityAreaCodes: userDetails.serviceabilityAreaCodes,
          countryIds: userDetails.countryIds,
          isActive: userDetails.isActive,
        },
        accessToken
      );

      setDirty(false);
      showToast("success", "Profile updated successfully.");
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Failed to update profile";
      showToast("error", errorMessage);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => () => setDirty(false), [setDirty]);

  // Show loading state while fetching user data
  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingOutlined style={{ fontSize: 24, color: config.primaryColor }} />
        <span className="ml-3 text-sm" style={{ color: config.secondaryColor }}>
          Loading profile...
        </span>
      </div>
    );
  }

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
