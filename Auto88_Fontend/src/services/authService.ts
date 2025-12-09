import apiClient from '@/lib/apiClient';
import { setTokens, clearTokens } from "@/lib/tokenHelper";

export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  fullName: string;
}

export interface VerifyRequest {
  code: string;
}

export interface ResendOtpRequest {
  email: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface JwtResponse {
  token: string;
  refreshToken: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

class AuthService {
  // ✅ Login: Nhận thêm biến remember
  async login(email: string, password: string, remember: boolean): Promise<JwtResponse> {
    const response = await apiClient.post<ApiResponse<JwtResponse>>(
      '/auth/login',
      { email, password }
    );

    if (response.data.code === 200) {
      const { token, refreshToken } = response.data.data;
      // ✅ Lưu token vào Local hoặc Session tùy ý người dùng
      setTokens(token, refreshToken, remember); 
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Đăng nhập thất bại');
    }
  }

  async register(email: string, password: string, fullName: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/auth/register',
      { email, password, fullName }
    );
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Đăng ký thất bại');
    }
  }

  async verifyAccount(code: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/auth/verify',
      { code }
    );
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Xác thực thất bại');
    }
  }

  async resendOtp(email: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/auth/resend-otp',
      { email }
    );
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Gửi lại mã thất bại');
    }
  }

  // Refresh token (client-side trigger manually if needed)
  async refresh(refreshToken: string): Promise<JwtResponse> {
    const response = await apiClient.post<ApiResponse<JwtResponse>>(
      '/auth/refresh',
      null,
      { params: { refreshToken } }
    );

    if (response.data.code === 200) {
      // Lưu ý: Logic lưu token refresh này thường do interceptor tự lo
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Làm mới token thất bại');
    }
  }

  logout(): void {
    clearTokens(); // ✅ Xóa sạch token ở cả 2 nơi
    apiClient.post('/auth/logout').catch(() => {});
  }

  async forgotPassword(email: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/auth/forgot-password',
      { email }
    );
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Gửi email thất bại');
    }
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const response = await apiClient.post<ApiResponse<void>>(
      '/auth/reset-password',
      { token, newPassword }
    );
    if (response.data.code !== 200) {
      throw new Error(response.data.message || 'Đặt lại mật khẩu thất bại');
    }
  }
}

export default new AuthService();