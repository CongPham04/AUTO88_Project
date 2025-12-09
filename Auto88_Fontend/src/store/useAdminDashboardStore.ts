import { create } from 'zustand';
import apiClient from '@/lib/apiClient';

// ==========================================
// 1. DEFINITIONS (TYPES) - Đặt ngay trong Store
// ==========================================

export interface StatMetric {
  value: number;
  growthPercent: number;
  isUp: boolean;
}

export interface DashboardStats {
  totalCars: StatMetric;
  monthlyOrders: StatMetric;
  newCustomers: StatMetric;
  monthlyRevenue: StatMetric;
}

export interface RevenueChartData {
  month: string;
  revenue: number;
}

export interface OrderStatusData {
  name: string;
  value: number;
  color: string;
}

export interface RecentOrderDto {
  orderId: string;
  customerName: string;
  carModel: string;
  date: string;
  status: string;
  total: number;
}

export interface LowStockCarDto {
  carId: number;
  model: string;
  stock: number;
}

export interface DashboardResponse {
  stats: DashboardStats;
  revenueChart: RevenueChartData[];
  orderStatusChart: OrderStatusData[];
  recentOrders: RecentOrderDto[];
  lowStockCars: LowStockCarDto[];
}

// ==========================================
// 2. STORE STATE & ACTIONS
// ==========================================

interface AdminDashboardState {
  data: DashboardResponse | null;
  isLoading: boolean;
  isError: boolean;
  
  // Actions
  fetchDashboardStats: () => Promise<void>;
  exportRevenueReport: () => Promise<void>;
}

export const useAdminDashboardStore = create<AdminDashboardState>((set) => ({
  data: null,
  isLoading: false,
  isError: false,

  fetchDashboardStats: async () => {
    set({ isLoading: true, isError: false });
    try {
      // Gọi trực tiếp API trong store
      const response = await apiClient.get<DashboardResponse>('/admin/stats/overview');
      set({ data: response.data, isLoading: false });
    } catch (error) {
      console.error("Lỗi tải dashboard:", error);
      set({ isError: true, isLoading: false });
    }
  },

  exportRevenueReport: async () => {
    // Giả lập logic export, sau này thay bằng API thật
    return new Promise((resolve) => setTimeout(resolve, 1500));
  }
}));