#!/usr/bin/env python3
"""
YouTube Transcript Pipeline - Main Orchestrator

A user-friendly command-line interface for the entire YouTube transcription pipeline.
Handles downloading, transcribing, indexing, and server management.

Usage:
    # Process a complete playlist
    python main.py process --playlist "https://youtube.com/playlist?list=..." --name "my-collection"

    # Run individual stages
    python main.py download --playlist "..." --name "my-collection" --start 1 --end 10
    python main.py transcribe --collection "my-collection"
    python main.py index --collection "my-collection"

    # Search without server
    python main.py search --collection "my-collection" --query "machine learning"

    # Start API server
    python main.py server --port 8001

    # Start ChromaDB server
    python main.py chroma-server --port 8000
"""

import argparse
import os
import sys
import subprocess
import time
from pathlib import Path
from typing import Optional

# Add pipeline directory to path so we can import modules
pipeline_dir = Path(__file__).parent / "pipeline"
sys.path.insert(0, str(pipeline_dir))

try:
    from download import process_playlist
    from transcribe import transcribe_playlist
    from db import process_collection, search_collection
except ImportError as e:
    print(f"Error importing pipeline modules: {e}")
    print("Make sure you're running from the project root directory.")
    sys.exit(1)


class PipelineOrchestrator:
    """Main orchestrator for the YouTube transcript pipeline."""

    def __init__(self):
        self.pipeline_dir = Path(__file__).parent / "pipeline"
        self.base_dir = Path(__file__).parent

    def download_playlist(
        self,
        playlist_url: str,
        collection_name: str,
        start: Optional[int] = None,
        end: Optional[int] = None,
    ) -> bool:
        """Download YouTube playlist audio."""
        print(f"🎵 Downloading playlist: {playlist_url}")
        print(f"📁 Collection name: {collection_name}")

        if start or end:
            print(f"📊 Range: videos {start or 1} to {end or 'end'}")

        try:
            result_dir = process_playlist(
                playlist_url=playlist_url, title=collection_name, start=start, end=end
            )

            if result_dir:
                print(f"✅ Download completed! Files saved to: {result_dir}")
                return True
            else:
                print("❌ Download failed!")
                return False

        except Exception as e:
            print(f"❌ Download error: {e}")
            return False

    def transcribe_collection(self, collection_name: str) -> bool:
        """Transcribe all audio files in a collection."""
        collection_path = self.base_dir / collection_name

        if not collection_path.exists():
            print(f"❌ Collection directory not found: {collection_path}")
            return False

        print(f"🎤 Transcribing collection: {collection_name}")
        print(f"📂 Path: {collection_path}")

        # Count audio files
        audio_files = []
        for video_dir in collection_path.iterdir():
            if video_dir.is_dir():
                wav_files = list(video_dir.glob("*.wav"))
                if wav_files:
                    audio_files.extend(wav_files)

        if not audio_files:
            print("❌ No audio files found to transcribe!")
            return False

        print(f"📊 Found {len(audio_files)} audio files to transcribe")

        try:
            transcribe_playlist(str(collection_path))
            print("✅ Transcription completed!")
            return True

        except Exception as e:
            print(f"❌ Transcription error: {e}")
            return False

    def index_collection(self, collection_name: str) -> bool:
        """Index transcripts in ChromaDB."""
        collection_path = self.base_dir / collection_name

        if not collection_path.exists():
            print(f"❌ Collection directory not found: {collection_path}")
            return False

        print(f"🗂️  Indexing collection: {collection_name}")

        try:
            process_collection(
                collection_path=str(collection_path),
                collection_name=collection_name,
                db_path=str(self.pipeline_dir / "chroma_db"),
            )
            print("✅ Indexing completed!")
            return True

        except Exception as e:
            print(f"❌ Indexing error: {e}")
            return False

    def search_transcripts(
        self, collection_name: str, query: str, limit: int = 5
    ) -> bool:
        """Search transcripts."""
        print(f"🔍 Searching collection: {collection_name}")
        print(f"🎯 Query: {query}")

        try:
            results = search_collection(
                collection_name=collection_name,
                query=query,
                n_results=limit,
                db_path=str(self.pipeline_dir / "chroma_db"),
            )
            return results is not None

        except Exception as e:
            print(f"❌ Search error: {e}")
            return False

    def process_complete_pipeline(
        self,
        playlist_url: str,
        collection_name: str,
        start: Optional[int] = None,
        end: Optional[int] = None,
    ) -> bool:
        """Run the complete pipeline: download -> transcribe -> index."""
        print("🚀 Starting complete pipeline process...")
        print("=" * 60)

        # Step 1: Download
        print("\n📥 STEP 1: Downloading playlist...")
        if not self.download_playlist(playlist_url, collection_name, start, end):
            return False

        # Step 2: Transcribe
        print("\n🎤 STEP 2: Transcribing audio...")
        if not self.transcribe_collection(collection_name):
            return False

        # Step 3: Index
        print("\n🗂️  STEP 3: Indexing in ChromaDB...")
        if not self.index_collection(collection_name):
            return False

        print("\n🎉 Pipeline completed successfully!")
        print(
            f'🔍 You can now search with: python main.py search -c {collection_name} -q "your query"'
        )
        print(f"🌐 Or start the server with: python main.py server")

        return True

    def start_chroma_server(self, port: int = 8000, host: str = "localhost") -> None:
        """Start ChromaDB server."""
        chroma_db_path = self.pipeline_dir / "chroma_db"

        print(f"🗄️  Starting ChromaDB server...")
        print(f"📍 Host: {host}:{port}")
        print(f"📂 Database path: {chroma_db_path}")
        print("⏹️  Press Ctrl+C to stop")

        try:
            cmd = [
                "chroma",
                "run",
                "--host",
                host,
                "--port",
                str(port),
                "--path",
                str(chroma_db_path),
            ]
            subprocess.run(cmd, check=True)

        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to start ChromaDB server: {e}")
            print("💡 Make sure ChromaDB is installed: pip install chromadb")
        except KeyboardInterrupt:
            print("\n🛑 ChromaDB server stopped")

    def start_api_server(
        self,
        port: int = 8001,
        host: str = "0.0.0.0",
        chroma_host: str = "localhost",
        chroma_port: int = 8000,
    ) -> None:
        """Start FastAPI server."""
        api_file = self.pipeline_dir / "api.py"

        if not api_file.exists():
            print(f"❌ API file not found: {api_file}")
            return

        print(f"🌐 Starting FastAPI server...")
        print(f"📍 API: http://{host}:{port}")
        print(f"🗄️  ChromaDB: {chroma_host}:{chroma_port}")
        print("⏹️  Press Ctrl+C to stop")

        # Set environment variables for ChromaDB connection
        env = os.environ.copy()
        env["CHROMA_HOST"] = chroma_host
        env["CHROMA_PORT"] = str(chroma_port)

        try:
            cmd = [
                "uvicorn",
                "api:app",
                "--host",
                host,
                "--port",
                str(port),
                "--reload",
            ]
            subprocess.run(cmd, cwd=str(self.pipeline_dir), env=env, check=True)

        except subprocess.CalledProcessError as e:
            print(f"❌ Failed to start API server: {e}")
            print("💡 Make sure FastAPI is installed: pip install fastapi uvicorn")
        except KeyboardInterrupt:
            print("\n🛑 API server stopped")


