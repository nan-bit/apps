import { Article } from "@db/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";

interface ArticleViewProps {
  article: Article;
}

export function ArticleView({ article }: ArticleViewProps) {
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader>
        <CardTitle>{article.title}</CardTitle>
        <div className="text-sm text-muted-foreground">
          {format(new Date(article.pubDate), "MMMM d, yyyy")}
        </div>
      </CardHeader>
      <CardContent>
        <div
          className="prose dark:prose-invert max-w-none"
          dangerouslySetInnerHTML={{ __html: article.content }}
        />
      </CardContent>
    </Card>
  );
}
