import React, { useEffect } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "sonner";
import { useUserStore } from "@/store/useUserStore";

// Import Layouts & Pages (Giữ nguyên import của bạn)
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout";
import HomePage from "@/pages/home/HomePage";
import CarListPage from "@/pages/cars/CarListPage";
import CarDetailsPage from "@/pages/cars/CarDetailsPage";
import CheckoutPage from "@/pages/order/CheckoutPage";
import UserProfile from "@/pages/user/UserProfile";
import AdminOverview from "@/pages/admin/AdminOverview";
import AdminCars from "@/pages/admin/AdminCars";
import CarFormPage from "@/pages/admin/cars/CarFormPage";
import CarDetailPage from "@/pages/admin/cars/CarDetailPage";
import AdminOrders from "@/pages/admin/AdminOrders";
import AdminOrderDetailPage from "@/pages/admin/orders/AdminOrderDetailPage";
import OrderEditPage from "@/pages/admin/orders/OrderEditPage";
import AdminUsers from "@/pages/admin/AdminUsers";
import AdminNews from "@/pages/admin/AdminNews";
import NewsFormPage from "@/pages/admin/news/NewsFormPage";
import AdminNewsDetail from "@/pages/admin/news/NewsDetailPage";
import AdminPromotions from "@/pages/admin/AdminPromotions";
import AdminPayments from "@/pages/admin/AdminPayments";
import AdminProfile from "@/pages/admin/AdminProfile";
import NewsDetailPage from "@/pages/news/NewsDetailPage";
import NewsPage from "@/pages/news/NewsPage";
import ComparisonPage from "@/pages/comparison/ComparisonPage";
import AuthPage from "@/pages/auth/AuthPage";
import OrderDetailPage from "@/pages/user/OrderDetailPage";
import ProtectedRoute from "@/components/ProtectedRoute";
import UserFormPage from "@/pages/admin/users/UserFormPage";
import UserDetailPage from "@/pages/admin/users/UserDetailPage";
import NotFoundPage from "@/pages/NotFoundPage";
import NotFoundPageAdmin from "@/pages/admin/NotFoundPageAdmin";

export default function App() {
  const initializeAuth = useUserStore((state) => state.initializeAuth);
  const location = useLocation();

  // ✅ Chạy 1 lần duy nhất khi F5 để lấy lại thông tin user từ Token
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  const isAuthRoute = location.pathname.startsWith('/auth');
  const background = location.state?.backgroundLocation || (isAuthRoute ? { pathname: '/' } : null);

  return (
    <>
      <Routes location={background || location}>
        {/* PUBLIC ROUTES */}
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="cars" element={<CarListPage />} />
          <Route path="cars/:id" element={<CarDetailsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="news/:id" element={<NewsDetailPage />} />
          <Route path="comparison" element={<ComparisonPage />} />

          {/* USER PROTECTED ROUTES */}
          <Route element={<ProtectedRoute />}>
            <Route path="order/checkout" element={<CheckoutPage />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="profile/orders/:orderId" element={<OrderDetailPage />} />
          </Route>

          <Route path="*" element={<NotFoundPage />} />
        </Route>

        {/* ADMIN PROTECTED ROUTES */}
        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="cars" element={<AdminCars />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="orders/view/:orderId" element={<AdminOrderDetailPage />} />
            <Route path="orders/edit/:orderId" element={<OrderEditPage />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="users/create" element={<UserFormPage mode="create" />} />
            <Route path="users/edit/:userId" element={<UserFormPage mode="edit" />} />
            <Route path="users/view/:userId" element={<UserDetailPage />} />
            <Route path="cars" element={<AdminCars />} />
            <Route path="cars/create" element={<CarFormPage mode="create" />} />
            <Route path="cars/edit/:carId" element={<CarFormPage mode="edit" />} />
            <Route path="cars/view/:carId" element={<CarDetailPage />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="news/create" element={<NewsFormPage mode="create" />} />
            <Route path="news/edit/:newsId" element={<NewsFormPage mode="edit" />} />
            <Route path="news/view/:newsId" element={<AdminNewsDetail />} />
            {/* <Route path="promotions" element={<AdminPromotions />} /> */}
            <Route path="payments" element={<AdminPayments />} />
            <Route path="profile" element={<AdminProfile />} />
            <Route path="*" element={<NotFoundPageAdmin />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFoundPageAdmin />} />

        {/* AUTH ROUTES (Fallback) */}
        <Route path="/auth/*" element={<AuthLayout />}>
          <Route path="*" element={<AuthPage />} />
          <Route path="verify" element={<AuthPage />} />
        </Route>
      </Routes>

      {/* MODAL ROUTES */}
      {background && (
        <Routes>
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<AuthPage />} />
            <Route path="login" element={<AuthPage />} />
            <Route path="register" element={<AuthPage />} />
            <Route path="forgot-password" element={<AuthPage />} />
            <Route path="verify" element={<AuthPage />} />
          </Route>
        </Routes>
      )}

      <Toaster position="top-right" richColors />
    </>
  );
}