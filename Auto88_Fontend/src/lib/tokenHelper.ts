export const setTokens = (token: string, refreshToken: string, remember: boolean) => {
  // 1. Xóa sạch ở cả 2 nơi để tránh xung đột
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');

  // 2. Chọn nơi lưu dựa trên biến remember
  const storage = remember ? localStorage : sessionStorage;

  // 3. Lưu
  storage.setItem('token', token);
  if (refreshToken) storage.setItem('refreshToken', refreshToken);
};

export const getAccessToken = () => {
  return localStorage.getItem('token') || sessionStorage.getItem('token');
};

export const getRefreshToken = () => {
  return localStorage.getItem('refreshToken') || sessionStorage.getItem('refreshToken');
};

export const clearTokens = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('refreshToken');
  sessionStorage.removeItem('token');
  sessionStorage.removeItem('refreshToken');
};

// Cập nhật token mới vào nơi đang lưu trữ (Dùng cho Refresh Token)
export const updateTokens = (newToken: string, newRefreshToken?: string) => {
  // Kiểm tra xem user đang dùng localStorage (Ghi nhớ) hay không
  const isRemembered = !!localStorage.getItem('token'); 
  const storage = isRemembered ? localStorage : sessionStorage;

  storage.setItem('token', newToken);
  if (newRefreshToken) {
    storage.setItem('refreshToken', newRefreshToken);
  }
};