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
import DashboardPage from "./pages/DashboardPage";
import BusinessProfilePage from "./pages/BusinessProfilePage";
import PurchaseOrderDetailPage from "./pages/PurchaseOrderDetailPage";
import SettingsPage from "./pages/SettingsPage";
import ToastProvider from "./components/toast/ToastProvider";
import CreditOverviewPage from "./pages/CreditOverviewPage";
import InvoicesPage from "./pages/InvoicesPage";
import InvoiceDetailPage from "./pages/InvoiceDetailPage";
import SupportPageWrapper from "./pages/SupportPageWrapper";
import TicketDetailPage from "./pages/TicketDetailPage";
import ReturnsPage from "./pages/ReturnsPage";
import CreateReturnPage from "./pages/CreateReturnPage";
import ClaimDetailPage from "./pages/ClaimDetailPage";
import SchemesPage from "./pages/SchemesPage";
import SchemeDetailPage from "./pages/SchemeDetailPage";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AntApp>
        <AuthProvider>
        <ToastProvider>
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
              <Route path="/purchase-orders/:orderId" element={<AuthGate message="Sign in to view order details."><PurchaseOrderDetailPage /></AuthGate>} />
              <Route path="/account/credit" element={<AuthGate message="Sign in to view your credit history and financial details."><CreditOverviewPage /></AuthGate>} />
              <Route path="/account/invoices" element={<AuthGate message="Sign in to access your invoices."><InvoicesPage /></AuthGate>} />
              <Route path="/account/invoices/:invoiceId" element={<AuthGate message="Sign in to view invoice details."><InvoiceDetailPage /></AuthGate>} />
              <Route path="/account/returns" element={<AuthGate message="Sign in to manage returns and claims."><ReturnsPage /></AuthGate>} />
              <Route path="/account/returns/new" element={<AuthGate message="Sign in to create a return."><CreateReturnPage /></AuthGate>} />
              <Route path="/account/returns/:claimId" element={<AuthGate message="Sign in to view claim details."><ClaimDetailPage /></AuthGate>} />
              <Route path="/account/support" element={<AuthGate message="Sign in to access customer support."><SupportPageWrapper /></AuthGate>} />
              <Route path="/account/support/:ticketId" element={<AuthGate message="Sign in to view ticket details."><TicketDetailPage /></AuthGate>} />
              <Route path="/account/details" element={<AuthGate message="Sign in to access your account."><DashboardPage /></AuthGate>} />
              <Route path="/account/business-profile" element={<AuthGate message="Sign in to view your business profile."><BusinessProfilePage /></AuthGate>} />
              <Route path="/account/settings" element={<AuthGate message="Sign in to access your account settings."><SettingsPage /></AuthGate>} />
              <Route path="/account/schemes" element={<AuthGate message="Sign in to view schemes and promotions."><SchemesPage /></AuthGate>} />
              <Route path="/account/schemes/:schemeId" element={<AuthGate message="Sign in to view scheme details."><SchemeDetailPage /></AuthGate>} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Layout>
          </BrowserRouter>
        </OrderProvider>
        </OrderHistoryProvider>
        </ToastProvider>
        </AuthProvider>
      </AntApp>
    </QueryClientProvider>
  );
}
