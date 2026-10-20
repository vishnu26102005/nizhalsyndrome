import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bookmark, BookmarkCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export function BookmarkButton({ comicId }: { comicId: string }) {
  const { user, ready } = useSession();
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return setSaved(false);
    supabase.from("bookmarks").select("id").eq("comic_id", comicId).maybeSingle().then(({ data }) => setSaved(!!data));
  }, [user, comicId]);

  if (!ready) return null;
  if (!user)
    return (
      <Button asChild variant="bone">
        <Link to="/auth">
          <Bookmark /> Sign in to bookmark
        </Link>
      </Button>
    );

  const toggle = async () => {
    setBusy(true);
    setErr(null);
    const { error } = saved
      ? await supabase.from("bookmarks").delete().eq("comic_id", comicId)
      : await supabase.from("bookmarks").insert({ comic_id: comicId, user_id: user.id });
    if (error) setErr("Couldn't update your bookmark. Try again.");
    else setSaved(!saved);
    setBusy(false);
  };

  return (
    <div>
      <Button variant="bone" onClick={toggle} disabled={busy} aria-pressed={saved}>
        {saved ? <BookmarkCheck /> : <Bookmark />} {saved ? "Bookmarked" : "Bookmark"}
      </Button>
      {err && <p role="alert" className="mt-2 text-sm text-destructive">{err}</p>}
    </div>
  );
}
