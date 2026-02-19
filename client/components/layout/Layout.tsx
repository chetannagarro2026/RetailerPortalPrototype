import { ConfigProvider } from "antd";
import { useLocation } from "react-router-dom";
import { activeBrandConfig } from "../../config/brandConfig";
import { createAntdTheme } from "../../theme/antdTheme";
import Header from "./Header";
import Navigation from "./Navigation";
import CreditBanner from "./CreditBanner";
import Footer from "./Footer";
import SignInModal from "../auth/SignInModal";
import GuestBanner from "./GuestBanner";
import MinimalHeader from "./MinimalHeader";
import { useAuth } from "../../context/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

const antdTheme = createAntdTheme(activeBrandConfig);

const legalLinks = ["Terms of Service", "Privacy Policy"];

function LegalStrip() {
  const config = activeBrandConfig;
  return (
    <div style={{ backgroundColor: config.primaryColor }}>
      <div className="max-w-content-wide mx-auto px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-2">
        <span className="text-xs text-gray-400">
          &copy; 2026 Retailer Portal
        </span>
        <div className="flex items-center gap-4">
          {legalLinks.map((link) => (
            <span
              key={link}
              className="text-xs text-gray-400 cursor-default hover:text-gray-300 transition-colors"
            >
              {link}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const isMinimalPage = pathname === "/sign-in";

  return (
    <ConfigProvider theme={antdTheme}>
      <div className="min-h-screen bg-white flex flex-col">
        {isMinimalPage ? (
          <MinimalHeader />
        ) : (
          <>
            {isAuthenticated ? <CreditBanner /> : <GuestBanner />}
            <Header />
            <Navigation />
          </>
        )}
        <main className="flex-1 flex flex-col">{children}</main>
        {isMinimalPage ? <LegalStrip /> : <Footer />}
        <SignInModal />
      </div>
    </ConfigProvider>
  );
}
