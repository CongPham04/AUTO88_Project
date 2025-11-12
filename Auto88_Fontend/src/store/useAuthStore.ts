import { create } from "zustand";
import userService, { UserResponse } from "@/services/userService";

interface AuthState {
  token: string | null;
  user: UserResponse | null;
  isUserFetched: boolean;
  setAuth: (token: string | null, username?: string) => Promise<void>;
  logout: () => void;
  fetchUser: (username: string) => Promise<void>;
}

const getToken = (): string | null => localStorage.getItem("token");

export const useAuthStore = create<AuthState>((set, get) => ({
  token: getToken(),
  user: null,
  isUserFetched: false,
  setAuth: async (token, username) => {
    if (token && username) {
      localStorage.setItem("token", token);
      set({ token });
      await get().fetchUser(username);
    } else {
      localStorage.removeItem("token");
      set({ token: null, user: null, isUserFetched: false });
    }
  },
  fetchUser: async (username) => {
    try {
      const user = await userService.getUserByUsername(username);
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

