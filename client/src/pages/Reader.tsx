import { useQuery } from "@tanstack/react-query";
import { useParams, Link, useLocation } from "wouter";
import { ArticleView } from "../components/ArticleView";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Article } from "@db/schema";
import { Skeleton } from "@/components/ui/skeleton";

export function Reader() {
  const { id } = useParams();
  const [location] = useLocation();
  const params = new URLSearchParams(location.split('?')[1]);
  const source = params.get('source');

  const { data: article, isLoading, isError } = useQuery<Article>({
    queryKey: ["article", id],
    queryFn: async () => {
      if (!id) throw new Error("Article ID is required");
      const response = await fetch(`/api/articles/${id}`);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch article");
      }
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // Keep fresh for 5 minutes
  });

  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <Link href={source ? `/?source=${source}` : '/'}>
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
      <Link href={source ? `/?source=${source}` : '/'}>
        <Button variant="ghost" className="mb-4">
          <ArrowLeft className="mr-2" /> Back to list
        </Button>
      </Link>
      <ArticleView article={article} />
    </div>
  );
}
