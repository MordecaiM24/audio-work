import chromadb
import json
import os
import argparse
from typing import List, Dict, Any


def chunk_transcript_with_overlap(
    transcript_json, target_chars=1200, overlap_sections=2
):
    """
    chunks transcript by grouping sections until target char count,
    with overlap between chunks for better semantic coverage
    """
    transcription = transcript_json["transcription"]
    chunks = []

    i = 0
    while i < len(transcription):
        chunk_sections = []
        chunk_text = ""
        start_offset = transcription[i]["offsets"]["from"]

        # build chunk until we hit target chars or run out of sections
        j = i
        while j < len(transcription) and len(chunk_text) < target_chars:
            chunk_sections.append(transcription[j])
            chunk_text = "".join([section["text"] for section in chunk_sections])
            j += 1

        # get end offset from last section
        end_offset = chunk_sections[-1]["offsets"]["to"]

        chunk = {
            "text": chunk_text.strip(),
            "start_offset": start_offset,
            "end_offset": end_offset,
            "start_timestamp": chunk_sections[0]["timestamps"]["from"],
            "end_timestamp": chunk_sections[-1]["timestamps"]["to"],
            "section_count": len(chunk_sections),
        }
        chunks.append(chunk)

        # advance by chunk size minus overlap
        # if we have fewer sections than overlap, just advance by 1
        advance = max(1, len(chunk_sections) - overlap_sections)
        i += advance

    return chunks


def process_collection(
    collection_path: str, collection_name: str, db_path: str = "./chroma_db"
):
    """
    Process an entire collection folder and add all transcripts to ChromaDB

    Args:
        collection_path: Path to the collection folder (e.g., "waveform")
        collection_name: Name for the ChromaDB collection
        db_path: Path to ChromaDB storage
    """

    # Initialize ChromaDB
    client = chromadb.PersistentClient(path=db_path)

    # Get or create collection
    collection = client.get_or_create_collection(name=collection_name)

    print(f"Processing collection: {collection_path}")
    print(f"ChromaDB collection: {collection_name}")

    all_chunks = []
    all_ids = []
    all_metadatas = []

    chunk_id = 0
    processed_videos = 0

    # Walk through collection folder
    for video_folder in os.listdir(collection_path):
        video_path = os.path.join(collection_path, video_folder)

        if not os.path.isdir(video_path):
            continue

        # Look for JSON transcript file
        json_file = None
        for file in os.listdir(video_path):
            if file.endswith(".json") and not file.endswith(".wav.json"):
                json_file = os.path.join(video_path, file)
                break

        if not json_file:
            print(f"No transcript JSON found in {video_folder}, skipping...")
            continue

        print(f"Processing: {video_folder}")

        try:
            # Load transcript
            with open(json_file, "r", encoding="utf-8") as f:
                transcript_json = json.load(f)

            # Create chunks
            chunks = chunk_transcript_with_overlap(transcript_json)

            # Prepare data for ChromaDB
            for chunk in chunks:
                all_chunks.append(chunk["text"])
                all_ids.append(f"{collection_name}_{chunk_id}")
                all_metadatas.append(
                    {
                        "video_title": video_folder,
                        "start_timestamp": chunk["start_timestamp"],
                        "end_timestamp": chunk["end_timestamp"],
                        "start_offset": chunk["start_offset"],
                        "end_offset": chunk["end_offset"],
                        "section_count": chunk["section_count"],
                    }
                )
                chunk_id += 1

            processed_videos += 1
            print(f"  → Created {len(chunks)} chunks")

        except Exception as e:
            print(f"Error processing {video_folder}: {e}")
            continue

    if all_chunks:
        print(
            f"\nAdding {len(all_chunks)} chunks from {processed_videos} videos to ChromaDB..."
        )

        # Add to ChromaDB in batches (ChromaDB has limits)
        batch_size = 1000
        for i in range(0, len(all_chunks), batch_size):
            batch_end = min(i + batch_size, len(all_chunks))
            print(
                f"Adding batch {i//batch_size + 1}/{(len(all_chunks)-1)//batch_size + 1}"
            )

            collection.add(
                documents=all_chunks[i:batch_end],
                ids=all_ids[i:batch_end],
                metadatas=all_metadatas[i:batch_end],
            )

        print(f"✅ Successfully indexed {len(all_chunks)} chunks!")
    else:
        print("❌ No valid transcripts found to process")

    return collection


def search_collection(
    collection_name: str, query: str, n_results: int = 5, db_path: str = "./chroma_db"
):
    """
    Search the ChromaDB collection

    Args:
        collection_name: Name of the ChromaDB collection
        query: Search query
        n_results: Number of results to return
        db_path: Path to ChromaDB storage
    """
    client = chromadb.PersistentClient(path=db_path)

    try:
        collection = client.get_collection(name=collection_name)
        results = collection.query(query_texts=[query], n_results=n_results)

        print(f"\nSearch results for: '{query}'")
        print("=" * 50)

        for i, (doc, metadata) in enumerate(
            zip(results["documents"][0], results["metadatas"][0])
        ):
            print(f"\nResult {i+1}:")
            print(f"Video: {metadata['video_title']}")
            print(f"Time: {metadata['start_timestamp']} - {metadata['end_timestamp']}")
            print(f"Text: {doc[:200]}...")

        return results

    except Exception as e:
        print(f"Error searching collection: {e}")
        return None


if __name__ == "__main__":
    parser = argparse.ArgumentParser(
        description="Process transcripts and manage ChromaDB"
    )
    parser.add_argument("action", choices=["index", "search"], help="Action to perform")
    parser.add_argument("--collection", "-c", required=True, help="Collection name")
    parser.add_argument("--path", "-p", help="Path to collection folder (for indexing)")
    parser.add_argument("--query", "-q", help="Search query (for searching)")
    parser.add_argument(
        "--results", "-r", type=int, default=5, help="Number of search results"
    )
    parser.add_argument("--db", default="./chroma_db", help="ChromaDB path")

    args = parser.parse_args()

    if args.action == "index":
        if not args.path:
            print("Error: --path is required for indexing")
            exit(1)
        process_collection(args.path, args.collection, args.db)

    elif args.action == "search":
        if not args.query:
            print("Error: --query is required for searching")
            exit(1)
        search_collection(args.collection, args.query, args.results, args.db)


# Example usage (uncomment to run directly):
# process_collection("waveform", "waveform-test")
# search_collection("waveform-test", "marques andrew and david")
