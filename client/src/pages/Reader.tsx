import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArticleView } from "../components/ArticleView";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Article } from "@db/schema";
import { Skeleton } from "@/components/ui/skeleton";

export function Reader() {
  const { id } = useParams();

  const { data: article, isLoading, isError } = useQuery<Article>({
    queryKey: ["article", id],
    queryFn: () => fetch(`/api/articles/${id}`).then((res) => {
      if (!res.ok) throw new Error("Failed to fetch article");
      return res.json();
    }),
  });

  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <Link href="/">
          <Button variant="ghost" className="mb-4">
            <ArrowLeft className="mr-2" /> Back to list
          </Button>
        </Link>
        <div className="text-center text-destructive">
          Failed to load article. Please try again later.
        </div>
      </div>
    );
  }

  if (isLoading || !article) {
    return (
      <div className="container mx-auto p-4">
        <Button variant="ghost" className="mb-4" disabled>
          <ArrowLeft className="mr-2" /> Back to list
        </Button>
        <div className="space-y-4">
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="h-40 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <Link href="/">
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2" /> Back to list
        </Button>
      </Link>
      <ArticleView article={article} />
    </div>
  );
}
