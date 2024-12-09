import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useTheme } from "@/hooks/use-theme";
import { Feed, Article } from "@db/schema";
import { FeedList } from "../components/FeedList";
import { ArticleCard } from "../components/ArticleCard";
import { AddFeedDialog } from "../components/AddFeedDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { MoonIcon, SunIcon } from "lucide-react";
import { articleStorage } from "../lib/indexedDb";

export function Home() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1] || '');
  const sourceId = params.get('source');
  
  const [selectedFeed, setSelectedFeed] = useState<number | null>(() => {
    const params = new URLSearchParams(location.split('?')[1] || '');
    const source = params.get('source');
    
    if (!source) return null;
    if (source === 'bookmarked') return -1;
    const numericId = parseInt(source);
    return isNaN(numericId) ? null : numericId;
  });

  // Update URL when feed selection changes
  const updateUrl = (newFeed: number | null) => {
    const newUrl = newFeed === null 
      ? '/' 
      : newFeed === -1 
        ? '/?source=bookmarked' 
        : `/?source=${newFeed}`;
    window.history.replaceState(null, '', newUrl);
  };

  const handleFeedSelection = (feedId: number | null) => {
    setSelectedFeed(feedId);
    updateUrl(feedId);
  };
  const { theme, setTheme } = useTheme();
  
  const { data: feeds, isLoading: isLoadingFeeds, isError: isFeedsError, error: feedsError } = useQuery<Feed[]>({
    queryKey: ["feeds"],
    queryFn: async () => {
      const response = await fetch("/api/feeds");
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to fetch feeds');
      }
      return response.json();
    },
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  const { 
    data: articles = [], 
    isLoading: isLoadingArticles,
    isError: isArticlesError, 
    error: articlesError,
    refetch: refetchArticles
  } = useQuery<Article[]>({
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
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
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
            {isLoadingFeeds ? (
              <div className="space-y-2">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-8 w-3/4" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-5/6" />
              </div>
            ) : isFeedsError ? (
              <div className="text-center space-y-4">
                <div className="text-destructive">
                  {feedsError instanceof Error ? feedsError.message : 'Failed to load feeds'}
                </div>
                <Button onClick={() => window.location.reload()} variant="outline">
                  Retry
                </Button>
              </div>
            ) : (
              <FeedList
                feeds={feeds || []}
                selectedFeed={selectedFeed}
                onSelectFeed={handleFeedSelection}
              />
            )}
          </aside>

          <main className="md:col-span-3">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {isLoadingArticles ? (
                <>
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="h-48 w-full" />
                      <Skeleton className="h-4 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </>
              ) : isArticlesError ? (
                <div className="col-span-full text-center space-y-4">
                  <div className="text-destructive">
                    {articlesError instanceof Error ? articlesError.message : 'Failed to load articles'}
                  </div>
                  <Button onClick={() => refetchArticles()} variant="outline">
                    Try Again
                  </Button>
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
