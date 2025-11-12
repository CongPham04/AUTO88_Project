import apiClient, { BASE_URL } from '@/lib/apiClient';
// Enums
export enum Brand {
  TOYOTA = 'TOYOTA',
  HYUNDAI = 'HYUNDAI',
  MERCEDES = 'MERCEDES',
  VINFAST = 'VINFAST',
}

export enum Category {
  SUV = 'SUV',
  SEDAN = 'SEDAN',
  HATCHBACK = 'HATCHBACK',
}

export enum Color {
  BLACK = 'BLACK',
  WHITE = 'WHITE',
  SILVER = 'SILVER',
  GRAY = 'GRAY',
  RED = 'RED',
  BLUE = 'BLUE',
}

export type CarStatus = 'AVAILABLE' | 'SOLD';

// Car Interfaces
export interface CarResponse {
  carId: number;
  brand: Brand;
  category: Category;
  model: string;
  manufactureYear: number;
  price: number;
  color: Color;
  description: string;
  status: CarStatus;
  imageUrl: string;
}

export interface CarRequest {
  brand: Brand;
  category: Category;
  model: string;
  manufactureYear: number;
  price: number;
  color: Color;
  description: string;
  status: CarStatus;
  imageFile?: File;
}

// CarDetail Interfaces
export interface CarDetailResponse {
  carDetailId: number;
  carId: number;
  engine: string;
  horsepower: number;
  torque: number;
  transmission: string;
  fuelType: string;
  fuelConsumption: number;
  seats: number;
  weight: number;
  dimensions: string;
}

export interface CarDetailRequest {
  engine: string;
  horsepower: number;
  torque: number;
  transmission: string;
  fuelType: string;
  fuelConsumption: number;
  seats: number;
  weight: number;
  dimensions: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

class CarService {
  // ==================== Car CRUD Operations ====================

  /**
   * Get all cars
   */
  async getAllCars(): Promise<CarResponse[]> {
    const response = await apiClient.get<ApiResponse<CarResponse[]>>('/cars');

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải danh sách xe');
    }
  }

  /**
   * Get car by ID
   */
  async getCarById(carId: number): Promise<CarResponse> {
    const response = await apiClient.get<ApiResponse<CarResponse>>(
      `/cars/${carId}`
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải thông tin xe');
    }
  }

  /**
   * Get cars by brand
   */
  async getCarsByBrand(brand: Brand): Promise<CarResponse[]> {
    const response = await apiClient.get<ApiResponse<CarResponse[]>>(
      `/cars/brand/${brand}`
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải danh sách xe theo hãng');
    }
  }

  /**
   * Get cars by category
   */
  async getCarsByCategory(category: Category): Promise<CarResponse[]> {
    const response = await apiClient.get<ApiResponse<CarResponse[]>>(
      `/cars/category/${category}`
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải danh sách xe theo loại');
    }
  }

  /**
   * Create new car
   */
  async createCar(carData: CarRequest): Promise<void> {
    const formData = new FormData();
    formData.append('brand', carData.brand);
    formData.append('category', carData.category);
    formData.append('model', carData.model);
    formData.append('manufactureYear', carData.manufactureYear.toString());
    formData.append('price', carData.price.toString());
    formData.append('color', carData.color);
    formData.append('description', carData.description);
    formData.append('status', carData.status);

    if (carData.imageFile) {
      formData.append('imageFile', carData.imageFile);
    }

    console.log('Creating car with data:', {
      brand: carData.brand,
      category: carData.category,
      model: carData.model,
      manufactureYear: carData.manufactureYear,
      price: carData.price,
      color: carData.color,
      status: carData.status,
      hasImage: !!carData.imageFile,
    });

    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/cars',
        formData
      );

      console.log('Create car response:', response.data);

