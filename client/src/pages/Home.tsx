import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useTheme } from "../hooks/use-theme";
import { Feed, Article } from "@db/schema";
import { FeedList } from "../components/FeedList";
import { ArticleCard } from "../components/ArticleCard";
import { AddFeedDialog } from "../components/AddFeedDialog";
import { Button } from "@/components/ui/button";
import { MoonIcon, SunIcon, PlusIcon } from "lucide-react";

export function Home() {
  const [selectedFeed, setSelectedFeed] = useState<number | null>(null);
  const { theme, setTheme } = useTheme();
  
  const { data: feeds } = useQuery<Feed[]>({
    queryKey: ["feeds"],
    queryFn: () => fetch("/api/feeds").then((res) => res.json()),
  });

  const { data: articles } = useQuery<Article[]>({
    queryKey: ["articles", selectedFeed],
    queryFn: () => {
      if (selectedFeed === -1) {
        return fetch("/api/articles/bookmarked").then((res) => res.json());
      }
      return fetch(`/api/articles${selectedFeed ? `?feedId=${selectedFeed}` : ''}`).then((res) => res.json());
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
              {articles?.map((article) => (
                <ArticleCard key={article.id} article={article} />
              ))}
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
