import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { LoginOutlined, UserOutlined, EyeOutlined, EyeInvisibleOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../config/brandConfig";
import { useAuth } from "../context/AuthContext";

export default function SignInPage() {
  const config = activeBrandConfig;
  const navigate = useNavigate();
  const { signIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ email?: boolean; password?: boolean }>({});

  const validateEmail = (val: string) => {
    if (!val.trim()) return "Email address is required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val)) return "Please enter a valid email address";
    return undefined;
  };

  const validatePassword = (val: string) => {
    if (!val) return "Password is required";
    return undefined;
  };

  const handleBlur = (field: "email" | "password") => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    if (field === "email") setErrors((prev) => ({ ...prev, email: validateEmail(email) }));
    if (field === "password") setErrors((prev) => ({ ...prev, password: validatePassword(password) }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailErr = validateEmail(email);
    const passwordErr = validatePassword(password);
    setErrors({ email: emailErr, password: passwordErr });
    setTouched({ email: true, password: true });

    if (emailErr || passwordErr) return;

    signIn();
    navigate("/");
  };

  const handleContinueAsGuest = () => {
    navigate("/");
  };

  const isFormValid = !validateEmail(email) && !validatePassword(password);

  return (
    <div
      className="flex items-center justify-center px-4 flex-1 h-full"
      style={{ backgroundColor: "#F8F9FB" }}
    >
      <div
        className="w-full bg-white"
        style={{
          maxWidth: 420,
          borderRadius: 8,
          padding: 16,
          boxShadow: "0 4px 24px rgba(0, 0, 0, 0.06)",
          border: `1px solid ${config.borderColor}`,
        }}
      >
        {/* Header */}
        <SignInHeader config={config} />

        {/* Form */}
        <form onSubmit={handleSubmit} noValidate>
          <EmailField
            value={email}
            onChange={setEmail}
            onBlur={() => handleBlur("email")}
            error={touched.email ? errors.email : undefined}
            config={config}
          />

          <PasswordField
            value={password}
            onChange={setPassword}
            onBlur={() => handleBlur("password")}
            showPassword={showPassword}
            onTogglePassword={() => setShowPassword(!showPassword)}
            error={touched.password ? errors.password : undefined}
            config={config}
          />

          {/* Forgot Password */}
          <div className="flex justify-end mb-5">
            <button
              type="button"
              className="text-xs font-medium cursor-pointer bg-transparent border-none p-0"
              style={{ color: config.primaryColor }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Sign In Button */}
          <button
            type="submit"
            disabled={!isFormValid}
            className="w-full flex items-center justify-center gap-2 text-sm font-semibold rounded-lg cursor-pointer transition-opacity text-white"
            style={{
              height: 44,
              backgroundColor: isFormValid ? config.primaryColor : "#A0AEC0",
              border: "none",
              opacity: isFormValid ? 1 : 0.7,
            }}
          >
            <LoginOutlined className="text-xs" />
            Sign In
          </button>
        </form>

        {/* Divider */}
        <div className="flex items-center gap-3 my-6">
          <div className="flex-1 h-px" style={{ backgroundColor: config.borderColor }} />
          <span className="text-xs" style={{ color: config.secondaryColor }}>or</span>
          <div className="flex-1 h-px" style={{ backgroundColor: config.borderColor }} />
        </div>

        {/* Register section */}
        <p className="text-sm text-center mb-3" style={{ color: config.primaryColor, fontWeight: 500 }}>
          New to Retail Portal?
        </p>
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2 text-sm font-medium rounded-lg cursor-pointer transition-colors"
          style={{
            height: 44,
            border: `1px solid ${config.borderColor}`,
            backgroundColor: "#fff",
            color: config.primaryColor,
          }}
        >
          <UserOutlined className="text-xs" />
          Register
        </button>

        {/* Continue as Guest */}
        <div className="text-center mt-4">
          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="text-xs font-medium cursor-pointer bg-transparent border-none p-0 transition-colors"
            style={{ color: config.secondaryColor }}
            onMouseEnter={(e) => { e.currentTarget.style.color = config.primaryColor; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = config.secondaryColor; }}
          >
            Continue as Guest
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Sub-components ─── */

function SignInHeader({ config }: { config: typeof activeBrandConfig }) {
  return (
    <div className="text-center mb-6">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center mx-auto mb-4"
        style={{ backgroundColor: config.cardBg }}
      >
        <LoginOutlined className="text-lg" style={{ color: config.primaryColor }} />
      </div>
      <h2 className="text-xl font-semibold mb-0" style={{ color: config.primaryColor }}>
        Sign In
      </h2>
    </div>
  );
}

function EmailField({
  value,
  onChange,
  onBlur,
  error,
  config,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  error?: string;
  config: typeof activeBrandConfig;
}) {
  return (
    <div className="mb-4">
      <label className="text-xs font-medium mb-1.5 block" style={{ color: config.secondaryColor }}>
        Email Address
      </label>
      <input
        type="email"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onBlur}
        placeholder="Enter your registered email"
        className="w-full text-sm rounded-lg px-3 outline-none transition-colors"
        style={{
          height: 40,
          border: `1px solid ${error ? "#DC2626" : config.borderColor}`,
          color: config.primaryColor,
          backgroundColor: "#fff",
          boxSizing: "border-box",
        }}
        onFocus={(e) => { e.currentTarget.style.borderColor = error ? "#DC2626" : config.primaryColor; }}
        onBlurCapture={(e) => { e.currentTarget.style.borderColor = error ? "#DC2626" : config.borderColor; }}
      />
      {error && <p className="text-[11px] mt-1 mb-0" style={{ color: "#DC2626" }}>{error}</p>}
    </div>
  );
}

function PasswordField({
  value,
  onChange,
  onBlur,
  showPassword,
  onTogglePassword,
  error,
  config,
}: {
  value: string;
  onChange: (v: string) => void;
  onBlur: () => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  error?: string;
  config: typeof activeBrandConfig;
}) {
  return (
    <div className="mb-2">
      <label className="text-xs font-medium mb-1.5 block" style={{ color: config.secondaryColor }}>
        Password
      </label>
      <div className="relative">
        <input
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={onBlur}
          placeholder="Enter your password"
          className="w-full text-sm rounded-lg px-3 pr-10 outline-none transition-colors"
          style={{
            height: 40,
            border: `1px solid ${error ? "#DC2626" : config.borderColor}`,
            color: config.primaryColor,
            backgroundColor: "#fff",
            boxSizing: "border-box",
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = error ? "#DC2626" : config.primaryColor; }}
          onBlurCapture={(e) => { e.currentTarget.style.borderColor = error ? "#DC2626" : config.borderColor; }}
        />
        <button
          type="button"
          onClick={onTogglePassword}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 cursor-pointer bg-transparent border-none p-1"
          style={{ color: config.secondaryColor }}
        >
          {showPassword ? <EyeInvisibleOutlined className="text-sm" /> : <EyeOutlined className="text-sm" />}
        </button>
      </div>
      {error && <p className="text-[11px] mt-1 mb-0" style={{ color: "#DC2626" }}>{error}</p>}
    </div>
  );
}
