import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2 } from "lucide-react";
import { Feed } from "@db/schema";

interface EditFeedDialogProps {
  feed: Feed;
}

export function EditFeedDialog({ feed }: EditFeedDialogProps) {
  const [open, setOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [customTitle, setCustomTitle] = useState(feed.customTitle || feed.title);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const updateFeedMutation = useMutation({
    mutationFn: async ({ id, customTitle }: { id: number; customTitle: string }) => {
      const response = await fetch(`/api/feeds/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customTitle }),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to update feed");
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
      setOpen(false);
      toast({
        title: "Feed updated",
        description: "Feed name has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteFeedMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/feeds/${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete feed");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["feeds"] });
      setDeleteDialogOpen(false);
      toast({
        title: "Feed deleted",
        description: "Feed has been removed successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdate = (e: React.FormEvent) => {
    e.preventDefault();
    updateFeedMutation.mutate({ id: feed.id, customTitle });
  };

  const handleDelete = () => {
    deleteFeedMutation.mutate(feed.id);
  };

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100">
            <Pencil className="h-4 w-4" />
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Feed</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Enter feed name"
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button 
                type="submit" 
                disabled={updateFeedMutation.isPending}
              >
                {updateFeedMutation.isPending ? "Updating..." : "Update"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <Button
          variant="ghost"
          size="icon"
          className="opacity-0 group-hover:opacity-100 ml-1"
          onClick={() => setDeleteDialogOpen(true)}
        >
          <Trash2 className="h-4 w-4 text-destructive" />
        </Button>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Feed</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this feed? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteFeedMutation.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteFeedMutation.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
