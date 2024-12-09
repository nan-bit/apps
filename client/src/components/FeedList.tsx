import { Feed } from "@db/schema";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EditFeedDialog } from "./EditFeedDialog";

interface FeedListProps {
  feeds: Feed[];
  selectedFeed: number | null;
  onSelectFeed: (id: number | null) => void;
}

export function FeedList({ feeds, selectedFeed, onSelectFeed }: FeedListProps) {
  return (
    <ScrollArea className="h-[calc(100vh-8rem)]">
      <Card>
        <CardHeader>
          <CardTitle>Your Feeds</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div
              className={`p-2 rounded cursor-pointer ${
                selectedFeed === null ? "bg-primary/10" : ""
              }`}
              onClick={() => onSelectFeed(null)}
            >
              All Articles
            </div>
            <div
              className={`p-2 rounded cursor-pointer ${
                selectedFeed === -1 ? "bg-primary/10" : ""
              }`}
              onClick={() => onSelectFeed(-1)}
            >
              Bookmarked
            </div>
            {feeds.map((feed) => (
              <div
                key={feed.id}
                className={`p-2 rounded cursor-pointer group flex items-center justify-between ${
                  selectedFeed === feed.id ? "bg-primary/10" : ""
                }`}
              >
                <div onClick={() => onSelectFeed(feed.id)}>
                  {feed.customTitle || feed.title}
                </div>
                <div className="flex">
                  <EditFeedDialog feed={feed} />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </ScrollArea>
  );
}
