import { create } from 'zustand';
// ❌ KHÔNG DÙNG PERSIST NỮA (theo yêu cầu mới của bạn)
import authService from '@/services/authService';
import userService from '@/services/userService';
import { getAccessToken } from "@/lib/tokenHelper";

// --- TYPE DEFINITIONS ---
export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'BANNED' | 'DELETED';
export type UserRole = 'USER' | 'ADMIN';
export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type User = {
  email: string;
  role: UserRole;
  userId?: string;
  fullName?: string;
  avatarUrl?: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: Gender;
  accountId?: string;
  status?: AccountStatus;
};

type UserState = {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean; // Cờ quan trọng để hiện Skeleton toàn trang khi F5

  // Actions
  login: (email: string, password: string, remember: boolean) => Promise<boolean>;
  register: (email: string, password: string, fullName: string) => Promise<boolean>;
  verifyAccount: (code: string) => Promise<boolean>;
  resendOtp: (email: string) => Promise<boolean>;
  forgotPassword: (email: string) => Promise<boolean>;
  resetPassword: (token: string, newPassword: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  
  // Hàm khởi tạo lại phiên đăng nhập
  initializeAuth: () => Promise<void>;
};

// Helper giải mã token
const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(atob(base64).split('').map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
  } catch (error) { return null; }
};

// --- STORE ---
export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true, // ✅ Mặc định là đang tải để chặn UI khi F5

  // --- 1. LOGIN ---
  login: async (email, password, remember) => {
    try {
      const { token } = await authService.login(email, password, remember);
      // Sau khi có token, gọi luôn hàm initializeAuth để lấy thông tin user
      await get().initializeAuth();
      return true;
    } catch (error) {
      throw error;
    }
  },

  // --- 2. CÁC HÀM KHÁC ---
  register: async (email, password, fullName) => { await authService.register(email, password, fullName); return true; },
  verifyAccount: async (code) => { await authService.verifyAccount(code); return true; },
  resendOtp: async (email) => { await authService.resendOtp(email); return true; },
  forgotPassword: async (email) => { await authService.forgotPassword(email); return true; },
  resetPassword: async (token, newPassword) => { await authService.resetPassword(token, newPassword); return true; },

  // --- 3. LOGOUT ---
  logout: () => {
    authService.logout(); // Xóa token
    set({ user: null, isAuthenticated: false });
  },

  // --- 4. UPDATE PROFILE LOCALLY ---
  updateProfile: (data) => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: { ...currentUser, ...data } });
    }
  },

  // --- 5. INITIALIZE AUTH (QUAN TRỌNG NHẤT) ---
  // Hàm này sẽ chạy mỗi khi F5 trang
  initializeAuth: async () => {
    set({ isInitializing: true }); // Bắt đầu loading

    try {
      const token = getAccessToken();
      
      // 1. Nếu không có token -> User chưa đăng nhập
      if (!token) {
        set({ user: null, isAuthenticated: false });
        return; 
      }

      const decoded = decodeToken(token);

      // 2. Token lỗi hoặc hết hạn -> Logout
      if (!decoded || !decoded.sub || (decoded.exp * 1000 < Date.now())) {
        console.log("Token invalid or expired");
        authService.logout();
        set({ user: null, isAuthenticated: false });
        return;
      }

      // 3. Token hợp lệ -> Lấy Email (sub) -> Gọi API lấy thông tin User
      const emailFromToken = decoded.sub;
      console.log("Restoring session for:", emailFromToken);

      try {
        const userDetails = await userService.getUserByEmail(emailFromToken);
        
        // 4. Lưu vào Store
        set({
          user: {
            email: userDetails.email,
            role: decoded.role?.toLowerCase() === 'admin' ? 'ADMIN' : 'USER',
            userId: userDetails.userId,
            fullName: userDetails.fullName,
            avatarUrl: userDetails.avatarUrl,
            phone: userDetails.phone,
            address: userDetails.address,
            dob: userDetails.dob,
            gender: userDetails.gender,
            accountId: userDetails.accountId,
            status: userDetails.status as AccountStatus
          },
          isAuthenticated: true
        });
      } catch (apiError) {
        console.error("Failed to fetch user details:", apiError);
        // Nếu token ngon mà API lỗi (ví dụ backend die), ta vẫn có thể logout
        // Hoặc giữ nguyên để user thấy lỗi
        authService.logout();
        set({ user: null, isAuthenticated: false });
      }

    } catch (error) {
      console.error("Failed to initialize auth:", error);
      authService.logout();
      set({ user: null, isAuthenticated: false });
    } finally {
      // 5. Kết thúc quá trình -> Tắt loading -> ProtectedRoute sẽ cho hiển thị trang
      set({ isInitializing: false });
    }
  }
}));