"""
FastAPI implementation for ChromaDB client-server mode.

Usage:
    # Start ChromaDB server
    chroma run --host localhost --port 8000 --path ./chroma_db

    # Start FastAPI server
    uvicorn api:app --host 0.0.0.0 --port 8001 --reload

    # Example requests
    curl "http://localhost:8001/search?collection=waveform-episodes&query=machine%20learning&limit=3"
    curl "http://localhost:8001/collections"
"""

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict, Any, Optional
import chromadb
from pydantic import BaseModel
import os

app = FastAPI(
    title="YouTube Transcript Search API",
    description="Search through transcribed YouTube video content",
    version="1.0.0",
)

# CORS middleware for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Configure appropriately for production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ChromaDB client (will connect to server)
CHROMA_HOST = os.getenv("CHROMA_HOST", "localhost")
CHROMA_PORT = int(os.getenv("CHROMA_PORT", "8000"))

client = chromadb.HttpClient(host=CHROMA_HOST, port=CHROMA_PORT)


class SearchResponse(BaseModel):
    results: List[Dict[str, Any]]
    query: str
    collection: str
    total_found: int


class CollectionInfo(BaseModel):
    name: str
    count: int


@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "message": "YouTube Transcript Search API",
        "status": "running",
        "chroma_host": CHROMA_HOST,
        "chroma_port": CHROMA_PORT,
    }


@app.get("/collections", response_model=List[CollectionInfo])
async def list_collections():
    """List all available collections"""
    try:
        collections = client.list_collections()
        collection_info = []

        for collection in collections:
            coll = client.get_collection(collection.name)
            count = coll.count()
            collection_info.append(CollectionInfo(name=collection.name, count=count))

        return collection_info
    except Exception as e:
        raise HTTPException(
            status_code=500, detail=f"Error listing collections: {str(e)}"
        )


@app.get("/search", response_model=SearchResponse)
async def search_transcripts(
    collection: str = Query(..., description="Collection name to search in"),
    query: str = Query(..., description="Search query text"),
    limit: int = Query(5, ge=1, le=50, description="Number of results to return"),
    min_score: Optional[float] = Query(None, description="Minimum similarity score"),
):
    """
    Search for content in transcripts

    Args:
        collection: The ChromaDB collection name
        query: Search query text
        limit: Maximum number of results (1-50)
        min_score: Optional minimum similarity score filter
    """
    try:
        coll = client.get_collection(collection)
        results = coll.query(query_texts=[query], n_results=limit)

        # Format results
        formatted_results = []
        documents = results.get("documents", [[]])[0]
        metadatas = results.get("metadatas", [[]])[0]
        distances = results.get("distances", [[]])[0]

        for i, (doc, metadata, distance) in enumerate(
            zip(documents, metadatas, distances)
        ):
            # Convert distance to similarity score (lower distance = higher similarity)
            similarity_score = 1 - distance if distance is not None else None

            # Apply minimum score filter if specified
            if min_score is not None and (
                similarity_score is None or similarity_score < min_score
            ):
                continue

            result = {
                "rank": i + 1,
                "text": doc,
                "video_title": metadata.get("video_title", "Unknown"),
                "start_timestamp": metadata.get("start_timestamp", ""),
                "end_timestamp": metadata.get("end_timestamp", ""),
                "similarity_score": (
                    round(similarity_score, 4) if similarity_score else None
                ),
                "metadata": metadata,
            }
            formatted_results.append(result)

        return SearchResponse(
            results=formatted_results,
            query=query,
            collection=collection,
            total_found=len(formatted_results),
        )

    except Exception as e:
        if "does not exist" in str(e).lower():
            raise HTTPException(
                status_code=404, detail=f"Collection '{collection}' not found"
            )
        else:
            raise HTTPException(status_code=500, detail=f"Search error: {str(e)}")


@app.get("/collections/{collection_name}/info")
async def get_collection_info(collection_name: str):
    """Get detailed information about a collection"""
    try:
        collection = client.get_collection(collection_name)
        count = collection.count()

        # Get a sample of documents to show structure
        sample = collection.peek(limit=3)

        return {
            "name": collection_name,
            "count": count,
            "sample_metadata": sample.get("metadatas", [])[:3] if sample else [],
        }
    except Exception as e:
        if "does not exist" in str(e).lower():
            raise HTTPException(
                status_code=404, detail=f"Collection '{collection_name}' not found"
            )
        else:
            raise HTTPException(
                status_code=500, detail=f"Error getting collection info: {str(e)}"
            )


@app.get("/collections/{collection_name}/videos")
async def get_collection_videos(collection_name: str):
    """Get list of unique videos in a collection"""
    try:
        collection = client.get_collection(collection_name)

        # Get all documents to extract unique video titles
        # Note: This is not efficient for large collections - in production,
        # you'd want to store this as separate metadata or use a proper database
        all_data = collection.get()
        metadatas = all_data.get("metadatas", [])

        videos = set()
        for metadata in metadatas:
            if "video_title" in metadata:
                videos.add(metadata["video_title"])

        return {
            "collection": collection_name,
            "video_count": len(videos),
            "videos": sorted(list(videos)),
        }

    except Exception as e:
        if "does not exist" in str(e).lower():
            raise HTTPException(
                status_code=404, detail=f"Collection '{collection_name}' not found"
            )
        else:
            raise HTTPException(
                status_code=500, detail=f"Error getting videos: {str(e)}"
            )


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8001)


# Example usage:
"""
# Start the services
chroma run --host localhost --port 8000 --path ./chroma_db
uvicorn api:app --host 0.0.0.0 --port 8001 --reload

# Test endpoints
curl "http://localhost:8001/"
curl "http://localhost:8001/collections"
curl "http://localhost:8001/search?collection=waveform-episodes&query=machine%20learning&limit=3"
curl "http://localhost:8001/collections/waveform-episodes/info"
curl "http://localhost:8001/collections/waveform-episodes/videos"
"""
