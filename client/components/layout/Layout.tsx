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

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();
  const { pathname } = useLocation();
  const isMinimalPage = pathname === "/sign-in";

  return (
    <ConfigProvider theme={antdTheme}>
      <div className="min-h-screen bg-white">
        {isMinimalPage ? (
          <MinimalHeader />
        ) : (
          <>
            {isAuthenticated ? <CreditBanner /> : <GuestBanner />}
            <Header />
            <Navigation />
          </>
        )}
        <main>{children}</main>
        {!isMinimalPage && <Footer />}
        <SignInModal />
      </div>
    </ConfigProvider>
  );
}
