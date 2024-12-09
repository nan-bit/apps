import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTheme } from "../hooks/use-theme";
import { Feed, Article } from "@db/schema";
import { FeedList } from "../components/FeedList";
import { ArticleCard } from "../components/ArticleCard";
import { AddFeedDialog } from "../components/AddFeedDialog";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon } from "lucide-react";
import { articleStorage } from "../lib/indexedDb";

export function Home() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  const sourceId = params.get('source');
  
  const [selectedFeed, setSelectedFeed] = useState<number | null>(() => {
    if (sourceId === null) return null;
    if (sourceId === 'bookmarked') return -1;
    const numericId = parseInt(sourceId);
    return isNaN(numericId) ? null : numericId;
  });

  useEffect(() => {
    // Persist selected feed to IndexedDB
    if (selectedFeed !== undefined) {
      articleStorage.saveState('selectedFeed', selectedFeed);
    }
  }, [selectedFeed]);

  useEffect(() => {
    // Restore selected feed from IndexedDB if not in URL
    if (sourceId === null) {
      articleStorage.getState<number | null>('selectedFeed')
        .then(saved => {
          if (saved !== null) setSelectedFeed(saved);
        })
        .catch(console.error);
    }
  }, []);
  const { theme, setTheme } = useTheme();
  
  const { data: feeds } = useQuery<Feed[]>({
    queryKey: ["feeds"],
    queryFn: () => fetch("/api/feeds").then((res) => res.json()),
  });

  const { data: articles = [], isError, error } = useQuery<Article[]>({
    queryKey: ["articles", selectedFeed],
    queryFn: async () => {
      const endpoint = selectedFeed === -1 
        ? "/api/articles/bookmarked"
        : `/api/articles${selectedFeed ? `?feedId=${selectedFeed}` : ''}`;
        
      const response = await fetch(endpoint);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch articles');
      }
      return response.json();
    },
  });

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-4">
        <header className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">RSS Reader</h1>
          <div className="flex gap-2">
            <AddFeedDialog />
            <Button variant="outline" size="icon" onClick={toggleTheme}>
              {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            </Button>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <aside className="md:col-span-1">
            <FeedList
              feeds={feeds || []}
              selectedFeed={selectedFeed}
              onSelectFeed={setSelectedFeed}
            />
          </aside>

          <main className="md:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isError ? (
                <div className="col-span-full text-center text-destructive">
                  {error instanceof Error ? error.message : 'Failed to load articles'}
                </div>
              ) : (
                articles.map((article) => (
                  <ArticleCard key={article.id} article={article} selectedFeed={selectedFeed} />
                ))
              )}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
