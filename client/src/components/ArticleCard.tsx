import { Article } from "@db/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Link } from "wouter";
import { format } from "date-fns";

interface ArticleCardProps {
  article: Article;
}

export function ArticleCard({ article }: ArticleCardProps) {
  return (
    <Link href={`/read/${article.id}`}>
      <Card className="cursor-pointer hover:shadow-lg transition-shadow">
        <CardHeader>
          <CardTitle className="line-clamp-2">{article.title}</CardTitle>
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
