import { create } from "zustand";
import api from "../services/api";

export const useMessageStore = create((set, get) => ({
  conversations: [],
  activeConvo: null,
  messages: [],
  loading: false,

  fetchConversations: async () => {
    const { data } = await api.get("/messages");
    set({ conversations: data });
  },

  openConversation: async (userId) => {
    const { data } = await api.post(`/messages/with/${userId}`);
    set({ activeConvo: data });
    return data;
  },

  fetchMessages: async (convoId) => {
    set({ loading: true });
    const { data } = await api.get(`/messages/${convoId}/messages`);
    set({ messages: data, loading: false });
  },

  sendMessage: async (convoId, payload) => {
    const { data } = await api.post(`/messages/${convoId}/messages`, payload);
    set((s) => ({ messages: [...s.messages, data] }));
  },

  receiveMessage: (msg) => {
    const { activeConvo } = get();
    if (activeConvo && msg.conversationId === activeConvo.id) {
      set((s) => ({ messages: [...s.messages, msg] }));
    }
  },

  closeConversation: () => set({ activeConvo: null, messages: [] }),
}));
