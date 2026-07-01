import { create } from "zustand";
import api from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";

export const useAuthStore = create((set, get) => ({
  user: null,
  isLoading: false,
  isCheckingAuth: true,

  checkAuth: async () => {
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data, isCheckingAuth: false });
      connectSocket();
    } catch {
      set({ user: null, isCheckingAuth: false });
    }
  },

  register: async (formData) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/register", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      set({ user: data, isLoading: false });
      connectSocket();
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  login: async (credentials) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post("/auth/login", credentials);
      set({ user: data, isLoading: false });
      connectSocket();
      return data;
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await api.post("/auth/logout");
    disconnectSocket();
    set({ user: null });
  },

  updateProfile: async (formData) => {
    const { data } = await api.put("/auth/update-profile", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    set({ user: { ...get().user, ...data } });
    return data;
  },
}));
