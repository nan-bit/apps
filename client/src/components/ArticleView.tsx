import { Article } from "@db/schema";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { format } from "date-fns";
import { Link } from "wouter";
import { ExternalLink } from "lucide-react";

interface ArticleViewProps {
  article: Article;
}

export function ArticleView({ article }: ArticleViewProps) {
  return (
    <Card className="max-w-3xl mx-auto">
      <CardHeader className="space-y-3">
        <CardTitle className="text-3xl font-bold">{article.title}</CardTitle>
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
