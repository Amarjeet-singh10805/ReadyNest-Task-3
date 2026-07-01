import { useEffect, useState } from "react";
import api from "../services/api";
import PostCard from "../components/PostCard";
import PostSkeleton from "../components/PostSkeleton";

export default function SavedPostsPage() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    api
      .get("/posts/saved")
      .then(({ data }) => setPosts(data))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  return (
    <div className="max-w-xl mx-auto pt-4 px-2">
      <h2 className="text-lg font-semibold mb-4 px-2">Saved Posts</h2>
      {loading && <PostSkeleton />}
      {!loading && posts.length === 0 && (
        <p className="text-center text-gray-400 mt-12">No saved posts yet.</p>
      )}
      {posts.map((post) => (
        <PostCard key={post.id} post={post} onDelete={load} />
      ))}
    </div>
  );
}
