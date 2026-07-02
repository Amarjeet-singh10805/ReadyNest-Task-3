import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import { useAuthStore } from "../store/useAuthStore";
import { useMessageStore } from "../store/useMessageStore";

export default function ProfilePage() {
  const { id } = useParams();
  const { user: me } = useAuthStore();
  const { openConversation } = useMessageStore();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const isOwnProfile = me?.id === Number(id);

  const load = async () => {
    setLoading(true);
    try {
      const [{ data: u }, { data: p }] = await Promise.all([
        api.get(`/users/${id}`),
        api.get(`/posts/user/${id}`),
      ]);
      setProfile(u);
      setPosts(p);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const toggleFollow = async () => {
    if (!profile) return;
    try {
      if (profile.isFollowing) {
        await api.post(`/users/unfollow/${id}`);
        setProfile((p) => ({ ...p, isFollowing: false, followersCount: p.followersCount - 1 }));
      } else {
        await api.post(`/users/follow/${id}`);
        setProfile((p) => ({ ...p, isFollowing: true, followersCount: p.followersCount + 1 }));
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleMessage = async () => {
    try {
      const convo = await openConversation(Number(id));
      navigate(`/messages/${convo.id}`);
    } catch (err) {
      toast.error("Could not open conversation");
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;
  if (!profile) return <p className="text-center mt-20">User not found</p>;

  return (
    <div className="max-w-2xl mx-auto pt-8 px-4">
      <div className="flex items-center gap-8 mb-8">
        <img
          src={profile.profilePicture || `https://ui-avatars.com/api/?name=${profile.username}`}
          className="w-20 h-20 md:w-32 md:h-32 rounded-full object-cover"
        />
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-3 flex-wrap">
            <h2 className="text-xl font-semibold">{profile.username}</h2>
            {isOwnProfile ? (
              <Link
                to="/profile/edit"
                className="px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-semibold"
              >
                Edit profile
              </Link>
            ) : (
              <>
                <button
                  onClick={toggleFollow}
                  className={`px-4 py-1.5 rounded-lg text-sm font-semibold ${
                    profile.isFollowing
                      ? "border border-gray-300 dark:border-gray-700"
                      : "bg-brand-500 text-white"
                  }`}
                >
                  {profile.isFollowing ? "Following" : "Follow"}
                </button>
                <button
                  onClick={handleMessage}
                  className="px-4 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm font-semibold"
                >
                  Message
                </button>
              </>
            )}
          </div>
          <div className="flex gap-6 text-sm mb-3">
            <span>
              <b>{profile.postsCount}</b> posts
            </span>
            <Link to={`/profile/${id}/followers`}>
              <b>{profile.followersCount}</b> followers
            </Link>
            <Link to={`/profile/${id}/following`}>
              <b>{profile.followingCount}</b> following
            </Link>
          </div>
          {profile.bio && <p className="text-sm">{profile.bio}</p>}
        </div>
      </div>

      <div className="border-t border-gray-200 dark:border-gray-800 pt-4 grid grid-cols-3 gap-1">
        {posts.map((p) => (
          <Link key={p.id} to={`/post/${p.id}`} className="aspect-square overflow-hidden">
            <img src={p.imageUrl} className="w-full h-full object-cover" />
          </Link>
        ))}
        {posts.length === 0 && (
          <p className="col-span-3 text-center text-gray-400 mt-8">No posts yet</p>
        )}
      </div>
    </div>
  );
}
