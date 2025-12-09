// src/services/adminService.ts
import apiClient from "@/lib/apiClient";
import { DashboardResponse } from "@/store/useAdminDashboardStore";

export const getAdminDashboardStats = async (): Promise<DashboardResponse> => {
  const response = await apiClient.get<DashboardResponse>("/admin/stats/overview");
  return response.data;
};

// Hàm xuất báo cáo (Giữ lại logic cũ hoặc gọi API nếu sau này backend có)
export const exportRevenueReport = async () => {
  // Giả lập gọi API xuất Excel
  return new Promise((resolve) => setTimeout(resolve, 1500));
};