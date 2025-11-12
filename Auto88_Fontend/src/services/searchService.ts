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
    const response = await apiClient.get('/search/cars', { params });
    return response.data;
  }
}

export default new SearchService();