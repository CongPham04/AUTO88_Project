import apiClient from '@/lib/apiClient';

// ✅ Cập nhật Type Status khớp với Backend
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'DELETED';
export type UserRole = 'USER' | 'ADMIN';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export interface UserResponse {
  userId: string;
  fullName: string;
  dob: string;
  gender: Gender;
  phone: string;
  address: string;
  avatarUrl: string;
  accountId: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
}

export interface CreateUserWithAccountRequest {
  email: string;
  password: string;
  fullName: string;
  phone: string;
  gender: Gender;
  dob: string;
  role: UserRole;
  address?: string;
  avatarFile?: File;
}

// ✅ Khôi phục trường password (optional) để Admin dùng
export interface UserUpdateRequest {
  userId: string;
  fullName?: string;
  dob?: string;
  gender?: Gender;
  phone?: string;
  address?: string;
  email: string;
  role: UserRole;
  status: AccountStatus;
  password?: string; // ✅ Thêm lại dòng này
}

// Interface cho API tìm kiếm
export interface UserSearchParams {
  keyword?: string;
  role?: string;
  status?: string;
}

// Interface cho API Đổi mật khẩu (User tự đổi)
export interface ChangePasswordRequest {
  oldPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

class UserService {
  async getAllUsers(): Promise<UserResponse[]> {
    const response = await apiClient.get<ApiResponse<UserResponse[]>>(`/users`);
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch users');
  }

  async searchUsers(params: UserSearchParams): Promise<UserResponse[]> {
    const cleanParams: any = {};
    if (params.keyword) cleanParams.keyword = params.keyword;
    if (params.role && params.role !== 'ALL') cleanParams.role = params.role;
    if (params.status && params.status !== 'ALL') cleanParams.status = params.status;

    const response = await apiClient.get<ApiResponse<UserResponse[]>>('/users/search', {
      params: cleanParams
    });

    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Failed to search users');
  }

  async getUserByEmail(email: string): Promise<UserResponse> {
    const response = await apiClient.get<ApiResponse<UserResponse>>(
      `/users/email/${email}`
    );
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch user');
  }

  async getUserById(userId: string): Promise<UserResponse> {
    const response = await apiClient.get<ApiResponse<UserResponse>>(`/users/${userId}`);
    if (response.data.code === 200) return response.data.data;
    throw new Error(response.data.message || 'Failed to fetch user');
  }

  async createUserWithAccount(userData: CreateUserWithAccountRequest): Promise<UserResponse> {
    const formData = new FormData();
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('fullName', userData.fullName);
    formData.append('phone', userData.phone);
    formData.append('gender', userData.gender);
    formData.append('dob', userData.dob);
    formData.append('role', userData.role);

    if (userData.address) formData.append('address', userData.address);
    if (userData.avatarFile) formData.append('avatarFile', userData.avatarFile);

    try {
      const response = await apiClient.post<ApiResponse<UserResponse>>(
        `/users/create-with-account`,
        formData
      );
      if (response.data.code === 201 || response.data.code === 200) return response.data.data;
      throw new Error(response.data.message || 'Failed to create user');
    } catch (error: any) {
      console.error('Create user error:', error.response?.data || error.message);
      if (error.response?.data?.errors) {
        throw new Error(error.response.data.errors.map((e: any) => e.message).join(', '));
      }
      throw new Error(error.response?.data?.message || 'Lỗi tạo tài khoản.');
    }
  }

  // ✅ Cập nhật hàm này để hỗ trợ cả Admin (có pass) và User (không pass)
  async updateUser(userId: string, userData: UserUpdateRequest, avatarFile?: File): Promise<void> {
    const formData = new FormData();
    
    // Vì các trường là Optional (?) nên PHẢI check tồn tại trước khi append
    if (userData.fullName) formData.append('fullName', userData.fullName);
    
    // Check dob
    if (userData.dob) formData.append('dob', userData.dob);
    
    // Check gender (Đã sửa lỗi gende -> gender)
    if (userData.gender) formData.append('gender', userData.gender);
    
    // Check phone
    if (userData.phone && userData.phone.trim() !== '') {
      formData.append('phone', userData.phone);
    } 
    
    // Check address
    if (userData.address) formData.append('address', userData.address);
    
    // Các trường bắt buộc trong Interface thì có thể append luôn (hoặc check cho an toàn)
    if (userData.email) formData.append('email', userData.email);
    if (userData.role) formData.append('role', userData.role);
    if (userData.status) formData.append('status', userData.status);

    // Password chỉ gửi nếu có nhập
    if (userData.password && userData.password.trim() !== '') {
      formData.append('password', userData.password);
    }

    if (avatarFile) {
      formData.append('avatarFile', avatarFile);
    }

    try {
      const response = await apiClient.put<ApiResponse<any>>(
        `/users/${userId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      if (response.data.code !== 200) throw new Error(response.data.message || 'Cập nhật thất bại');
      return;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi cập nhật người dùng.');
    }
  }

  // API Đổi mật khẩu (Dành riêng cho User tự đổi)
  async changePassword(data: ChangePasswordRequest): Promise<void> {
    try {
      const response = await apiClient.post<ApiResponse<void>>(
        '/users/change-password',
        data
      );
      if (response.data.code !== 200) throw new Error(response.data.message || 'Đổi mật khẩu thất bại');
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Lỗi đổi mật khẩu.');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(`/users/${userId}`);
    if (response.data.code !== 200) throw new Error(response.data.message || 'Failed to delete user');
  }
}

export default new UserService();