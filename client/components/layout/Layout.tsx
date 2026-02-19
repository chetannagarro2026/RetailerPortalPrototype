import { ConfigProvider } from "antd";
import { useQuery } from "@tanstack/react-query";
import { activeBrandConfig } from "../../config/brandConfig";
import { createAntdTheme } from "../../theme/antdTheme";
import { fetchCategoriesByParent } from "../../services/categoryService";
import Header from "./Header";
import Navigation from "./Navigation";
import CreditBanner from "./CreditBanner";

interface LayoutProps {
  children: React.ReactNode;
}

const antdTheme = createAntdTheme(activeBrandConfig);

export default function Layout({ children }: LayoutProps) {
  // Prefetch categories on mount so they're ready for MegaMenu
  const parentId = "08d6ff04-11c5-4e5b-a1c8-11ac167e849b";
  useQuery({
    queryKey: ["categories", parentId],
    queryFn: () => fetchCategoriesByParent(parentId),
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
  });
  return (
    <ConfigProvider theme={antdTheme}>
      <div className="min-h-screen bg-white">
        <CreditBanner />
        <Header />
        <Navigation />
        <main>{children}</main>
      </div>
    </ConfigProvider>
  );
}
