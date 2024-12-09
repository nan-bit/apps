import { Article } from "@db/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { Link } from "wouter";
import { ExternalLink, Bookmark, BookmarkCheck } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface ArticleViewProps {
  article: Article;
}

export function ArticleView({ article }: ArticleViewProps) {
  const queryClient = useQueryClient();

  const bookmarkMutation = useMutation({
    mutationFn: async ({ id, bookmarked }: { id: number; bookmarked: boolean }) => {
      const response = await fetch(`/api/articles/${id}/bookmark`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookmarked }),
      });
      if (!response.ok) throw new Error("Failed to update bookmark");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["articles"] });
      queryClient.invalidateQueries({ queryKey: ["article", article.id.toString()] });
    },
  });

  const toggleBookmark = () => {
    bookmarkMutation.mutate({
      id: article.id,
      bookmarked: !article.bookmarked,
    });
  };

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
