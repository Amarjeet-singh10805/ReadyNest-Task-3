import { useEffect, useState } from "react";
import { X, Send } from "lucide-react";
import { useMessageStore } from "../store/useMessageStore";
import { useAuthStore } from "../store/useAuthStore";
import api from "../services/api";
import toast from "react-hot-toast";

export default function SharePostModal({ post, onClose }) {
  const { user } = useAuthStore();
  const { sendMessage } = useMessageStore();
  const [followers, setFollowers] = useState([]);
  const [selected, setSelected] = useState(new Set());
  const [sending, setSending] = useState(false);

  useEffect(() => {
    // load people the current user follows so they can share to them
    api.get(`/users/${user.id}/following`).then(({ data }) => setFollowers(data));
  }, [user.id]);

  const toggle = (id) =>
    setSelected((s) => {
      const n = new Set(s);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  const handleSend = async () => {
    if (selected.size === 0) return;
    setSending(true);
    try {
      for (const userId of selected) {
        const { data: convo } = await api.post(`/messages/with/${userId}`);
        await api.post(`/messages/${convo.id}/messages`, { postId: post.id });
      }
      toast.success("Post shared!");
      onClose();
    } catch (e) {
      toast.error("Failed to share");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-xl w-full max-w-sm shadow-xl">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-800">
          <span className="font-semibold">Share post</span>
          <button onClick={onClose}><X size={20} /></button>
        </div>
        <div className="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-gray-800">
          {followers.length === 0 && (
            <p className="text-center text-gray-400 py-8 text-sm">You're not following anyone yet</p>
          )}
          {followers.map((f) => (
            <div
              key={f.id}
              onClick={() => toggle(f.id)}
              className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <img src={f.profilePicture || `https://ui-avatars.com/api/?name=${f.username}`} className="w-9 h-9 rounded-full object-cover" />
              <span className="text-sm font-medium flex-1">{f.username}</span>
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${selected.has(f.id) ? "bg-brand-500 border-brand-500" : "border-gray-300"}`}>
                {selected.has(f.id) && <span className="text-white text-xs">✓</span>}
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          <button
            onClick={handleSend}
            disabled={selected.size === 0 || sending}
            className="w-full bg-brand-500 text-white rounded-lg py-2 font-semibold text-sm disabled:opacity-40 flex items-center justify-center gap-2"
          >
            <Send size={16} /> {sending ? "Sending…" : `Send to ${selected.size || ""} ${selected.size === 1 ? "person" : "people"}`}
          </button>
        </div>
      </div>
    </div>
  );
}
