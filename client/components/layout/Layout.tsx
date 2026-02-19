import { ConfigProvider } from "antd";
import { activeBrandConfig } from "../../config/brandConfig";
import { createAntdTheme } from "../../theme/antdTheme";
import Header from "./Header";
import Navigation from "./Navigation";
import CreditBanner from "./CreditBanner";
import Footer from "./Footer";
import SignInModal from "../auth/SignInModal";
import GuestBanner from "./GuestBanner";
import { useAuth } from "../../context/AuthContext";

interface LayoutProps {
  children: React.ReactNode;
}

const antdTheme = createAntdTheme(activeBrandConfig);

export default function Layout({ children }: LayoutProps) {
  const { isAuthenticated } = useAuth();

  return (
    <ConfigProvider theme={antdTheme}>
      <div className="min-h-screen bg-white">
        {isAuthenticated ? <CreditBanner /> : <GuestBanner />}
        <Header />
        <Navigation />
        <main>{children}</main>
        <Footer />
        <SignInModal />
      </div>
    </ConfigProvider>
  );
}
