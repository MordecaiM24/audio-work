import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Youtube, FolderX } from "lucide-react";

interface VideoGridProps {
  videos: string[];
  collectionName: string;
}

export default function VideoGrid({ videos, collectionName }: VideoGridProps) {
  if (videos.length === 0) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <FolderX className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
          <CardTitle className="mb-2">No videos found</CardTitle>
          <CardDescription>
            This playlist doesn't contain any videos yet.
          </CardDescription>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-2">
          Videos in {collectionName}
        </h2>
        <p className="text-sm text-muted-foreground">
          {videos.length} video{videos.length !== 1 ? "s" : ""} available
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {videos.map((video, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center dark:bg-red-900/20">
                    <Youtube className="w-6 h-6 text-red-600 dark:text-red-400" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <CardTitle className="text-sm line-clamp-2 leading-tight">
                    {video}
                  </CardTitle>
                  <CardDescription className="text-xs mt-1">
                    YouTube Video
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  );
}