def main():
    parser = argparse.ArgumentParser(
        description="YouTube Transcript Pipeline - Process playlists and manage servers",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  # Complete pipeline
  python main.py process --playlist "https://youtube.com/playlist?list=ABC" --name "my-podcast"
  
  # Individual steps
  python main.py download --playlist "https://youtube.com/playlist?list=ABC" --name "my-podcast" --start 1 --end 10
  python main.py transcribe --collection "my-podcast"
  python main.py index --collection "my-podcast"
  
  # Search
  python main.py search --collection "my-podcast" --query "machine learning"
  
  # Servers
  python main.py chroma-server --port 8000
  python main.py server --port 8001 --chroma-host localhost --chroma-port 8000
        """,
    )

    subparsers = parser.add_subparsers(dest="command", help="Available commands")

    # Process command (complete pipeline)
    process_parser = subparsers.add_parser("process", help="Run complete pipeline")
    process_parser.add_argument(
        "--playlist", "-p", required=True, help="YouTube playlist URL"
    )
    process_parser.add_argument("--name", "-n", required=True, help="Collection name")
    process_parser.add_argument(
        "--start", "-s", type=int, help="Start video number (1-based)"
    )
    process_parser.add_argument(
        "--end", "-e", type=int, help="End video number (1-based)"
    )

    # Download command
    download_parser = subparsers.add_parser("download", help="Download playlist audio")
    download_parser.add_argument(
        "--playlist", "-p", required=True, help="YouTube playlist URL"
    )
    download_parser.add_argument("--name", "-n", required=True, help="Collection name")
    download_parser.add_argument(
        "--start", "-s", type=int, help="Start video number (1-based)"
    )
    download_parser.add_argument(
        "--end", "-e", type=int, help="End video number (1-based)"
    )

    # Transcribe command
    transcribe_parser = subparsers.add_parser(
        "transcribe", help="Transcribe audio files"
    )
    transcribe_parser.add_argument(
        "--collection", "-c", required=True, help="Collection name"
    )

    # Index command
    index_parser = subparsers.add_parser("index", help="Index transcripts in ChromaDB")
    index_parser.add_argument(
        "--collection", "-c", required=True, help="Collection name"
    )

    # Search command
    search_parser = subparsers.add_parser("search", help="Search transcripts")
    search_parser.add_argument(
        "--collection", "-c", required=True, help="Collection name"
    )
    search_parser.add_argument("--query", "-q", required=True, help="Search query")
    search_parser.add_argument(
        "--limit", "-l", type=int, default=5, help="Number of results"
    )

    # ChromaDB server command
    chroma_parser = subparsers.add_parser("chroma-server", help="Start ChromaDB server")
    chroma_parser.add_argument("--port", type=int, default=8000, help="Server port")
    chroma_parser.add_argument("--host", default="localhost", help="Server host")

    # API server command
    server_parser = subparsers.add_parser("server", help="Start FastAPI server")
    server_parser.add_argument("--port", type=int, default=8001, help="API server port")
    server_parser.add_argument("--host", default="0.0.0.0", help="API server host")
    server_parser.add_argument(
        "--chroma-host", default="localhost", help="ChromaDB host"
    )
    server_parser.add_argument(
        "--chroma-port", type=int, default=8000, help="ChromaDB port"
    )

    args = parser.parse_args()

    if not args.command:
        parser.print_help()
        return

    orchestrator = PipelineOrchestrator()

    if args.command == "process":
        success = orchestrator.process_complete_pipeline(
            playlist_url=args.playlist,
            collection_name=args.name,
            start=args.start,
            end=args.end,
        )
        sys.exit(0 if success else 1)

    elif args.command == "download":
        success = orchestrator.download_playlist(
            playlist_url=args.playlist,
            collection_name=args.name,
            start=args.start,
            end=args.end,
        )
        sys.exit(0 if success else 1)

    elif args.command == "transcribe":
        success = orchestrator.transcribe_collection(args.collection)
        sys.exit(0 if success else 1)

    elif args.command == "index":
        success = orchestrator.index_collection(args.collection)
        sys.exit(0 if success else 1)

    elif args.command == "search":
        success = orchestrator.search_transcripts(
            collection_name=args.collection, query=args.query, limit=args.limit
        )
        sys.exit(0 if success else 1)

    elif args.command == "chroma-server":
        orchestrator.start_chroma_server(port=args.port, host=args.host)

    elif args.command == "server":
        orchestrator.start_api_server(
            port=args.port,
            host=args.host,
            chroma_host=args.chroma_host,
            chroma_port=args.chroma_port,
        )


if __name__ == "__main__":
    main()
