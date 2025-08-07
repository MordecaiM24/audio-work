import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { FolderOpen, Search, Clock } from "lucide-react";

export default function Landing() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-foreground mb-4">
          YouTube Transcript Search
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Search through transcribed YouTube video content across different
          playlists. Select a playlist from the sidebar to browse videos and
          search for specific content.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4 dark:bg-blue-900/20">
              <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <CardTitle className="text-lg">Browse Playlists</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Explore organized collections of YouTube videos with transcribed
              content.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4 dark:bg-green-900/20">
              <Search className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <CardTitle className="text-lg">Search Content</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Find specific topics, quotes, or discussions within video
              transcripts.
            </CardDescription>
          </CardContent>
        </Card>

        <Card className="text-center">
          <CardHeader>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4 dark:bg-purple-900/20">
              <Clock className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <CardTitle className="text-lg">Timestamped Results</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Get exact timestamps for when topics are discussed in videos.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-blue-50 border-blue-200 dark:bg-blue-950/20 dark:border-blue-800">
        <CardHeader>
          <CardTitle className="text-blue-900 dark:text-blue-100">
            Getting Started
          </CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-blue-800 dark:text-blue-200 mb-3">
            To start exploring, select a playlist from the sidebar on the left.
            Each playlist contains a collection of videos with searchable
            transcripts.
          </CardDescription>
          <div className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
            <p>• Click on any playlist to view its videos</p>
            <p>
              • Use the search bar to find specific content within a playlist
            </p>
            <p>• Search results include similarity scores and timestamps</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
