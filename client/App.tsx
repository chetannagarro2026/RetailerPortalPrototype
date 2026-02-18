import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App as AntApp } from "antd";
import { OrderProvider } from "./context/OrderContext";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import PlaceholderPage from "./pages/PlaceholderPage";
import BulkOrder from "./pages/BulkOrder";
import CatalogNodePage from "./pages/CatalogNodePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AntApp>
        <OrderProvider>
          <BrowserRouter>
          <Layout>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/collections" element={<PlaceholderPage />} />
              <Route path="/catalog" element={<CatalogNodePage />} />
              <Route path="/catalog/*" element={<CatalogNodePage />} />
              <Route path="/product/:productId" element={<ProductDetailPage />} />
              <Route path="/brands" element={<PlaceholderPage />} />
              <Route path="/bulk-order" element={<BulkOrder />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/checkout" element={<CheckoutPage />} />
              <Route path="/order-confirmation" element={<OrderConfirmation />} />
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
        </OrderProvider>
      </AntApp>
    </QueryClientProvider>
  );
}
