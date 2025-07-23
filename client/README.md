# YouTube Transcript Search Frontend

A React + Tailwind CSS frontend for searching through transcribed YouTube video content.

## Features

- 🎵 **Playlist Browser**: Browse different collections/playlists of YouTube videos
- 🔍 **Semantic Search**: Search through video transcripts with similarity scoring
- 📺 **Video Grid**: Clean, responsive grid layout for video browsing
- ⏱️ **Timestamped Results**: Search results include exact timestamps
- 📱 **Responsive Design**: Works on desktop and mobile devices

## Getting Started

### Prerequisites

Make sure you have the backend API running:

1. Start ChromaDB server:

```bash
cd ../pipeline
chroma run --host localhost --port 8000 --path ./chroma_db
```

2. Start the FastAPI backend:

```bash
cd ../pipeline
uvicorn api:app --host 0.0.0.0 --port 8001 --reload
```

### Running the Frontend

1. Install dependencies:

```bash
npm install
```

2. Start the development server:

```bash
npm run dev
```

3. Open [http://localhost:5173](http://localhost:5173) in your browser

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Layout.tsx      # Main layout with sidebar
│   ├── Sidebar.tsx     # Playlist navigation
│   ├── SearchBar.tsx   # Search input component
│   ├── SearchResults.tsx # Search results display
│   └── VideoGrid.tsx   # Video grid layout
├── pages/              # Route components
│   ├── Landing.tsx     # Home page
│   └── Playlist.tsx    # Playlist detail page
├── api.ts             # API client functions
├── types.ts           # TypeScript type definitions
└── App.tsx            # Main app with routing
```

## API Endpoints

The frontend connects to these backend endpoints:

- `GET /collections` - List all available playlists
- `GET /collections/{name}/videos` - Get videos in a playlist
- `GET /search` - Search transcripts within a collection

## Technologies Used

- **React 19** - Frontend framework
- **TypeScript** - Type safety
- **Tailwind CSS v4** - Styling
- **React Router** - Client-side routing
- **Vite** - Build tool and dev server
