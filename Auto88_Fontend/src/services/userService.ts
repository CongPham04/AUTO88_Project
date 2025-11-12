import apiClient from '@/lib/apiClient';

export interface UserResponse {
  userId: string;
  fullName: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  address: string;
  avatarUrl: string;
  accountId: string;
  username: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
}

export interface UserRequest {
  fullName: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  address: string;
  role?: 'USER' | 'ADMIN';
  avatarFile?: File;
}

export interface UserUpdateRequest {
  userId: string;
  fullName: string;
  dob: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  address: string;
  email: string;
  role: 'USER' | 'ADMIN';
  status: 'ACTIVE' | 'INACTIVE' | 'BANNED';
  password?: string; // Optional - only update if provided
}

export interface CreateUserWithAccountRequest {
  username: string;
  email: string;
  password: string;
  fullName: string;
  phone: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  dob: string;
  role: 'USER' | 'ADMIN';
  address?: string;
  avatarFile?: File;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

class UserService {
  async getAllUsers(): Promise<UserResponse[]> {
    const response = await apiClient.get<ApiResponse<UserResponse[]>>(
      `/users`
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch users');
    }
  }

  async getUserByUsername(username: string): Promise<UserResponse> {
    const response = await apiClient.get<ApiResponse<UserResponse>>(
      `/users/username/${username}`
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch user');
    }
  }

  async getUserById(userId: string): Promise<UserResponse> {
    const response = await apiClient.get<ApiResponse<UserResponse>>(
      `/users/${userId}`
    );

    if (response.data.code === 200) {
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Failed to fetch user');
    }
  }

  async createUserWithAccount(userData: CreateUserWithAccountRequest): Promise<UserResponse> {
    const formData = new FormData();
    formData.append('username', userData.username);
    formData.append('email', userData.email);
    formData.append('password', userData.password);
    formData.append('fullName', userData.fullName);
    formData.append('phone', userData.phone);
    formData.append('gender', userData.gender);
    formData.append('dob', userData.dob);
    formData.append('role', userData.role);

    if (userData.address) {
      formData.append('address', userData.address);
    }

    if (userData.avatarFile) {
      formData.append('avatarFile', userData.avatarFile);
    }

    try {
      const response = await apiClient.post<ApiResponse<UserResponse>>(
        `/users/create-with-account`,
        formData
      );

      if (response.data.code === 201 || response.data.code === 200) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to create user');
      }
    } catch (error: any) {
      console.error('Create user error:', error.response?.data || error.message);

      if (error.response?.data) {
        const backendError = error.response.data;
        if (backendError.errors && Array.isArray(backendError.errors)) {
          const fieldMessages = backendError.errors
            .map((err: any) => `${err.field}: ${err.message}`)
            .join(', ');
          throw new Error(fieldMessages);
        }
        if (backendError.message) {
          throw new Error(backendError.message);
        }
      }

      throw new Error('Lỗi không xác định khi tạo tài khoản người dùng.');
    }
  }

  async updateUser(userId: string, userData: UserUpdateRequest, avatarFile?: File): Promise<void> {
    const formData = new FormData();

    formData.append('fullName', userData.fullName);
    formData.append('dob', userData.dob);
    formData.append('gender', userData.gender);
    formData.append('phone', userData.phone);
    formData.append('address', userData.address);
    formData.append('email', userData.email);
    formData.append('role', userData.role);
    formData.append('status', userData.status);

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
        {
          headers: { 'Content-Type': 'multipart/form-data' },
        }
      );

      if (response.data.code !== 200) {
        throw new Error(response.data.message || 'Cập nhật thất bại');
      }

      // Vì API chỉ trả về message, không cần return gì
      console.log('User updated successfully:', response.data.message);
      return; // hàm này chỉ cần trả về void
    } catch (error: any) {
      console.error('Update user error:', error.response?.data || error.message);
      const backendError = error.response?.data;

      if (backendError?.errors && Array.isArray(backendError.errors)) {
        const fieldMessages = backendError.errors
          .map((err: any) => `${err.message}`)
          .join(', ');
        throw new Error(fieldMessages);
      }

      throw new Error(backendError?.message || 'Lỗi không xác định khi cập nhật người dùng.');
    }
  }

  async deleteUser(userId: string): Promise<void> {
    const response = await apiClient.delete<ApiResponse<void>>(
      `/users/${userId}`
    );

    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Failed to delete user');
    }
  }
}

export default new UserService();