      if (response.data.code !== 200 && response.data.code !== 201) {
        throw new Error(response.data.message || 'Lỗi khi tạo xe mới');
      }
    } catch (error: any) {
      console.error('Create car error:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      });
      throw error;
    }
  }

  /**
   * Update car
   */
  async updateCar(carId: number, carData: CarRequest): Promise<void> {
    const formData = new FormData();
    formData.append('brand', carData.brand);
    formData.append('category', carData.category);
    formData.append('model', carData.model);
    formData.append('manufactureYear', carData.manufactureYear.toString());
    formData.append('price', carData.price.toString());
    formData.append('color', carData.color);
    formData.append('description', carData.description);
    formData.append('status', carData.status);

    if (carData.imageFile) {
      formData.append('imageFile', carData.imageFile);
    }

    console.log('Updating car with data:', {
      carId,
      brand: carData.brand,
      category: carData.category,
      model: carData.model,
      hasNewImage: !!carData.imageFile,
    });

    const response = await apiClient.put<ApiResponse<void>>(
      `/cars/${carId}`,
      formData
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Lỗi khi cập nhật xe');
    }
  }

  /**
   * Delete car
   */
  async deleteCar(carId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/cars/${carId}`
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Lỗi khi xóa xe');
    }
  }

  // ==================== CarDetail CRUD Operations ====================

  /**
   * Get all car details
   */
  async getAllCarDetails(): Promise<CarDetailResponse[]> {
    const response = await apiClient.get<ApiResponse<CarDetailResponse[]>>(
      '/car-details'
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải danh sách chi tiết xe');
    }
  }

  /**
   * Get car detail by Car ID
   */
  async getCarDetailByCarId(carId: number): Promise<CarDetailResponse> {
    const response = await apiClient.get<ApiResponse<CarDetailResponse>>(
      `/car-details/car/${carId}`
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải chi tiết xe');
    }
  }

  /**
   * @deprecated Use getCarDetailByCarId instead
   * Get car detail by ID
   */
  async getCarDetailById(carDetailId: number): Promise<CarDetailResponse> {
    const response = await apiClient.get<ApiResponse<CarDetailResponse>>(
      `/car-details/${carDetailId}`
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải chi tiết xe');
    }
  }

  /**
   * Create car detail for a car
   */
  async createCarDetail(
    carId: number,
    detailData: CarDetailRequest
  ): Promise<void> {
    console.log('Creating car detail for carId:', carId, detailData);

    const response = await apiClient.post<ApiResponse<void>>(
      `/car-details/${carId}`,
      detailData
    );

    if (response.data.code !== 200 && response.data.code !== 201) {
      throw new Error(response.data.message || 'Lỗi khi tạo chi tiết xe');
    }
  }

  /**
   * Update car detail
   */
  async updateCarDetail(
    carDetailId: number,
    detailData: CarDetailRequest
  ): Promise<void> {
    console.log('Updating car detail:', carDetailId, detailData);

    const response = await apiClient.put<ApiResponse<void>>(
      `/car-details/${carDetailId}`,
      detailData
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Lỗi khi cập nhật chi tiết xe');
    }
  }

  /**
   * Delete car detail
   */
  async deleteCarDetail(carDetailId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/car-details/${carDetailId}`
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Lỗi khi xóa chi tiết xe');
    }
  }

  /**
   * Get all cars for promotion selection
   */
  async getAllCarsForPromotion(): Promise<CarResponse[]> {
    const response = await apiClient.get<ApiResponse<CarResponse[]>>('/cars');

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi tải danh sách xe');
    }
  }

  /**
   * Get all cars by brand and category
   */
  async getCarsByBrandAndCategory(brand?: string, category?: string): Promise<CarResponse[]> {
    let url = '/cars';
    if (brand && category) {
      url = `/cars/brand/${brand}/category/${category}`;
    } else if (brand) {
      url = `/cars/brand/${brand}`;
    } else if (category) {
      url = `/cars/category/${category}`;
    }

    const response = await apiClient.get<ApiResponse<CarResponse[]>>(url);

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Lỗi khi lọc xe');
    }
  }

  /**
   * Get image URL for a car
   */
  getImageUrl(filename: string): string {
    return `${BASE_URL}/cars/image/${filename}`;
  }
}

export default new CarService();
