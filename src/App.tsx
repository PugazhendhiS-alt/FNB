import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AdminProvider } from "@/contexts/AdminContext";
import { CartProvider } from "@/contexts/CartContext";
import { CafeteriaProvider } from "@/contexts/CafeteriaAdminContext";
import { OrderProvider } from "@/contexts/OrderContext";
import { ProtectedAdminRoute } from "@/components/ProtectedAdminRoute";
import { RemoteSyncStatusBanner } from "@/components/RemoteSyncStatusBanner";
import AdminLoginPage from "./pages/AdminLoginPage.tsx";
import SuperAdminDashboardPage from "./pages/SuperAdminDashboardPage.tsx";
import RestaurantAdminDashboardPage from "./pages/RestaurantAdminDashboardPage.tsx";
import Index from "./pages/Index.tsx";
import BuildingPage from "./pages/BuildingPage.tsx";
import CafeteriaPage from "./pages/CafeteriaPage.tsx";
import CartPage from "./pages/CartPage.tsx";
import CheckoutPage from "./pages/CheckoutPage.tsx";
import OrdersPage from "./pages/OrdersPage.tsx";
import SearchPage from "./pages/SearchPage.tsx";
import ProfilePage from "./pages/ProfilePage.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AdminProvider>
        <CartProvider>
          <CafeteriaProvider>
            <OrderProvider>
              <Toaster />
              <Sonner />
              <RemoteSyncStatusBanner />
              <BrowserRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/building/:buildingId" element={<BuildingPage />} />
                <Route path="/cafeteria/:cafeteriaId" element={<CafeteriaPage />} />
                <Route path="/cart" element={<CartPage />} />
                <Route path="/checkout" element={<CheckoutPage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/orders" element={<OrdersPage />} />
                <Route path="/profile" element={<ProfilePage />} />

                {/* Admin Login */}
                <Route path="/login" element={<AdminLoginPage />} />
                <Route path="/admin/login" element={<AdminLoginPage />} />
                
                {/* SuperAdmin Routes */}
                <Route
                  path="/superadmin/dashboard"
                  element={
                    <ProtectedAdminRoute requiredRole="superadmin">
                      <SuperAdminDashboardPage />
                    </ProtectedAdminRoute>
                  }
                />
                
                {/* Restaurant Admin Routes */}
                <Route
                  path="/restaurant/dashboard"
                  element={
                    <ProtectedAdminRoute requiredRole="admin">
                      <RestaurantAdminDashboardPage />
                    </ProtectedAdminRoute>
                  }
                />
                
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </BrowserRouter>
          </OrderProvider>
        </CafeteriaProvider>
      </CartProvider>
    </AdminProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
