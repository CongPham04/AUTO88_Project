import { create } from "zustand";
import userService, { UserResponse } from "@/services/userService";

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  isUserFetched: boolean;
  setAuth: (token: string | null, email?: string) => Promise<void>; // Thay username -> email
  logout: () => void;
  fetchUser: (email: string) => Promise<void>; // Thay username -> email
}

const getToken = (): string | null => localStorage.getItem("token");

export const useAuthStore = create<AuthState>((set, get) => ({
  token: getToken(),
  user: null,
  isUserFetched: false,
  setAuth: async (token, email) => {
    if (token && email) {
      localStorage.setItem("token", token);
      set({ token });
      await get().fetchUser(email);
    } else {
      localStorage.removeItem("token");
      set({ token: null, user: null, isUserFetched: false });
    }
  },
  fetchUser: async (email) => {
    try {
      // ✅ Gọi API getUserByEmail
      const user = await userService.getUserByEmail(email);
      set({ user, isUserFetched: true });
    } catch (error) {
      console.error("Failed to fetch user:", error);
      get().logout();
    }
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ token: null, user: null, isUserFetched: false });
  },
}));