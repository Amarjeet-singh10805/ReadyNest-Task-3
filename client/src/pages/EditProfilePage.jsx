import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../store/useAuthStore";

export default function EditProfilePage() {
  const { user, updateProfile } = useAuthStore();
  const navigate = useNavigate();
  const [username, setUsername] = useState(user?.username || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      if (username !== user.username) fd.append("username", username);
      fd.append("bio", bio);
      if (file) fd.append("profilePicture", file);

      await updateProfile(fd);
      toast.success("Profile updated");
      navigate(`/profile/${user.id}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-md mx-auto pt-8 px-4">
      <h2 className="text-xl font-semibold mb-6">Edit profile</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex items-center gap-4">
          <img
            src={
              file
                ? URL.createObjectURL(file)
                : user?.profilePicture || `https://ui-avatars.com/api/?name=${user?.username}`
            }
            className="w-16 h-16 rounded-full object-cover"
          />
          <input type="file" accept="image/*" onChange={(e) => setFile(e.target.files?.[0] || null)} />
        </div>
        <div>
          <label className="text-xs text-gray-500">Username</label>
          <input
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
          />
        </div>
        <div>
          <label className="text-xs text-gray-500">Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            maxLength={150}
            rows={3}
            className="w-full px-3 py-2 rounded border border-gray-300 dark:border-gray-700 bg-transparent text-sm"
          />
        </div>
        <button
          type="submit"
          disabled={saving}
          className="w-full bg-brand-500 text-white rounded py-2 font-semibold text-sm disabled:opacity-50"
        >
          {saving ? "Saving..." : "Save changes"}
        </button>
      </form>
    </div>
  );
}
