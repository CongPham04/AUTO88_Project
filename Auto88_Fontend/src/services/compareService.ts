import apiClient from '@/lib/apiClient';
import { CarResponse } from './carService';

class CompareService {
  async compareCars(ids: number[]): Promise<CarResponse[]> {
    const response = await apiClient.get<CarResponse[]>('/cars/compare', {
      params: { ids: ids.join(',') },
    });
    return response.data;
  }
}

export default new CompareService();
