import type { SearchResult } from "../types";

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  totalFound: number;
}

export default function SearchResults({
  results,
  query,
  totalFound,
}: SearchResultsProps) {
  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
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
        <h3 className="mt-2 text-sm font-medium text-gray-900">
          No results found
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          No transcripts found for "{query}". Try different keywords.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">
          Search Results for "{query}"
        </h2>
        <span className="text-sm text-gray-500">
          {totalFound} result{totalFound !== 1 ? "s" : ""} found
        </span>
      </div>

      <div className="space-y-4">
        {results.map((result) => (
          <div
            key={result.rank}
            className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-medium text-gray-900 flex-1">
                {result.video_title}
              </h3>
              <div className="ml-4 text-right">
                {result.similarity_score && (
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mb-1">
                    {Math.round(result.similarity_score * 100)}% match
                  </span>
                )}
                <div className="text-xs text-gray-500">
                  {result.start_timestamp} - {result.end_timestamp}
                </div>
              </div>
            </div>

            <p className="text-gray-700 text-sm leading-relaxed">
              {result.text}
            </p>

            <div className="mt-3 flex items-center justify-between">
              <span className="text-xs text-gray-500">Rank #{result.rank}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
