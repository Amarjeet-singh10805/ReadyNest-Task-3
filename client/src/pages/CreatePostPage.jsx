import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../services/api";

export default function CreatePostPage() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [caption, setCaption] = useState("");
  const [posting, setPosting] = useState(false);

  const handleFile = (f) => {
    setFile(f);
    setPreview(f ? URL.createObjectURL(f) : null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return toast.error("Please select an image");
    setPosting(true);
    try {
      const fd = new FormData();
      fd.append("image", file);
      fd.append("caption", caption);
      const { data } = await api.post("/posts/create", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Post created!");
      navigate(`/post/${data.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPosting(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-8 px-4">
      <h2 className="text-xl font-semibold mb-6">Create new post</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        {preview ? (
          <img src={preview} className="w-full aspect-square object-cover rounded-lg" />
        ) : (
          <label className="flex items-center justify-center w-full aspect-square border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer text-gray-400 text-sm">
            Click to select an image
            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files?.[0] || null)} />
          </label>
        )}
        <textarea
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          placeholder="Write a caption..."
          rows={3}
          maxLength={2200}
          className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
        />
        <button
          type="submit"
          disabled={posting}
          className="w-full bg-brand-500 text-white rounded py-2 font-semibold text-sm disabled:opacity-50"
        >
          {posting ? "Posting..." : "Share"}
        </button>
      </form>
    </div>
  );
}
