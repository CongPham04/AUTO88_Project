import apiClient from '@/lib/apiClient';

export interface LoginRequest {
  username: string;
  password: string;
}

export interface SignupRequest {
  username: string;
  password: string;
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
  async login(username: string, password: string): Promise<JwtResponse> {
    const response = await apiClient.post<ApiResponse<JwtResponse>>(
      '/auth/login',
      { username, password }
    );

    if (response.data.code === 200) {
      const { token, refreshToken } = response.data.data;
      // Store tokens in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Login failed');
    }
  }

  async register(username: string, password: string, fullName: string): Promise<void> {
  const response = await apiClient.post<ApiResponse<void>>(
    '/auth/register',
    { username, password, fullName }
  );

  if (response.data.code !== 200) {
    throw new Error(response.data.message || 'Registration failed');
  }
}

  async refresh(refreshToken: string): Promise<JwtResponse> {
    const response = await apiClient.post<ApiResponse<JwtResponse>>(
      '/auth/refresh',
      null,
      { params: { refreshToken } }
    );

    if (response.data.code === 200) {
      const { token, refreshToken: newRefreshToken } = response.data.data;
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', newRefreshToken);
      return response.data.data;
    } else {
      throw new Error(response.data.message || 'Token refresh failed');
    }
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
  }
}

export default new AuthService();
