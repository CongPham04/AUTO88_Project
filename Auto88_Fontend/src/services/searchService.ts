import apiClient from '@/lib/apiClient';

class SearchService {
  async searchCars(params: {
    keyword?: string;
    brand?: string;
    category?: string;
    color?: string;
    priceMin?: number;
    priceMax?: number;
    yearFrom?: number;
    yearTo?: number;
  }) {
    // ✅ URL mới: /cars/search
    const response = await apiClient.get('/cars/search', { params });
    return response.data;
  }
}

export default new SearchService();