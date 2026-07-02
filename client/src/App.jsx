import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { useAuthStore } from "./store/useAuthStore";
import { useNotificationStore } from "./store/useNotificationStore";
import { getSocket } from "./services/socket";
import { ProtectedRoute, PublicOnlyRoute } from "./routes/ProtectedRoute";

import MainLayout from "./layouts/MainLayout";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import FeedPage from "./pages/FeedPage";
import ProfilePage from "./pages/ProfilePage";
import EditProfilePage from "./pages/EditProfilePage";
import PostDetailPage from "./pages/PostDetailPage";
import SearchPage from "./pages/SearchPage";
import SavedPostsPage from "./pages/SavedPostsPage";
import NotificationsPage from "./pages/NotificationsPage";
import CreatePostPage from "./pages/CreatePostPage";
import FollowListPage from "./pages/FollowListPage";
import NotFoundPage from "./pages/NotFoundPage";
import MessagesPage from "./pages/MessagesPage";

function App() {
  const { user, checkAuth } = useAuthStore();
  const { addNotification } = useNotificationStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    if (!user) return;
    const socket = getSocket();
    const handleNotification = ({ notification, unreadCount }) => {
      addNotification(notification, unreadCount);
    };
    socket.on("newNotification", handleNotification);
    return () => socket.off("newNotification", handleNotification);
  }, [user, addNotification]);

  return (
    <Routes>
      <Route element={<PublicOnlyRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route element={<MainLayout />}>
          <Route path="/" element={<FeedPage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/create" element={<CreatePostPage />} />
          <Route path="/notifications" element={<NotificationsPage />} />
          <Route path="/saved" element={<SavedPostsPage />} />
          <Route path="/messages" element={<MessagesPage />} />
          <Route path="/messages/:convoId" element={<MessagesPage />} />
          <Route path="/profile/edit" element={<EditProfilePage />} />
          <Route path="/profile/:id" element={<ProfilePage />} />
          <Route path="/profile/:id/followers" element={<FollowListPage mode="followers" />} />
          <Route path="/profile/:id/following" element={<FollowListPage mode="following" />} />
          <Route path="/post/:id" element={<PostDetailPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
