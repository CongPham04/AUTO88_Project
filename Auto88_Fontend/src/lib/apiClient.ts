import axios from "axios";
import { toast } from "sonner";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

// ✅ Tạo instance Axios
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true, // ⚠️ gửi cookie (refreshToken) kèm request
});

// Request interceptor — thêm accessToken
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    const isAuthPage = window.location.pathname.startsWith("/auth");

    // Regex patterns for public GET endpoints
    const publicGetEndpoints = [
      /^\/home\/sections$/,
      /^\/search\/cars(\?.*)?$/,
      /^\/cars\/?$/,
      /^\/cars\/\d+$/,
      /^\/car-details\/\d+$/, 
      /^\/car-details\/car\/\d+$/, 
      /^\/cars\/(brand|category)\/\w+$/,
      /^\/news\/?$/,
      /^\/news\/\d+$/,
      /^\/compare(\?.*)?$/,
      /^\/cars\/compare$/,
      /^\/meta\/(brands|categories|colors)$/,
    ];

    const isPublic =
      config.method?.toLowerCase() === 'get' &&
      publicGetEndpoints.some((pattern) => pattern.test(config.url || ''));

    // 👉 Nếu là public API thì KHÔNG ép token
    if (isPublic) {
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }
      return config;
    }

    if (!token && !isAuthPage) {
      toast.error("Vui lòng đăng nhập để tiếp tục!");
      window.location.href = "/auth";
      throw new axios.Cancel("Không có token, điều hướng đến đăng nhập.");
    }

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ✅ Response interceptor — xử lý khi accessToken hết hạn
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = error.config?.url || "";

    // ❌ Không toast lỗi khi đang login hoặc register
    if (requestUrl.includes("/auth")) {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // ⚙️ Gọi API refresh — refreshToken nằm trong cookie HTTP-only
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
          withCredentials: true, // gửi cookie lên server
        });

        const { token: newToken } = res.data.data;

        // Cập nhật accessToken
        localStorage.setItem("token", newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;

        return apiClient(originalRequest);
      } catch (err) {
        console.warn("Làm mới token thất bại:", err);
      }

      localStorage.removeItem("token");
      toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
      window.location.href = "/auth";
    }

    if (error.response?.status === 403) {
      const currentPath = window.location.pathname;

      if (currentPath.startsWith("/admin")) {
        toast.error("Bạn không có quyền truy cập vào trang quản trị!");
        window.location.href = "/";
      } else {
        toast.warning("Bạn không có quyền thực hiện hành động này!");
      }
    }

    return Promise.reject(error);
  }

  // return Promise.reject(error);
);
export const BASE_URL = apiClient.defaults.baseURL;
export default apiClient;
