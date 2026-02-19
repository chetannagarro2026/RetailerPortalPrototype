import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { App as AntApp } from "antd";
import { AuthProvider } from "./context/AuthContext";
import { OrderProvider } from "./context/OrderContext";
import { OrderHistoryProvider } from "./context/OrderHistoryContext";
import AuthGate from "./components/auth/AuthGate";
import ScrollToTop from "./components/layout/ScrollToTop";
import PurchaseOrdersPage from "./pages/PurchaseOrdersPage";
import Layout from "./components/layout/Layout";
import Index from "./pages/Index";
import PlaceholderPage from "./pages/PlaceholderPage";
import BulkOrder from "./pages/BulkOrder";
import CatalogNodePage from "./pages/CatalogNodePage";
import ProductDetailPage from "./pages/ProductDetailPage";
import SkuDetailPage from "./pages/SkuDetailPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import OrderConfirmation from "./pages/OrderConfirmation";
import NotFound from "./pages/NotFound";
import SignInPage from "./pages/SignInPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AntApp>
        <AuthProvider>
        <OrderHistoryProvider>
        <OrderProvider>
          <BrowserRouter>
          <ScrollToTop />
          <Layout>
            <Routes>
              {/* Public routes — accessible by guests */}
              <Route path="/" element={<Index />} />
              <Route path="/collections" element={<CatalogNodePage />} />
              <Route path="/catalog" element={<CatalogNodePage />} />
              <Route path="/catalog/*" element={<CatalogNodePage />} />
              <Route path="/product/:productId" element={<ProductDetailPage />} />
              <Route path="/product/:productId/sku/:variantId" element={<SkuDetailPage />} />
              <Route path="/bulk-order" element={<BulkOrder />} />
              <Route path="/cart" element={<CartPage />} />
              <Route path="/sign-in" element={<SignInPage />} />

              {/* Gated routes — require authentication */}
              <Route path="/checkout" element={<AuthGate message="To complete your purchase and use your credit account, please sign in."><CheckoutPage /></AuthGate>} />
              <Route path="/order-confirmation" element={<AuthGate><OrderConfirmation /></AuthGate>} />
              <Route path="/purchase-orders" element={<AuthGate message="Sign in to view your purchase orders and order history."><PurchaseOrdersPage /></AuthGate>} />
              <Route path="/account/credit" element={<AuthGate message="Sign in to view your credit history and financial details."><PlaceholderPage /></AuthGate>} />
              <Route path="/account/invoices" element={<AuthGate message="Sign in to access your invoices."><PlaceholderPage /></AuthGate>} />
              <Route path="/account/payments" element={<AuthGate message="Sign in to manage your payments."><PlaceholderPage /></AuthGate>} />
              <Route path="/account/payment-history" element={<AuthGate message="Sign in to view your payment history."><PlaceholderPage /></AuthGate>} />
              <Route path="/account/returns" element={<AuthGate message="Sign in to manage returns and claims."><PlaceholderPage /></AuthGate>} />
              <Route path="/account/support" element={<AuthGate message="Sign in to access customer service."><PlaceholderPage /></AuthGate>} />
              <Route path="/account/details" element={<AuthGate message="Sign in to view your account details."><PlaceholderPage /></AuthGate>} />
              <Route path="/account/settings" element={<AuthGate message="Sign in to access your account settings."><PlaceholderPage /></AuthGate>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          </BrowserRouter>
        </OrderProvider>
        </OrderHistoryProvider>
        </AuthProvider>
      </AntApp>
    </QueryClientProvider>
  );
}