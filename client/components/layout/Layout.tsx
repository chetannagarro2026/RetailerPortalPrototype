import { ConfigProvider } from "antd";
import { activeBrandConfig } from "../../config/brandConfig";
import { createAntdTheme } from "../../theme/antdTheme";
import Header from "./Header";
import Navigation from "./Navigation";

interface LayoutProps {
  children: React.ReactNode;
}

const antdTheme = createAntdTheme(activeBrandConfig);

export default function Layout({ children }: LayoutProps) {
  return (
    <ConfigProvider theme={antdTheme}>
      <div className="min-h-screen bg-white">
        <Header />
        <Navigation />
        <main>{children}</main>
      </div>
    </ConfigProvider>
  );
}
