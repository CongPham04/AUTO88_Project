import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom"; 
import { useUserStore } from "@/store/useUserStore";
import { Skeleton } from "@/components/ui/skeleton"; // ✅ Import Skeleton

const ProtectedRoute = () => {
  const { isAuthenticated, isInitializing } = useUserStore();
  const location = useLocation(); 

  // ✅ Màn hình chờ (Skeleton) khi đang F5 lấy lại phiên
  if (isInitializing) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header Skeleton */}
          <div className="mb-6"><Skeleton className="h-10 w-48" /></div>
          <div className="mb-8 space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>

          {/* Grid Layout Skeleton */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar Skeleton */}
            <div className="lg:col-span-1">
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 flex flex-col items-center space-y-4">
                <Skeleton className="w-20 h-20 rounded-full" />
                <Skeleton className="h-6 w-32" />
                <Skeleton className="h-4 w-48" />
                <Skeleton className="h-6 w-24 rounded-full" />
              </div>
            </div>

            {/* Content Skeleton */}
            <div className="lg:col-span-3 space-y-6">
              <div className="flex gap-2">
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
                <Skeleton className="h-10 w-32" />
              </div>
              <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100 space-y-6">
                <div className="flex justify-between items-center mb-4">
                  <Skeleton className="h-6 w-40" />
                  <Skeleton className="h-9 w-24" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                  <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                  <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                  <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-10 w-full" /></div>
                </div>
                <div className="space-y-2"><Skeleton className="h-4 w-20" /><Skeleton className="h-24 w-full" /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Nếu load xong mà không có user -> Redirect Login
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ backgroundLocation: { pathname: '/' } }} replace />;
  }

  // Load xong & Có user -> Cho vào trang con
  return <Outlet />;
};

export default ProtectedRoute;