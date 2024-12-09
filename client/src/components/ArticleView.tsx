import { useState } from "react";
import { Article } from "@db/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { format } from "date-fns";
import { Link } from "wouter";
import { ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

interface ArticleViewProps {
  article: Article;
}

export function ArticleView({ article }: ArticleViewProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isContentError, setIsContentError] = useState(false);

  const bookmarkMutation = useMutation({
    mutationFn: async ({ id, bookmarked }: { id: number; bookmarked: boolean }) => {
      try {
        const response = await fetch(`/api/articles/${id}/bookmark`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ bookmarked }),
        });
        
        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.error || "Failed to update bookmark");
        }
        
        return response.json();
      } catch (error) {
        if (error instanceof Error) {
          throw new Error(`Bookmark failed: ${error.message}`);
        }
        throw new Error('Failed to update bookmark');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["article", article.id.toString()] });
      toast({
        title: "Success",
        description: article.bookmarked ? "Article removed from bookmarks" : "Article bookmarked",
      });
    },
    onError: (error) => {
      console.error('Bookmark error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update bookmark",
        variant: "destructive",
      });
    },
  });

  const toggleBookmark = () => {
    bookmarkMutation.mutate({
      id: article.id,
      bookmarked: !article.bookmarked,
    });
  };

  if (!article) {
    return (
      <Card className="max-w-3xl mx-auto">
        <CardHeader className="space-y-3">
          <Skeleton className="h-8 w-3/4" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-4 w-1/3" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-20 w-5/6" />
            <Skeleton className="h-20 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="space-y-3">
        <CardTitle className="text-3xl font-bold">{article.title}</CardTitle>
        <div className="flex justify-between items-start">
          <div className="flex flex-col space-y-1 text-sm text-muted-foreground">
            <time dateTime={article.pubDate.toString()}>
              {format(new Date(article.pubDate), "MMMM d, yyyy 'at' h:mm a")}
            </time>
            <a
              href={article.link}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary"
            >
              Read original <ExternalLink className="h-3 w-3" />
            </a>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleBookmark}
            disabled={bookmarkMutation.isPending}
          >
            {article.bookmarked ? (
              <BookmarkCheck className="h-5 w-5" />
            ) : (
              <Bookmark className="h-5 w-5" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <article
          className="prose dark:prose-invert max-w-none prose-img:rounded-lg prose-headings:font-semibold prose-a:text-primary hover:prose-a:underline"
          dangerouslySetInnerHTML={{
            __html: article.content.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
          }}
        />
      </CardContent>
    </Card>
  );
}
