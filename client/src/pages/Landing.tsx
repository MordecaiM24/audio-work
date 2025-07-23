export default function Landing() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          YouTube Transcript Search
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          Search through transcribed YouTube video content across different
          playlists. Select a playlist from the sidebar to browse videos and
          search for specific content.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-blue-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Browse Playlists
          </h3>
          <p className="text-gray-600">
            Explore organized collections of YouTube videos with transcribed
            content.
          </p>
        </div>

        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Search Content
          </h3>
          <p className="text-gray-600">
            Find specific topics, quotes, or discussions within video
            transcripts.
          </p>
        </div>

        <div className="text-center p-6 bg-gray-50 rounded-lg">
          <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-6 h-6 text-purple-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Timestamped Results
          </h3>
          <p className="text-gray-600">
            Get exact timestamps for when topics are discussed in videos.
          </p>
        </div>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-2">
          Getting Started
        </h2>
        <p className="text-blue-800 mb-3">
          To start exploring, select a playlist from the sidebar on the left.
          Each playlist contains a collection of videos with searchable
          transcripts.
        </p>
        <div className="text-sm text-blue-700">
          <p className="mb-1">• Click on any playlist to view its videos</p>
          <p className="mb-1">
            • Use the search bar to find specific content within a playlist
          </p>
          <p>• Search results include similarity scores and timestamps</p>
        </div>
      </div>
    </div>
  );
}
