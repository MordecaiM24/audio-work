import type { Collection, SearchResponse, CollectionVideos } from "./types";

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
