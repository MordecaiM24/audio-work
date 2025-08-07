import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import type { CollectionVideos, SearchResponse } from "../types";
import { fetchCollectionVideos, searchInCollection } from "../api";
import SearchBar from "../components/SearchBar";
import SearchResults from "../components/SearchResults";
import VideoGrid from "../components/VideoGrid";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Skeleton } from "../components/ui/skeleton";
import { AlertCircle, ArrowLeft } from "lucide-react";

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
        <div className="space-y-6">
          <Skeleton className="h-8 w-1/3" />
          <Skeleton className="h-10 w-full max-w-2xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-6">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-destructive">Error</h3>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!videos) {
    return (
      <div className="p-8">
        <Card>
          <CardContent className="p-8 text-center">
            <h1 className="text-2xl font-bold text-foreground">
              Playlist not found
            </h1>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              {videos.collection}
            </h1>
            <p className="text-muted-foreground mt-1">
              {videos.video_count} video{videos.video_count !== 1 ? "s" : ""} •
              Searchable transcripts
            </p>
          </div>
          {showSearch && (
            <Button variant="outline" onClick={clearSearch} className="gap-2">
              <ArrowLeft className="h-4 w-4" />
              Show All Videos
            </Button>
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
