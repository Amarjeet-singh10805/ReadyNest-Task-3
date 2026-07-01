import { create } from "zustand";
import api from "../services/api";

export const useNotificationStore = create((set, get) => ({
  notifications: [],
  unreadCount: 0,

  fetchNotifications: async () => {
    const { data } = await api.get("/notifications");
    const unreadCount = data.filter((n) => !n.isRead).length;
    set({ notifications: data, unreadCount });
  },

  addNotification: (notification, unreadCount) => {
    set({
      notifications: [notification, ...get().notifications],
      unreadCount,
    });
  },

  markAsRead: async (id) => {
    await api.put(`/notifications/read/${id}`);
    set({
      notifications: get().notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, get().unreadCount - 1),
    });
  },

  markAllAsRead: async () => {
    await api.put("/notifications/read-all");
    set({
      notifications: get().notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    });
  },
}));
