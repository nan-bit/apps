import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { validateRssFeed } from "../lib/rssParser";

export function AddFeedDialog() {
  const [url, setUrl] = useState("");
  const [open, setOpen] = useState(false);
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
    if (await validateRssFeed(url)) {
      addFeedMutation.mutate(url);
    } else {
      toast({
        title: "Invalid RSS feed",
        description: "Please enter a valid RSS feed URL.",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Feed
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New RSS Feed</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            placeholder="Enter RSS feed URL"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
          />
          <Button type="submit" disabled={addFeedMutation.isPending}>
            {addFeedMutation.isPending ? "Adding..." : "Add Feed"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
