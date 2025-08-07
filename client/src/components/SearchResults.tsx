import type { SearchResult } from "../types";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Badge } from "./ui/badge";
import { Search, Clock } from "lucide-react";

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
      <Card>
        <CardContent className="p-12 text-center">
          <Search className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">No results found</CardTitle>
          <CardDescription>
            No transcripts found for "{query}". Try different keywords.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-foreground">
          Search Results for "{query}"
        </h2>
        <span className="text-sm text-muted-foreground">
          {totalFound} result{totalFound !== 1 ? "s" : ""} found
        </span>
      </div>

      <div className="space-y-4">
        {results.map((result) => (
          <Card key={result.rank} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start gap-4">
                <CardTitle className="text-base line-clamp-2">
                  {result.video_title}
                </CardTitle>
                <div className="flex flex-col gap-2 items-end">
                  {result.similarity_score && (
                    <Badge variant="secondary" className="text-xs">
                      {Math.round(result.similarity_score * 100)}% match
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {result.start_timestamp} - {result.end_timestamp}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="pt-0">
              <CardDescription className="text-sm leading-relaxed text-foreground">
                {result.text}
              </CardDescription>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Rank #{result.rank}
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
