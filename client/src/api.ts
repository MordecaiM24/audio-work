import type {
  Collection,
  SearchResponse,
  CollectionVideos,
  DiarizationFile,
} from "./types";

const API_BASE_URL = "http://localhost:8001";

export async function fetchCollections(): Promise<Collection[]> {
  const response = await fetch(`${API_BASE_URL}/collections`);
  if (!response.ok) {
    throw new Error("Failed to fetch collections");
  }
  return response.json();
}

export async function searchInCollection(
  collection: string,
  query: string,
  limit: number = 10
): Promise<SearchResponse> {
  const params = new URLSearchParams({
    collection,
    query,
    limit: limit.toString(),
  });

  const response = await fetch(`${API_BASE_URL}/search?${params}`);
  if (!response.ok) {
    throw new Error("Failed to search collection");
  }
  return response.json();
}

export async function fetchCollectionVideos(
  collection: string
): Promise<CollectionVideos> {
  const response = await fetch(
    `${API_BASE_URL}/collections/${collection}/videos`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch collection videos");
  }
  return response.json();
}

export async function fetchDiarization(
  collection: string,
  video: string
): Promise<DiarizationFile> {
  const encoded = encodeURIComponent(video);
  const response = await fetch(
    `${API_BASE_URL}/collections/${collection}/diarization/${encoded}`
  );
  if (!response.ok) {
    throw new Error("Failed to fetch diarization");
  }
  return response.json();
}

export async function saveDiarization(
  collection: string,
  video: string,
  data: DiarizationFile
): Promise<void> {
  const encoded = encodeURIComponent(video);
  const response = await fetch(
    `${API_BASE_URL}/collections/${collection}/diarization/${encoded}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }
  );
  if (!response.ok) {
    throw new Error("Failed to save diarization");
  }
}
