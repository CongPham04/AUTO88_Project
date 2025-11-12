import apiClient from '@/lib/apiClient';

class HomeService {
  async getHomeSections() {
    const res = await apiClient.get('/home/sections');
    return res.data;
  }
}

export default new HomeService();