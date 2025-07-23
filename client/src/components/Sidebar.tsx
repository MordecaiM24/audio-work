import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import type { Collection } from "../types";
import { fetchCollections } from "../api";

export default function Sidebar() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    async function loadCollections() {
      try {
        const data = await fetchCollections();
        setCollections(data);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load collections"
        );
      } finally {
        setLoading(false);
      }
    }

    loadCollections();
  }, []);

  if (loading) {
    return (
      <div className="w-64 bg-gray-100 border-r border-gray-200 p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-3 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-64 bg-gray-100 border-r border-gray-200 p-4">
        <div className="text-red-600 text-sm">
          <p className="font-semibold">Error loading playlists</p>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-64 bg-gray-100 border-r border-gray-200 p-4 h-full overflow-y-auto">
      <div className="mb-6">
        <Link
          to="/"
          className="text-xl font-bold text-gray-800 hover:text-blue-600 transition-colors"
        >
          YouTube Transcripts
        </Link>
      </div>

      <div>
        <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wide mb-3">
          Playlists
        </h2>
        <nav className="space-y-1">
          {collections.map((collection) => {
            const isActive =
              location.pathname === `/playlist/${collection.name}`;
            return (
              <Link
                key={collection.name}
                to={`/playlist/${collection.name}`}
                className={`block px-3 py-2 rounded-md text-sm transition-colors ${
                  isActive
                    ? "bg-blue-100 text-blue-700 font-medium"
                    : "text-gray-700 hover:bg-gray-200 hover:text-gray-900"
                }`}
              >
                <div className="flex justify-between items-center">
                  <span className="truncate">{collection.name}</span>
                  <span className="text-xs text-gray-500 ml-2">
                    {collection.count}
                  </span>
                </div>
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
