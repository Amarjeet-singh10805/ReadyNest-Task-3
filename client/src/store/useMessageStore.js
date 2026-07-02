import { create } from "zustand";
import api from "../services/api";

export const useMessageStore = create((set, get) => ({
  conversations: [],
  activeConvo: null,
  messages: [],
  loading: false,

  fetchConversations: async () => {
  try {
    const { data } = await api.get("/messages");
    set({ conversations: data });
  } catch (err) {
    console.error("fetchConversations error:", err);
  }
  },
  openConversation: async (userId) => {
    const { data } = await api.post(`/messages/with/${userId}`);
    set({ activeConvo: data });
    return data;
  },

  fetchMessages: async (convoId) => {
  try {
    set({ loading: true });
    const { data } = await api.get(`/messages/${convoId}/messages`);
    set({ messages: data, loading: false });
  } catch (err) {
    set({ loading: false });
    console.error("fetchMessages error:", err);
  }
  },

  sendMessage: async (convoId, payload) => {
    const { data } = await api.post(`/messages/${convoId}/messages`, payload);
    set((s) => ({ messages: [...s.messages, data] }));
  },

receiveMessage: (msg, currentUserId) => {
    const convoId = Number(window.location.pathname.split("/messages/")[1]);
    // only add to messages if from the OTHER person (sender already added their own via sendMessage)
    if (convoId && msg.conversationId === convoId && msg.sender.id !== currentUserId) {
      set((s) => ({ messages: [...s.messages, msg] }));
    }
    // always update sidebar preview
    set((s) => ({
      conversations: s.conversations.map((c) =>
        c.id === msg.conversationId ? { ...c, messages: [msg] } : c
      ),
    }));
  },

  closeConversation: () => set({ activeConvo: null, messages: [] }),
}));
