import { Article } from "@db/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { format } from "date-fns";
import { BookmarkCheck } from "lucide-react";

interface ArticleCardProps {
  article: Article;
  selectedFeed?: number | null;
}

export function ArticleCard({ article, selectedFeed }: ArticleCardProps) {
  if (!article) return null;
  
  return (
    <Link href={`/read/${article.id}?source=${selectedFeed === null ? '' : selectedFeed === -1 ? 'bookmarked' : selectedFeed}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader>
          <div className="flex justify-between items-start gap-2">
            <CardTitle className="line-clamp-2">{article.title}</CardTitle>
            {article.bookmarked && (
              <BookmarkCheck className="h-4 w-4 flex-shrink-0 text-primary" />
            )}
          </div>
          <div className="text-sm text-muted-foreground">
            {format(new Date(article.pubDate), "MMM d, yyyy")}
          </div>
        </CardHeader>
        <CardContent>
          <div
            className="line-clamp-3 text-sm"
            dangerouslySetInnerHTML={{
              __html: article.content.substring(0, 200) + "...",
            }}
          />
        </CardContent>
      </Card>
    </Link>
  );
}
