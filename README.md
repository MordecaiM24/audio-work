# YouTube Transcription Pipeline

A (semi) user-friendly pipeline for downloading YouTube playlists, transcribing them with Whisper, and storing searchable chunks in ChromaDB.

## Quick Start

Process a complete YouTube playlist in one command:

```bash
python main.py process --playlist "https://youtube.com/playlist?list=YOUR_ID" --name "my-podcast"
```

Search your transcripts:

```bash
python main.py search --collection "my-podcast" --query "machine learning"
```

## Overview

This pipeline consists of three main stages:

1. **Download** - Downloads YouTube playlist audio as WAV files
2. **Transcribe** - Transcribes audio using Whisper
3. **Database** - Chunks transcripts and stores them in ChromaDB for semantic search

### Dependencies

- Python 3.8+
- `yt-dlp` (YouTube downloader)
- `ffmpeg` (audio processing)
- Whisper CLI binary (compiled from whisper.cpp)
- ChromaDB

### Installation

1. Install Python dependencies:

```bash
pip install -r pipeline/requirements.txt
```

2. Install system dependencies:

```bash
# macOS
brew install yt-dlp ffmpeg

# Ubuntu/Debian
apt-get install yt-dlp ffmpeg

# Or install yt-dlp via pip
pip install yt-dlp
```

