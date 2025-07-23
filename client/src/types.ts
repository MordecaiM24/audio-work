export interface Collection {
  name: string;
  count: number;
}

export interface SearchResult {
  rank: number;
  text: string;
  video_title: string;
  start_timestamp: string;
  end_timestamp: string;
  similarity_score?: number;
  metadata: Record<string, any>;
}

export interface SearchResponse {
  results: SearchResult[];
  query: string;
  collection: string;
  total_found: number;
}

export interface CollectionVideos {
  collection: string;
  video_count: number;
  videos: string[];
}
