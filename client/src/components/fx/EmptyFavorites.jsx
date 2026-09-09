import { Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

export function EmptyFavorites() {
  return (
    <div className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-border py-10 text-center">
      <span className="flex size-11 items-center justify-center rounded-full bg-muted">
        <Star className="size-5 text-muted-foreground" />
      </span>
      <p className="text-sm font-medium">No favorites yet</p>
      <p className="max-w-60 text-xs text-muted-foreground">Save a pair from the converter to reload it in one click.</p>
      <Button size="sm" asChild>
        <Link to="/convert">Open converter</Link>
      </Button>
    </div>
  );
}
