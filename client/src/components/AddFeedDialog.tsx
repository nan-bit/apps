import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateRssFeed } from "../lib/rssParser";

export function AddFeedDialog() {
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const addFeedMutation = useMutation({
    mutationFn: async (feedUrl: string) => {
      const response = await fetch("/api/feeds", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: feedUrl }),
      });
      if (!response.ok) throw new Error("Failed to add feed");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
      setOpen(false);
      setUrl("");
      toast({
        title: "Feed added successfully",
        description: "Your new RSS feed has been added.",
      });
    },
    onError: () => {
      toast({
        title: "Error adding feed",
        description: "Please check the URL and try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);
    try {
      const validation = await validateRssFeed(url);
      if (validation.isValid) {
        addFeedMutation.mutate(url);
      } else {
        setError(validation.error || "Please enter a valid RSS feed URL.");
      }
    } finally {
      setIsValidating(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onOpenChange={(newOpen) => {
        setOpen(newOpen);
        if (!newOpen) {
          setUrl("");
          setError(null);
          setIsValidating(false);
        }
      }}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Feed
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New RSS Feed</DialogTitle>
          <DialogDescription>
            Enter the URL of an RSS feed you'd like to follow
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              placeholder="Enter RSS feed URL"
              value={url}
              onChange={(e) => {
                setUrl(e.target.value);
                setError(null);
              }}
              aria-invalid={!!error}
            />
            {error && (
              <p className="text-sm text-destructive">{error}</p>
            )}
          </div>
          <Button 
            type="submit" 
            disabled={isValidating || addFeedMutation.isPending || !url.trim()}
          >
            {isValidating 
              ? "Validating..." 
              : addFeedMutation.isPending 
                ? "Adding..." 
                : "Add Feed"
            }
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
