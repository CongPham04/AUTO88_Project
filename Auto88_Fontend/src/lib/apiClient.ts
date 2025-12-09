import axios from "axios";
import { toast } from "sonner";
import { getAccessToken, updateTokens, clearTokens } from "@/lib/tokenHelper"; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string;

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// --- Request Interceptor ---
apiClient.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    const isAuthPage = window.location.pathname.startsWith("/auth");

    // ✅ 1. ƯU TIÊN GẮN TOKEN TRƯỚC (Sửa lỗi logout)
    // Luôn gửi token nếu có, backend sẽ tự quyết định dùng hay không
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Regex patterns cho public GET endpoints
    // (Lưu ý: Bạn nên cập nhật regex cho đúng với API mới /news/published)
    const publicGetEndpoints = [
      /^\/home\/sections$/,
      /^\/search\/cars(\?.*)?$/,
      /^\/cars\/?$/,
      /^\/cars\/\d+$/,
      /^\/cars\/brand\/.*$/,     // Cập nhật regex
      /^\/cars\/category\/.*$/,  // Cập nhật regex
      /^\/news\/published\/?$/,  // ✅ Sửa: Chỉ /news/published mới là public
      /^\/news\/published\/\d+$/,// ✅ Sửa: Chi tiết tin published
      /^\/news\/\d+$/,           // (Cẩn thận dòng này, nếu admin view detail cần token thì regex này sẽ làm sai logic nếu đặt return ở trên)
      /^\/compare(\?.*)?$/,
      /^\/cars\/compare$/,
      /^\/meta\/(brands|categories|colors)$/,
    ];

    const isPublic =
      config.method?.toLowerCase() === 'get' &&
      publicGetEndpoints.some((pattern) => pattern.test(config.url || ''));

    // Xử lý đặc biệt cho FormData (Upload ảnh)
    if (config.data instanceof FormData) {
      delete config.headers["Content-Type"];
    }

    // Nếu không có token và không phải trang auth và KHÔNG PHẢI public -> Cảnh báo
    // (Logic này chỉ để debug hoặc chặn sớm, thực tế backend sẽ chặn)
    if (!token && !isAuthPage && !isPublic) {
       // Có thể throw cancel hoặc redirect, nhưng cẩn thận vòng lặp
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// --- Response Interceptor ---
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const requestUrl = error.config?.url || "";

    if (requestUrl.includes("/auth")) {
      return Promise.reject(error);
    }

    // Xử lý 401 Unauthorized
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const res = await axios.post(`${API_BASE_URL}/auth/refresh`, null, {
          withCredentials: true,
        });

        const { token: newToken } = res.data.data;
        updateTokens(newToken);

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);

      } catch (err) {
        console.warn("Làm mới token thất bại:", err);
        clearTokens();
        
        // Chỉ redirect nếu không phải đang ở trang public (tránh phiền khách vãng lai)
        if (!window.location.pathname.startsWith("/auth")) {
             toast.error("Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.");
             window.location.href = "/auth";
        }
      }
    }

    // Xử lý 403 Forbidden
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
);

export const BASE_URL = apiClient.defaults.baseURL;
export default apiClient;