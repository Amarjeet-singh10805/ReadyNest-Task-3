import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, Bookmark, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import toast from "react-hot-toast";
import api from "../services/api";
import { getSocket } from "../services/socket";
import { useAuthStore } from "../store/useAuthStore";

export default function PostCard({ post, onDelete }) {
  const { user } = useAuthStore();
  const [likesCount, setLikesCount] = useState(post.likesCount);
  const [likedByMe, setLikedByMe] = useState(post.likedByMe);
  const [savedByMe, setSavedByMe] = useState(post.savedByMe);
  const [commentsCount, setCommentsCount] = useState(post.commentsCount);

  useEffect(() => {
    const socket = getSocket();
    const onLikeUpdate = ({ postId, likesCount: count }) => {
      if (postId === post.id) setLikesCount(count);
    };
    const onComment = ({ postId }) => {
      if (postId === post.id) setCommentsCount((c) => c + 1);
    };
    socket.on("likeUpdate", onLikeUpdate);
    socket.on("newComment", onComment);
    return () => {
      socket.off("likeUpdate", onLikeUpdate);
      socket.off("newComment", onComment);
    };
  }, [post.id]);

  const toggleLike = async () => {
    try {
      if (likedByMe) {
        setLikedByMe(false);
        setLikesCount((c) => c - 1);
        await api.post(`/posts/${post.id}/unlike`);
      } else {
        setLikedByMe(true);
        setLikesCount((c) => c + 1);
        await api.post(`/posts/${post.id}/like`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const toggleSave = async () => {
    try {
      if (savedByMe) {
        setSavedByMe(false);
        await api.post(`/posts/${post.id}/unsave`);
      } else {
        setSavedByMe(true);
        await api.post(`/posts/${post.id}/save`);
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this post?")) return;
    try {
      await api.delete(`/posts/${post.id}`);
      toast.success("Post deleted");
      onDelete?.(post.id);
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="border border-gray-200 dark:border-gray-800 rounded-lg mb-6 max-w-xl mx-auto bg-white dark:bg-black">
      <div className="flex items-center justify-between p-3">
        <Link to={`/profile/${post.user.id}`} className="flex items-center gap-3">
          <img
            src={post.user.profilePicture || `https://ui-avatars.com/api/?name=${post.user.username}`}
            alt={post.user.username}
            className="w-9 h-9 rounded-full object-cover"
          />
          <span className="font-semibold text-sm">{post.user.username}</span>
        </Link>
        {post.user.id === user?.id && (
          <button onClick={handleDelete} className="text-gray-400 hover:text-red-500">
            <Trash2 size={18} />
          </button>
        )}
      </div>

      <img src={post.imageUrl} alt="post" className="w-full aspect-square object-cover" />

      <div className="p-3">
        <div className="flex items-center gap-4 mb-2">
          <button onClick={toggleLike}>
            <Heart
              size={26}
              className={likedByMe ? "fill-red-500 text-red-500" : ""}
            />
          </button>
          <Link to={`/post/${post.id}`}>
            <MessageCircle size={26} />
          </Link>
          <button onClick={toggleSave} className="ml-auto">
            <Bookmark size={24} className={savedByMe ? "fill-current" : ""} />
          </button>
        </div>

        <p className="font-semibold text-sm mb-1">{likesCount} likes</p>

        {post.caption && (
          <p className="text-sm mb-1">
            <span className="font-semibold mr-2">{post.user.username}</span>
            {post.caption}
          </p>
        )}

        {commentsCount > 0 && (
          <Link to={`/post/${post.id}`} className="text-sm text-gray-500">
            View all {commentsCount} comments
          </Link>
        )}

        <p className="text-xs text-gray-400 uppercase mt-1">
          {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
