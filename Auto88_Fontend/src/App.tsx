// src/App.tsx (Đã cập nhật)

import React, { useEffect, useState } from "react";
import { Routes, Route, useLocation } from "react-router-dom"; 
import { Toaster } from "sonner";
import { useUserStore } from "@/store/userStore";

// Import tất cả Layouts và Pages
import MainLayout from "@/layouts/MainLayout";
import AdminLayout from "@/layouts/AdminLayout";
import AuthLayout from "@/layouts/AuthLayout";
import HomePage from "@/pages/home/HomePage";
import CarListPage from "@/pages/cars/CarListPage";
import CarDetailsPage from "@/pages/cars/CarDetailsPage";
import CheckoutPage from "@/pages/order/CheckoutPage";
import UserProfile from "@/pages/user/UserProfile";
import AdminProfile from '@/pages/admin/AdminProfile';
import AdminOverview from '@/pages/admin/AdminOverview';
import AdminCars from '@/pages/admin/AdminCars';
import AdminOrders from '@/pages/admin/AdminOrders';
import AdminUsers from '@/pages/admin/AdminUsers';
import AdminNews from '@/pages/admin/AdminNews';
import AdminPromotions from '@/pages/admin/AdminPromotions';
import AdminPayments from '@/pages/admin/AdminPayments';
import NewsDetailPage from "@/pages/news/NewsDetailPage";
import NewsPage from "@/pages/news/NewsPage";
import ComparisonPage from "@/pages/comparison/ComparisonPage";
import AuthPage from "@/pages/auth/AuthPage";
import OrderDetailPage from "@/pages/user/OrderDetailPage";
import ProtectedRoute from "@/components/ProtectedRoute"; 

// [THÊM MỚI] Import trang 404
import NotFoundPage from "@/pages/NotFoundPage";

export default function App() {
  const initializeAuth = useUserStore((state) => state.initializeAuth);
  const location = useLocation(); 

  const backgroundLocation = location.state?.backgroundLocation;

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return (
    <>
      {/* PHẦN 1: Các trang chính */}
      <Routes location={backgroundLocation || location}>
        <Route path="/" element={<MainLayout />}>
          <Route index element={<HomePage />} />
          <Route path="cars" element={<CarListPage />} />
          <Route path="cars/:id" element={<CarDetailsPage />} />
          <Route path="news" element={<NewsPage />} />
          <Route path="news/:id" element={<NewsDetailPage />} />
          <Route path="comparison" element={<ComparisonPage />} />

          <Route element={<ProtectedRoute />}>
            <Route path="order/checkout" element={<CheckoutPage />} />
            <Route path="profile" element={<UserProfile />} />
            <Route path="profile/orders/:orderId" element={<OrderDetailPage />} />
          </Route>

          {/* [THÊM MỚI] Route 404 cho các trang layout chính */}
          <Route path="*" element={<NotFoundPage />} />
        </Route>

        <Route path="/admin" element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route index element={<AdminOverview />} />
            <Route path="overview" element={<AdminOverview />} />
            <Route path="cars" element={<AdminCars />} />
            <Route path="orders" element={<AdminOrders />} />
            <Route path="users" element={<AdminUsers />} />
            <Route path="news" element={<AdminNews />} />
            <Route path="promotions" element={<AdminPromotions />} />
            <Route path="payments" element={<AdminPayments />} />
            <Route path="profile" element={<AdminProfile />} />

            {/* [THÊM MỚI] Route 404 cho các trang admin */}
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Route>

        {/* [THÊM MỚI] Route 404 cho URL không khớp với bất cứ layout nào */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>

      {/* PHẦN 2: Modal Route */}
      {backgroundLocation && (
        <Routes>
          <Route path="/auth" element={<AuthLayout />}>
            <Route index element={<AuthPage />} />
          </Route>
        </Routes>
      )}

      <Toaster position="top-right" richColors />
    </>
  );
}