import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import api from "../services/api";
import { getSocket } from "../services/socket";
import { useAuthStore } from "../store/useAuthStore";

export default function CommentSection({ postId }) {
  const { user } = useAuthStore();
  const [comments, setComments] = useState([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get(`/posts/${postId}/comments`)
      .then(({ data }) => setComments(data))
      .finally(() => setLoading(false));

    const socket = getSocket();
    const onNewComment = ({ postId: pid, comment }) => {
      if (pid === Number(postId)) setComments((prev) => [...prev, comment]);
    };
    const onDeleted = ({ postId: pid, commentId }) => {
      if (pid === Number(postId)) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    };
    socket.on("newComment", onNewComment);
    socket.on("commentDeleted", onDeleted);
    return () => {
      socket.off("newComment", onNewComment);
      socket.off("commentDeleted", onDeleted);
    };
  }, [postId]);

  const submitComment = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    try {
      await api.post(`/posts/${postId}/comment`, { text });
      setText("");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteComment = async (id) => {
    try {
      await api.delete(`/comments/${id}`);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {loading && <p className="text-sm text-gray-400">Loading comments...</p>}
        {!loading && comments.length === 0 && (
          <p className="text-sm text-gray-400">No comments yet.</p>
        )}
        {comments.map((c) => (
          <div key={c.id} className="flex items-start gap-2 text-sm">
            <Link to={`/profile/${c.user.id}`}>
              <img
                src={c.user.profilePicture || `https://ui-avatars.com/api/?name=${c.user.username}`}
                className="w-7 h-7 rounded-full object-cover"
              />
            </Link>
            <div className="flex-1">
              <span className="font-semibold mr-2">{c.user.username}</span>
              {c.text}
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true })}
              </p>
            </div>
            {c.user.id === user?.id && (
              <button onClick={() => deleteComment(c.id)} className="text-gray-400 hover:text-red-500">
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={submitComment} className="border-t border-gray-200 dark:border-gray-800 p-3 flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Add a comment..."
          className="flex-1 bg-transparent text-sm outline-none"
        />
        <button type="submit" className="text-brand-500 font-semibold text-sm disabled:opacity-40" disabled={!text.trim()}>
          Post
        </button>
      </form>
    </div>
  );
}