3. Set up Whisper CLI:
   - Build whisper.cpp and place the binary at `./build/bin/whisper-cli`
   - Download the model file to `models/ggml-medium.en.bin`
   - (Optional) Convert model to CoreML using the instructions from [GGML](https://github.com/ggml-org/whisper.cpp)

## Usage

### Help and Available Commands

Get help anytime with:

```bash
python main.py --help           # Show all commands
python main.py process --help   # Help for specific command
```

### Quick Start (Recommended)

Use the main orchestrator for a user-friendly experience:

```bash
# Process complete playlist (download → transcribe → index)
python main.py process --playlist "https://youtube.com/playlist?list=YOUR_PLAYLIST_ID" --name "my-podcast"

# Process specific range
python main.py process -p "https://youtube.com/playlist?list=ABC" -n "my-podcast" --start 1 --end 10

# Search your collection
python main.py search --collection "my-podcast" --query "machine learning AI"

# Start the API server
python main.py server --port 8001
```

### Individual Steps

You can also run individual pipeline stages:

#### Step 1: Download YouTube Playlist

```bash
python main.py download --playlist "https://youtube.com/playlist?list=YOUR_PLAYLIST_ID" --name "my-collection"

# With video range
python main.py download -p "URL" -n "my-collection" --start 1 --end 20
```

This creates a folder structure:

```
my-collection/
├── video-title-1/
│   └── video-title-1.wav
├── video-title-2/
│   └── video-title-2.wav
└── ...
```

#### Step 2: Transcribe Audio Files

```bash
python main.py transcribe --collection "my-collection"
```

This adds JSON files with transcription data:

```
my-collection/
├── video-title-1/
│   ├── video-title-1.wav
│   └── video-title-1.json    # ← Transcription data
├── video-title-2/
│   ├── video-title-2.wav
│   └── video-title-2.json
└── ...
```

#### Step 3: Index in ChromaDB

```bash
python main.py index --collection "my-collection"
```

This creates a ChromaDB collection with:

- Text chunks (~1200 characters each)
- Rich metadata (video title, timestamps, offsets)
- Overlap between chunks for better search coverage

#### Step 4: Search Transcripts

```bash
# Search for content
python main.py search --collection "my-collection" --query "machine learning AI"

# Get more results
python main.py search -c "my-collection" -q "Tesla cybertruck" --limit 10
```

Example search output:

```
Search results for: 'machine learning AI'
==================================================

Result 1:
Video: how-does-ai-actually-work
Time: 00:05:30 - 00:05:45
Text: So machine learning is really about pattern recognition. The AI systems we use today are fundamentally different from...

Result 2:
Video: chatgpt-should-creators-be-worried
Time: 00:12:15 - 00:12:30
Text: The advancement in AI and machine learning has been exponential, and now we're seeing tools like ChatGPT that can...
```

### Server Management

Start the servers for client-server mode:

```bash
# Start ChromaDB server (in one terminal)
python main.py chroma-server --port 8000

# Start FastAPI server (in another terminal)
python main.py server --port 8001 --chroma-host localhost --chroma-port 8000
```

### Advanced Usage (Direct Scripts)

For advanced users, you can still use the individual scripts directly:

```bash
# Direct script usage
cd pipeline
python db.py index --collection my-collection --path ../my-collection
python db.py search --collection my-collection --query "search terms"
```

## Current Architecture

### File Organization

```
playlist-name/
├── video-1/
│   ├── video-1.wav          # 16kHz mono audio
│   └── video-1.json         # Whisper transcription
├── video-2/
│   ├── video-2.wav
│   └── video-2.json
└── chroma_db/               # ChromaDB storage
```

### Transcription Format

```json
{
  "transcription": [
    {
      "text": "spoken text",
      "timestamps": { "from": "00:01:30", "to": "00:01:35" },
      "offsets": { "from": 90000, "to": 95000 }
    }
  ]
}
```

### Database Schema

- **Documents**: Text chunks (~1200 chars)
- **IDs**: Sequential chunk numbers
- **Metadata**: Start timestamps, end timestamps, section counts

## Future Improvements

### Client-Server Architecture

The current `db.py` uses ChromaDB in embedded mode. The plan is to migrate to client-server mode with FastAPI:

#### ChromaDB Server

```bash
# Start ChromaDB server
chroma run --path ./chroma_db --port 8000
```

#### FastAPI Service (Available)

We've included a complete FastAPI implementation in `api.py`:

```bash
# Start ChromaDB server
chroma run --host localhost --port 8000 --path ./chroma_db

# Start FastAPI server
uvicorn api:app --host 0.0.0.0 --port 8001 --reload
```

#### API Endpoints

- `GET /` - Health check
- `GET /collections` - List all collections with counts
- `GET /search` - Search transcripts with filters
- `GET /collections/{name}/info` - Collection details
- `GET /collections/{name}/videos` - List videos in collection

#### Client Usage

```bash
# Health check
curl "http://localhost:8001/"

# List collections
curl "http://localhost:8001/collections"

# Search with filters
curl "http://localhost:8001/search?collection=waveform-episodes&query=machine%20learning&limit=3&min_score=0.7"

# Get collection info
curl "http://localhost:8001/collections/waveform-episodes/info"
```

## Configuration

### Audio Processing

- **Sample Rate**: 16kHz (Whisper requirement)
- **Channels**: Mono
- **Format**: 16-bit PCM WAV

### Chunking Strategy

- **Target Size**: ~1200 characters per chunk
- **Overlap**: 2 sections between chunks (sections being Whisper's auto-identified speech cutoffs)
- **Metadata**: Timestamps, offsets, section counts

### Models

- **Whisper Model**: `ggml-medium.en.bin` (English-only, medium size)
- **CoreML**: Automatically used if available (faster on Apple Silicon)

## Troubleshooting

### Common Issues

1. **yt-dlp errors**: Update yt-dlp

   ```bash
   pip install -U yt-dlp
   ```

2. **Whisper CLI not found**: Ensure binary is at `./build/bin/whisper-cli`

3. **Model file missing**: Download from whisper.cpp releases

4. **ChromaDB path issues**: Ensure write permissions for `./chroma_db`

### Performance Tips

- Use CoreML models on Apple Silicon for faster transcription
- Process playlists in smaller batches for large collections
- Monitor disk space (WAV files are (very) large)

## Development

To extend the pipeline:

1. **Custom chunking**: Modify `chunk_transcript_with_overlap()` in `db.py`
2. **Additional metadata**: Add video titles, descriptions, upload dates
3. **Search improvements**: Implement hybrid search (semantic + keyword)
4. **API endpoints**: Add CRUD operations for collections

If you made it this far, you also probably noticed that I lived on the edge and didn't commit till I was many thousands of lines in. Don't be like me. Commit your weekend side projects.
