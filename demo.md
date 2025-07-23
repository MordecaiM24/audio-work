# Demo: YouTube Transcript Pipeline

## One-Command Processing

Process an entire YouTube playlist with a single command:

```bash
# Download, transcribe, and index a podcast playlist
python main.py process \
  --playlist "https://youtube.com/playlist?list=PL70yIS6vx_Y2xaKD3w2qb6Eu06jNBdNJb" \
  --name "waveform-podcast" \
  --start 1 --end 5

# Output:
# 🚀 Starting complete pipeline process...
# ============================================================
#
# 📥 STEP 1: Downloading playlist...
# 🎵 Downloading playlist: https://youtube.com/playlist?list=...
# 📁 Collection name: waveform-podcast
# 📊 Range: videos 1 to 5
# ✅ Download completed! Files saved to: waveform-podcast
#
# 🎤 STEP 2: Transcribing audio...
# 🎤 Transcribing collection: waveform-podcast
# 📊 Found 5 audio files to transcribe
# ✅ Transcription completed!
#
# 🗂️  STEP 3: Indexing in ChromaDB...
# 🗂️  Indexing collection: waveform-podcast
# ✅ Successfully indexed 142 chunks!
#
# 🎉 Pipeline completed successfully!
# 🔍 You can now search with: python main.py search -c waveform-podcast -q "your query"
# 🌐 Or start the server with: python main.py server
```

## Quick Search

Search your indexed content:

```bash
python main.py search --collection "waveform-podcast" --query "Tesla Cybertruck"

# Output:
# 🔍 Searching collection: waveform-podcast
# 🎯 Query: Tesla Cybertruck
#
# Search results for: 'Tesla Cybertruck'
# ==================================================
#
# Result 1:
# Video: tesla-cybertruck-reactions-5g-vs-planes
# Time: 00:05:30 - 00:05:45
# Text: The Tesla Cybertruck is definitely a polarizing vehicle. Some people love the futuristic design...
```

## Start Web Interface

Launch the API server for web access:

```bash
# Terminal 1: Start ChromaDB server
python main.py chroma-server --port 8000

# Terminal 2: Start API server
python main.py server --port 8001

# Now visit: http://localhost:8001/docs for interactive API docs
# Or use the API directly:
curl "http://localhost:8001/search?collection=waveform-podcast&query=Tesla&limit=3"
```

## Individual Commands

Run each step separately if needed:

```bash
# Just download
python main.py download -p "https://youtube.com/playlist?list=ABC" -n "my-collection"

# Just transcribe
python main.py transcribe -c "my-collection"

# Just index
python main.py index -c "my-collection"

# Search with more results
python main.py search -c "my-collection" -q "artificial intelligence" --limit 10
```

## Get Help

```bash
python main.py --help                # Show all commands
python main.py process --help        # Help for process command
python main.py search --help         # Help for search command
```

That's it! The pipeline is now completely user-friendly with no need to edit Python files manually.
