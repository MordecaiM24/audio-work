import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "./components/ui/sidebar";
import { Card, CardContent } from "./components/ui/card";
import { type Collection } from "./types";
import { fetchCollections } from "./api";
import Landing from "./pages/Landing";
import Playlist from "./pages/Playlist";
import Labeler from "./pages/Labeler";
import { Link, useLocation } from "react-router-dom";
import { FolderOpen, Home } from "lucide-react";
import { ThemeProvider } from "./components/theme-provider";
import "./index.css";

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <Router>
        <SidebarProvider>
          <AppSidebar />
          <main className="flex-1 w-full">
            <div className="border-b p-2">
              <SidebarTrigger />
            </div>
            <Routes>
              <Route path="/" element={<Landing />} />
              <Route path="/playlist/:collectionName" element={<Playlist />} />
              <Route
                path="/label/:collectionName/:videoTitle"
                element={<Labeler />}
              />
            </Routes>
          </main>
        </SidebarProvider>
      </Router>
    </ThemeProvider>
  );
}

export default App;

function AppSidebar() {
  const [collections, setCollections] = useState<Collection[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    async function loadCollections() {
      try {
        const data = await fetchCollections();
        setCollections(data);
        setError(null);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load collections"
        );
      } finally {
        setLoading(false);
      }
    }

    loadCollections();
  }, []);

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="border-b">
        <Link to="/" className="flex items-center gap-2 font-bold text-lg">
          YouTube Transcripts
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={location.pathname === "/"}>
                  <Link to="/">
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Playlists</SidebarGroupLabel>
          <SidebarGroupContent>
            {loading ? (
              <div className="p-4">
                <div className="animate-pulse space-y-2">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-8 bg-muted rounded"></div>
                  ))}
                </div>
              </div>
            ) : error ? (
              <Card className="m-2">
                <CardContent className="p-3">
                  <p className="text-sm text-destructive">
                    Error loading playlists
                  </p>
                  <p className="text-xs text-muted-foreground">{error}</p>
                </CardContent>
              </Card>
            ) : (
              <SidebarMenu>
                {collections.map((collection) => {
                  const isActive =
                    location.pathname === `/playlist/${collection.name}`;
                  return (
                    <SidebarMenuItem key={collection.name}>
                      <SidebarMenuButton asChild isActive={isActive}>
                        <Link to={`/playlist/${collection.name}`}>
                          <FolderOpen className="h-4 w-4" />
                          <span className="truncate">{collection.name}</span>
                          <span className="ml-auto text-xs text-muted-foreground">
                            {collection.count}
                          </span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            )}
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
