import { create } from 'zustand';
import authService from '@/services/authService';
import userService from '@/services/userService';

type User = {
  username: string;
  role: 'admin' | 'customer';
  userId?: string;
  fullName?: string;
  email?: string;
  avatar?: string;
  phone?: string;
  address?: string;
  dob?: string;
  gender?: 'MALE' | 'FEMALE' | 'OTHER';
};

type UserState = {
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string, fullName: string) => Promise<boolean>; 
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
  initializeAuth: () => void;
};

// Helper function to decode JWT token
const decodeToken = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    return null;
  }
};

export const useUserStore = create<UserState>((set, get) => ({
  user: null,
  isAuthenticated: false,

  login: async (username: string, password: string) => {
    try {
      const { token } = await authService.login(username, password);

      // Decode token to get user info
      const decoded = decodeToken(token);

      if (decoded) {
        // Fetch full user details from API
        try {
          const userDetails = await userService.getUserByUsername(decoded.sub || username);

          const user: User = {
            username: decoded.sub || username,
            role: decoded.role?.toLowerCase() === 'admin' ? 'admin' : 'customer',
            userId: userDetails.userId,
            fullName: userDetails.fullName,
            phone: userDetails.phone,
            address: userDetails.address,
            dob: userDetails.dob,
            gender: userDetails.gender,
            avatar: userDetails.avatarUrl,
            email: userDetails.email,
          };

          set({
            user,
            isAuthenticated: true
          });
        } catch (userError) {
          // If fetching user details fails, still set basic user info
          console.error('Failed to fetch user details:', userError);
          const user: User = {
            username: decoded.sub || username,
            role: decoded.role?.toLowerCase() === 'admin' ? 'admin' : 'customer',
          };

          set({
            user,
            isAuthenticated: true
          });
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (username: string, password: string, fullName: string) => {
  try {
    await authService.register(username, password, fullName);

    // ✅ Auto login sau khi đăng ký
    return await get().login(username, password);
  } catch (error) {
    console.error('Registration error:', error);
    return false;
  }
},

  logout: () => {
    authService.logout();
    set({
      user: null,
      isAuthenticated: false
    });
  },

  updateProfile: (data: Partial<User>) => {
    const currentUser = get().user;
    if (currentUser) {
      set({
        user: { ...currentUser, ...data }
      });
    }
  },

  initializeAuth: async () => {
    const token = localStorage.getItem('token');
    if (token) {
      const decoded = decodeToken(token);
      if (decoded && decoded.exp * 1000 > Date.now()) {
        // Fetch full user details from API
        try {
          const userDetails = await userService.getUserByUsername(decoded.sub);

          const user: User = {
            username: decoded.sub,
            role: decoded.role?.toLowerCase() === 'admin' ? 'admin' : 'customer',
            userId: userDetails.userId,
            fullName: userDetails.fullName,
            phone: userDetails.phone,
            address: userDetails.address,
            dob: userDetails.dob,
            gender: userDetails.gender,
            avatar: userDetails.avatarUrl,
            email: userDetails.email,
          };

          set({
            user,
            isAuthenticated: true
          });
        } catch (userError) {
          // If fetching user details fails, still set basic user info
          console.error('Failed to fetch user details:', userError);
          const user: User = {
            username: decoded.sub,
            role: decoded.role?.toLowerCase() === 'admin' ? 'admin' : 'customer',
          };

          set({
            user,
            isAuthenticated: true
          });
        }
      } else {
        // Token expired, clear it
        authService.logout();
      }
    }
  }
}));