import apiClient from '@/lib/apiClient';

// Enums from the API specification (ĐÃ CHỈNH KHỚP BACKEND)
export enum DiscountType {
  PERCENT = 'PERCENT',
  FIXED = 'FIXED',
}

export enum AppliesTo {
  CAR = "CAR",
  CATEGORY = "CATEGORY",
  BRAND = "BRAND",
  GLOBAL = "GLOBAL"
}

// Interfaces based on the API specification
export interface Promotion {
  promotionId: number;
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  startAt: string; // ISO 8601 format
  endAt: string; // ISO 8601 format
  active: boolean;
  appliesTo: AppliesTo;
  targetCategories?: string[];
  targetBrands?: string[];
  targetCarIds?: number[];
}

export interface PromotionRequest {
  title: string;
  description: string;
  discountType: DiscountType;
  discountValue: number;
  startAt: string;
  endAt: string;
  active: boolean;
  appliesTo: AppliesTo;
  targetCategories?: string[];
  targetBrands?: string[];
  targetCarIds?: number[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

class PromotionService {
  async getAllPromotions(): Promise<Promotion[]> {
    const response = await apiClient.get<ApiResponse<Promotion[]>>('/promotions/active');
    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải danh sách khuyến mãi');
    }
  }

  async createPromotion(promotionData: PromotionRequest): Promise<Promotion> {
    const response = await apiClient.post<ApiResponse<Promotion>>('/promotions', promotionData);
    if (response.data.code === 200 || response.data.code === 201) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tạo khuyến mãi');
    }
  }

  async updatePromotion(promotionId: number, promotionData: PromotionRequest): Promise<Promotion> {
    const response = await apiClient.put<ApiResponse<Promotion>>(`/promotions/${promotionId}`, promotionData);
    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi cập nhật khuyến mãi');
    }
  }

  async deletePromotion(promotionId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/promotions/${promotionId}`);
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Lỗi khi xóa khuyến mãi');
    }
  }
}

export default new PromotionService();
