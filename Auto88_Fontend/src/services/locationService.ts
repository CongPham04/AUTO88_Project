import axios from 'axios';

const API_HOST = 'https://provinces.open-api.vn/api';

export interface LocationOption {
  code: number;
  name: string;
  districts?: LocationOption[];
  wards?: LocationOption[];
}

class LocationService {
  // 1. Lấy danh sách Tỉnh / Thành phố
  async getProvinces(): Promise<LocationOption[]> {
    try {
      const response = await axios.get(`${API_HOST}/?depth=1`);
      return response.data;
    } catch (error) {
      console.error('Lỗi lấy danh sách tỉnh:', error);
      return [];
    }
  }

  // 2. Lấy Quận / Huyện theo Code Tỉnh
  async getDistricts(provinceCode: number): Promise<LocationOption[]> {
    try {
      // depth=2: Lấy thông tin Tỉnh kèm mảng districts
      const response = await axios.get(`${API_HOST}/p/${provinceCode}?depth=2`);
      return response.data.districts || [];
    } catch (error) {
      console.error('Lỗi lấy danh sách huyện:', error);
      return [];
    }
  }

  // 3. Lấy Phường / Xã theo Code Huyện
  async getWards(districtCode: number): Promise<LocationOption[]> {
    try {
      // depth=2: Lấy thông tin Huyện kèm mảng wards
      const response = await axios.get(`${API_HOST}/d/${districtCode}?depth=2`);
      return response.data.wards || [];
    } catch (error) {
      console.error('Lỗi lấy danh sách xã:', error);
      return [];
    }
  }
}

export default new LocationService();