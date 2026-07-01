import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import api from "../services/api";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }
    const timeout = setTimeout(() => {
      setLoading(true);
      api
        .get(`/users/search?q=${encodeURIComponent(query)}`)
        .then(({ data }) => setResults(data))
        .finally(() => setLoading(false));
    }, 300);
    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className="max-w-md mx-auto pt-8 px-4">
      <div className="flex items-center gap-2 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 mb-4">
        <Search size={18} className="text-gray-400" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search users"
          className="flex-1 bg-transparent text-sm outline-none"
        />
      </div>

      {loading && <p className="text-sm text-gray-400">Searching...</p>}

      <div className="space-y-3">
        {results.map((u) => (
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
