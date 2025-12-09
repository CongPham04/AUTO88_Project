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
  // Thêm các màu khác nếu backend hỗ trợ
  GREEN = 'GREEN',
  YELLOW = 'YELLOW',
  ORANGE = 'ORANGE',
  BROWN = 'BROWN',
}

// [THÊM MỚI] Bảng ánh xạ màu sắc sang tiếng Việt
export const ColorMap: Record<Color, string> = {
  [Color.BLACK]: 'Đen',
  [Color.WHITE]: 'Trắng',
  [Color.SILVER]: 'Bạc',
  [Color.GRAY]: 'Xám',
  [Color.RED]: 'Đỏ',
  [Color.BLUE]: 'Xanh dương',
  [Color.GREEN]: 'Xanh lá',
  [Color.YELLOW]: 'Vàng',
  [Color.ORANGE]: 'Cam',
  [Color.BROWN]: 'Nâu',
};

// [THÊM MỚI] Hàm helper lấy tên tiếng Việt
export const getColorName = (color: Color | string): string => {
  return ColorMap[color as Color] || color;
};

export type CarStatus = 'AVAILABLE' | 'SOLD';

// 1. Định nghĩa Interface cho Chi tiết xe (Dùng chung cho Request & Response)
export interface CarDetail {
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

// 2. Định nghĩa Interface Response (Nhận từ Backend)
export interface CarResponse {
  carId: number;
  brand: Brand;
  category: Category;
  model: string;
  manufactureYear: number;
  price: number;
  description: string;
  status: CarStatus;

  // ✅ Các trường MỚI
  quantity: number;
  soldQuantity: number;
  colors: Color[];       // Mảng màu
  imageUrls: string[];   // Mảng link ảnh từ server
  detail?: CarDetail;    // Chi tiết xe đi kèm (nếu có)

  // ✅ Giữ lại để tương thích code cũ (nếu code cũ dùng .imageUrl)
  imageUrl?: string;
  color?: Color; // Giữ lại để tương thích code cũ (lấy màu đầu tiên)
}

// 3. Định nghĩa Interface Request (Gửi lên Backend)
export interface CarRequest {
  brand: Brand;
  category: Category;
  model: string;
  manufactureYear: number;
  price: number;
  description: string;

  // ✅ Các trường MỚI
  quantity: number;
  colors: Color[];         // Chọn nhiều màu
  imageFiles?: File[];     // Upload nhiều ảnh (thay thế imageFile đơn lẻ)
  detail: CarDetail;       // Chi tiết xe lồng ghép

  // ✅ Giữ lại để tương thích code cũ (nếu cần)
  status?: CarStatus;
  imageFile?: File; // Deprecated: dùng imageFiles thay thế
  color?: Color;    // Deprecated: dùng colors thay thế
}

// Interface Response Wrapper
export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}


// Interface riêng cho Detail Response (để dùng cho các hàm getDetail lẻ)
export interface CarDetailResponse extends CarDetail {
  carDetailId: number;
  carId: number;
}

class CarService {
  // ==================== Car CRUD Operations ====================

  async getAllCars(): Promise<CarResponse[]> {
    const response = await apiClient.get<ApiResponse<CarResponse[]>>('/cars');
    if (response.data.code === 200) {
      // Map dữ liệu để tương thích ngược với các component cũ
      return response.data.data.map(car => ({
        ...car,
        // Nếu có imageUrls -> lấy cái đầu tiên làm đại diện. Nếu không có -> chuỗi rỗng
        imageUrl: car.imageUrls && car.imageUrls.length > 0 ? car.imageUrls[0] : '',
        // Nếu có colors -> lấy cái đầu tiên. Nếu không -> mặc định BLACK
        color: car.colors && car.colors.length > 0 ? car.colors[0] : Color.BLACK
      }));
    }
    throw new Error(response.data.message || 'Lỗi khi tải danh sách xe');
  }

  async getCarById(carId: number): Promise<CarResponse> {
    const response = await apiClient.get<ApiResponse<CarResponse>>(`/cars/${carId}`);
    if (response.data.code === 200) {
      const car = response.data.data;
      return {
        ...car,
        imageUrl: car.imageUrls && car.imageUrls.length > 0 ? car.imageUrls[0] : '',
        color: car.colors && car.colors.length > 0 ? car.colors[0] : Color.BLACK
      };
    }
    throw new Error(response.data.message || 'Lỗi khi tải thông tin xe');
  }

