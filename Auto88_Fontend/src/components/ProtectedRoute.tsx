// src/components/ProtectedRoute.tsx (Đã cập nhật)

import React from "react";
// [SỬA ĐỔI] Import thêm useLocation
import { Navigate, Outlet, useLocation } from "react-router-dom"; 
import { useAuthStore } from "@/store/useAuthStore";

const ProtectedRoute = () => {
  const token = useAuthStore((state) => state.token);
  
  // [SỬA ĐỔI] Chúng ta vẫn lấy location, nhưng không dùng nó trực tiếp
  const location = useLocation(); 

  if (!token) {
    // [SỬA ĐỔI]
    // Thay vì gửi `location` (là trang /order/checkout),
    // chúng ta tạo một đối tượng location mới chỉ trỏ về Trang chủ ('/').
    // Điều này "ép" App.tsx luôn dùng Trang chủ làm nền.
    return <Navigate 
              to="/auth" 
              state={{ backgroundLocation: { pathname: '/' } }} 
              replace 
           />;
  }

  // Có token thì render tiếp các route con
  return <Outlet />;
};

export default ProtectedRoute;