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
  const params = new URLSearchParams(location.split('?')[1] || '');
  const source = params.get('source');

  const { data: article, isLoading, isError, error, refetch } = useQuery<Article>({
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
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 10000),
  });

  // Back button is always rendered to maintain navigation
  const BackButton = () => (
    <Link href={source ? `/?source=${source}` : '/'}>
      <Button variant="ghost" className="mb-4" disabled={isLoading}>
        <ArrowLeft className="mr-2" /> Back to list
      </Button>
    </Link>
  );

  // Loading state with skeleton
  if (isLoading || !article) {
    return (
      <div className="container mx-auto p-4">
        <BackButton />
        <div className="max-w-3xl mx-auto">
          <div className="space-y-4">
            <Skeleton className="h-12 w-3/4" />
            <div className="flex justify-between items-center">
              <Skeleton className="h-4 w-1/4" />
              <Skeleton className="h-8 w-8 rounded-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-20 w-5/6" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Error state with retry button
  if (isError) {
    return (
      <div className="container mx-auto p-4">
        <BackButton />
        <div className="max-w-3xl mx-auto text-center space-y-4">
          <div className="text-destructive font-medium">
            {error instanceof Error ? error.message : "Failed to load article"}
          </div>
          <Button onClick={() => refetch()} variant="outline">
            Try Again
          </Button>
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
