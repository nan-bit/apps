import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { ArticleView } from "../components/ArticleView";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Article } from "@db/schema";

export function Reader() {
  const { id } = useParams();

  const { data: article } = useQuery<Article>({
    queryKey: ["article", id],
    queryFn: () => fetch(`/api/articles/${id}`).then((res) => res.json()),
  });

  if (!article) return null;

  return (
    <div className="container mx-auto p-4">
      <Button variant="ghost" className="mb-4">
        <ArrowLeft className="mr-2" /> Back to list
      </Button>
      <ArticleView article={article} />
    </div>
  );
}
