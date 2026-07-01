import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";
import CommentSection from "../components/CommentSection";
import PostCard from "../components/PostCard";

export default function PostDetailPage() {
  const { id } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    api
      .get(`/posts/${id}`)
      .then(({ data }) => setPost(data))
      .catch((err) => toast.error(err.message));
  }, [id]);

  if (!post) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto pt-6 px-2 grid md:grid-cols-2 gap-6">
      <div>
        <img src={post.imageUrl} className="w-full rounded-lg object-cover" />
      </div>
      <div className="border border-gray-200 dark:border-gray-800 rounded-lg flex flex-col h-[500px]">
        <CommentSection postId={post.id} />
      </div>
      <div className="md:col-span-2">
        <PostCard post={post} />
      </div>
    </div>
  );
}
