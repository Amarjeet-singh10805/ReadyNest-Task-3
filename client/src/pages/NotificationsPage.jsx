import { useEffect } from "react";
import { Link } from "react-router-dom";
import { Heart, MessageCircle, UserPlus } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useNotificationStore } from "../store/useNotificationStore";

const iconFor = (type) => {
  if (type === "LIKE") return <Heart size={18} className="text-red-500" />;
  if (type === "COMMENT") return <MessageCircle size={18} className="text-blue-500" />;
  return <UserPlus size={18} className="text-green-500" />;
};

const textFor = (n) => {
  if (n.type === "LIKE") return "liked your post";
  if (n.type === "COMMENT") return "commented on your post";
  return "started following you";
};

export default function NotificationsPage() {
  const { notifications, fetchNotifications, markAsRead, markAllAsRead, unreadCount } =
    useNotificationStore();

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  return (
    <div className="max-w-md mx-auto pt-8 px-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Notifications</h2>
        {unreadCount > 0 && (
          <button onClick={markAllAsRead} className="text-sm text-brand-500 font-semibold">
            Mark all read
          </button>
        )}
      </div>

      {notifications.length === 0 && (
        <p className="text-center text-gray-400 mt-12">No notifications yet.</p>
      )}

      <div className="space-y-1">
        {notifications.map((n) => (
          <Link
            key={n.id}
            to={n.type === "FOLLOW" ? `/profile/${n.sender.id}` : `/post/${n.postId}`}
            onClick={() => !n.isRead && markAsRead(n.id)}
            className={`flex items-center gap-3 p-2 rounded-lg ${
              !n.isRead ? "bg-gray-50 dark:bg-gray-900" : ""
            }`}
          >
            <img
              src={n.sender.profilePicture || `https://ui-avatars.com/api/?name=${n.sender.username}`}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div className="flex-1 text-sm">
              <span className="font-semibold mr-1">{n.sender.username}</span>
              {textFor(n)}
              <p className="text-xs text-gray-400">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </p>
            </div>
            {iconFor(n.type)}
            {n.post && <img src={n.post.imageUrl} className="w-10 h-10 object-cover rounded" />}
          </Link>
        ))}
      </div>
    </div>
  );
}