  // --- HÀM TẠO XE (Unified) ---
  async createCar(carData: CarRequest): Promise<void> {
    const formData = new FormData();

    // 1. Basic Info
    formData.append('brand', carData.brand);
    formData.append('category', carData.category);
    formData.append('model', carData.model);
    formData.append('manufactureYear', carData.manufactureYear.toString());
    formData.append('price', carData.price.toString());
    formData.append('description', carData.description || '');

    // 2. Quantity & Colors
    formData.append('quantity', carData.quantity.toString());

    // Gửi mảng màu
    if (carData.colors && carData.colors.length > 0) {
      carData.colors.forEach(color => {
        formData.append('colors', color);
      });
    }

    // 3. Details (Dot Notation)
    if (carData.detail) {
      formData.append('detail.engine', carData.detail.engine);
      formData.append('detail.horsepower', carData.detail.horsepower.toString());
      formData.append('detail.torque', carData.detail.torque.toString());
      formData.append('detail.transmission', carData.detail.transmission);
      formData.append('detail.fuelType', carData.detail.fuelType);
      formData.append('detail.fuelConsumption', carData.detail.fuelConsumption.toString());
      formData.append('detail.seats', carData.detail.seats.toString());
      formData.append('detail.weight', carData.detail.weight.toString());
      formData.append('detail.dimensions', carData.detail.dimensions);
    }

    // 4. Multiple Images
    if (carData.imageFiles && carData.imageFiles.length > 0) {
      carData.imageFiles.forEach((file) => {
        formData.append('imageFiles', file);
      });
    }

    const response = await apiClient.post<ApiResponse<void>>('/cars', formData);
    if (response.data.code !== 200 && response.data.code !== 201) {
      throw new Error(response.data.message || 'Lỗi khi tạo xe mới');
    }
  }

  // --- HÀM UPDATE XE (Unified) ---
  async updateCar(carId: number, carData: CarRequest): Promise<void> {
    const formData = new FormData();

    formData.append('brand', carData.brand);
    formData.append('category', carData.category);
    formData.append('model', carData.model);
    formData.append('manufactureYear', carData.manufactureYear.toString());
    formData.append('price', carData.price.toString());
    formData.append('description', carData.description || '');

    formData.append('quantity', carData.quantity.toString());

    if (carData.colors && carData.colors.length > 0) {
      carData.colors.forEach(color => formData.append('colors', color));
    }

    if (carData.detail) {
      formData.append('detail.engine', carData.detail.engine);
      formData.append('detail.horsepower', carData.detail.horsepower.toString());
      formData.append('detail.torque', carData.detail.torque.toString());
      formData.append('detail.transmission', carData.detail.transmission);
      formData.append('detail.fuelType', carData.detail.fuelType);
      formData.append('detail.fuelConsumption', carData.detail.fuelConsumption.toString());
      formData.append('detail.seats', carData.detail.seats.toString());
      formData.append('detail.weight', carData.detail.weight.toString());
      formData.append('detail.dimensions', carData.detail.dimensions);
    }

    if (carData.imageFiles && carData.imageFiles.length > 0) {
      carData.imageFiles.forEach((file) => {
        formData.append('imageFiles', file);
      });
    }

    const response = await apiClient.put<ApiResponse<void>>(`/cars/${carId}`, formData);
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Lỗi khi cập nhật xe');
    }
  }

  async deleteCar(carId: number): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/cars/${carId}`);
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Lỗi khi xóa xe');
    }
  }

  // ==================== Helper Methods & Other APIs ====================
  // Giữ lại các hàm cũ để tránh lỗi ở các file khác dùng chúng

  async getCarsByBrand(brand: Brand): Promise<CarResponse[]> {
    const response = await apiClient.get<ApiResponse<CarResponse[]>>(`/cars/brand/${brand}`);
    if (response.data.code === 200) return this.mapResponse(response.data.data);
    throw new Error(response.data.message);
  }

  async getCarsByCategory(category: Category): Promise<CarResponse[]> {
    const response = await apiClient.get<ApiResponse<CarResponse[]>>(`/cars/category/${category}`);
    if (response.data.code === 200) return this.mapResponse(response.data.data);
    throw new Error(response.data.message);
  }

  // Helper để map dữ liệu cũ/mới
  private mapResponse(cars: CarResponse[]): CarResponse[] {
    return cars.map(car => ({
      ...car,
      imageUrl: car.imageUrls && car.imageUrls.length > 0 ? car.imageUrls[0] : '',
      color: car.colors && car.colors.length > 0 ? car.colors[0] : Color.BLACK
    }));
  }

  async getCarDetailByCarId(carId: number): Promise<CarDetailResponse> {
    const response = await apiClient.get<ApiResponse<CarDetailResponse>>(`/cars/${carId}/details`);
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message);
  }

  // Hàm helper lấy URL ảnh
  getImageUrl(filename: string): string {
    // Nếu chuỗi đã là http -> trả về luôn
    if (filename.startsWith('http://') || filename.startsWith('https://')) {
      return filename;
    }
    // Nếu chỉ là tên file -> ghép link API
    return `${BASE_URL}/cars/image/${filename}`;
  }
}

export default new CarService();