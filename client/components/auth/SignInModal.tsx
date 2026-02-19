import { LoginOutlined, UserOutlined, CloseOutlined } from "@ant-design/icons";
import { activeBrandConfig } from "../../config/brandConfig";
import { useAuth } from "../../context/AuthContext";

const DEFAULT_MESSAGE =
  "To complete your purchase and use your credit account, please sign in.";

export default function SignInModal() {
  const config = activeBrandConfig;
  const { signInModalVisible, signInModalMessage, hideSignInModal, signIn } = useAuth();

  if (!signInModalVisible) return null;

  const message = signInModalMessage || DEFAULT_MESSAGE;

  const handleSignIn = () => {
    signIn();
    hideSignInModal();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[100]"
        style={{ backgroundColor: "rgba(0, 0, 0, 0.45)" }}
        onClick={hideSignInModal}
      />

      {/* Modal */}
      <div
        className="fixed z-[101] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-xl w-full"
        style={{
          maxWidth: 420,
          boxShadow: "0 24px 48px rgba(0, 0, 0, 0.18)",
          padding: "32px 28px 28px",
        }}
      >
        {/* Close */}
        <button
          onClick={hideSignInModal}
          className="absolute top-3 right-3 p-2 rounded-lg cursor-pointer transition-colors hover:bg-gray-100"
          style={{ border: "none", background: "none", color: config.secondaryColor }}
        >
          <CloseOutlined className="text-sm" />
        </button>

        {/* Icon */}
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-5 mx-auto"
          style={{ backgroundColor: config.cardBg }}
        >
          <LoginOutlined className="text-xl" style={{ color: config.primaryColor }} />
        </div>

        {/* Title */}
        <h2
          className="text-lg font-semibold text-center mb-2"
          style={{ color: config.primaryColor }}
        >
          Sign in to Place Your Order
        </h2>

        {/* Message */}
        <p
          className="text-sm text-center leading-relaxed mb-6"
          style={{ color: config.secondaryColor }}
        >
          {message}
        </p>

        {/* Buttons */}
        <div className="flex flex-col gap-2.5">
          <button
            onClick={handleSignIn}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg cursor-pointer transition-colors text-white"
            style={{ backgroundColor: config.primaryColor, border: "none" }}
          >
            <LoginOutlined className="text-xs" />
            Sign In
          </button>
          <button
            onClick={hideSignInModal}
            className="w-full flex items-center justify-center gap-2 py-3 text-sm font-medium rounded-lg cursor-pointer transition-colors"
            style={{
              border: `1px solid ${config.borderColor}`,
              backgroundColor: "#fff",
              color: config.primaryColor,
            }}
          >
            <UserOutlined className="text-xs" />
            Register
          </button>
        </div>
      </div>
    </>
  );
}
