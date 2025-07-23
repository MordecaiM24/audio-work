import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { CollectionVideos, SearchResponse } from "../types";
import { fetchCollectionVideos, searchInCollection } from "../api";
import SearchBar from "../components/SearchBar";
import SearchResults from "../components/SearchResults";
import VideoGrid from "../components/VideoGrid";

export default function Playlist() {
  const { collectionName } = useParams<{ collectionName: string }>();
  const [videos, setVideos] = useState<CollectionVideos | null>(null);
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showSearch, setShowSearch] = useState(false);

  useEffect(() => {
    async function loadVideos() {
      if (!collectionName) return;

      try {
        setLoading(true);
        const data = await fetchCollectionVideos(collectionName);
        setVideos(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load videos");
      } finally {
        setLoading(false);
      }
    }

    loadVideos();
    // Reset search when collection changes
    setSearchResults(null);
    setShowSearch(false);
  }, [collectionName]);

  const handleSearch = async (query: string) => {
    if (!collectionName) return;

    try {
      setSearchLoading(true);
      const results = await searchInCollection(collectionName, query, 20);
      setSearchResults(results);
      setShowSearch(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setSearchLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchResults(null);
    setShowSearch(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="h-10 bg-gray-300 rounded mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <svg
              className="h-5 w-5 text-red-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!videos) {
    return (
      <div className="p-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Playlist not found
          </h1>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              {videos.collection}
            </h1>
            <p className="text-gray-600 mt-1">
              {videos.video_count} video{videos.video_count !== 1 ? "s" : ""} •
              Searchable transcripts
            </p>
          </div>
          {showSearch && (
            <button
              onClick={clearSearch}
              className="px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
            >
              Show All Videos
            </button>
          )}
        </div>

        <div className="max-w-2xl">
          <SearchBar
            onSearch={handleSearch}
            loading={searchLoading}
            placeholder={`Search in ${videos.collection}...`}
          />
        </div>
      </div>

      {showSearch && searchResults ? (
        <SearchResults
          results={searchResults.results}
          query={searchResults.query}
          totalFound={searchResults.total_found}
        />
      ) : (
        <VideoGrid videos={videos.videos} collectionName={videos.collection} />
      )}
    </div>
  );
}
