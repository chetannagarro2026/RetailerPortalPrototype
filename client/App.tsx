import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App as AntdApp } from "antd";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import PlaceholderPage from "./pages/PlaceholderPage";
import BulkOrder from "./pages/BulkOrder";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import { AuthProvider } from "./contexts/AuthContext";
import { OrderProvider } from "./context/OrderContext";
import { OrderHistoryProvider } from "./context/OrderHistoryContext";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AntdApp>
          <OrderProvider>
            <OrderHistoryProvider>
              <BrowserRouter>
                <Layout>
                  <Routes>
                  <Route path="/" element={<Index />} />
                  <Route path="/collections" element={<PlaceholderPage />} />
                  <Route path="/brands" element={<PlaceholderPage />} />
                  <Route path="/bulk-order" element={<BulkOrder />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/purchase-orders" element={<PlaceholderPage />} />
                  <Route path="/account/credit" element={<PlaceholderPage />} />
                  <Route path="/account/invoices" element={<PlaceholderPage />} />
                  <Route path="/account/payments" element={<PlaceholderPage />} />
                  <Route path="/account/payment-history" element={<PlaceholderPage />} />
                  <Route path="/account/returns" element={<PlaceholderPage />} />
                  <Route path="/account/support" element={<PlaceholderPage />} />
                  <Route path="/account/details" element={<PlaceholderPage />} />
                  <Route path="/account/settings" element={<PlaceholderPage />} />
                  {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                  <Route path="*" element={<NotFound />} />
                  </Routes>
                </Layout>
              </BrowserRouter>
            </OrderHistoryProvider>
          </OrderProvider>
        </AntdApp>
      </AuthProvider>
    </QueryClientProvider>
  );
}
