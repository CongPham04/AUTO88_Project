import apiClient from '@/lib/apiClient';

class MetaService {
  async getBrands(): Promise<string[]> {
    const res = await apiClient.get('/meta/brands');
    return res.data;
  }
  async getCategories(): Promise<string[]> {
    const res = await apiClient.get('/meta/categories');
    return res.data;
  }
  async getColors(): Promise<string[]> {
    const res = await apiClient.get('/meta/colors');
    return res.data;
  }
}

export default new MetaService();
