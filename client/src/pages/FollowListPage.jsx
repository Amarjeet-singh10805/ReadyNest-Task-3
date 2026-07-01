import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../services/api";

export default function FollowListPage({ mode }) {
  const { id } = useParams();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    api
      .get(`/users/${mode}/${id}`)
      .then(({ data }) => setUsers(data))
      .finally(() => setLoading(false));
  }, [id, mode]);

  return (
    <div className="max-w-md mx-auto pt-8 px-4">
      <h2 className="text-xl font-semibold mb-4 capitalize">{mode}</h2>
      {loading && <p className="text-sm text-gray-400">Loading...</p>}
      {!loading && users.length === 0 && (
        <p className="text-center text-gray-400 mt-12">No {mode} yet.</p>
      )}
      <div className="space-y-3">
        {users.map((u) => (
          <Link key={u.id} to={`/profile/${u.id}`} className="flex items-center gap-3">
            <img
              src={u.profilePicture || `https://ui-avatars.com/api/?name=${u.username}`}
              className="w-10 h-10 rounded-full object-cover"
            />
            <div>
              <p className="font-semibold text-sm">{u.username}</p>
              {u.bio && <p className="text-xs text-gray-400">{u.bio}</p>}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
