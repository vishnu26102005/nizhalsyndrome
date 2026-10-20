import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import type { Comic } from "@/lib/comics";
import { isEbook } from "@/lib/ebooks";

export function ComicDialog({ comic, onClose }: { comic: Comic | null; onClose: () => void }) {
  return (
    <Dialog open={!!comic} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto rounded-none border-blood/60 bg-popover p-0">
        {comic && (
          <div className="grid md:grid-cols-[2fr_3fr]">
            <img src={comic.cover} alt={`Cover art for ${comic.title}`} width={768} height={1024} className="h-64 w-full object-cover md:h-full" />
            <div className="p-6 md:p-8">
              <DialogHeader className="text-left">
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-blood-bright">{comic.issue} · {comic.status}</p>
                <DialogTitle className="font-display text-5xl">{comic.title}</DialogTitle>
                <DialogDescription className="text-muted-foreground">{comic.blurb}</DialogDescription>
              </DialogHeader>
              <div className="my-5 h-px bg-blood/60" />
              <h3 className="mb-2 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">Synopsis</h3>
              <p className="leading-relaxed text-foreground/90">{comic.synopsis}</p>
              <ul className="mt-5 flex flex-wrap gap-2" aria-label="Tags">
                {comic.tags.map((t) => (
                  <li key={t} className={`border px-2 py-1 font-mono text-[11px] uppercase tracking-widest ${t.includes("18+") ? "border-blood-bright text-blood-bright" : "border-border text-muted-foreground"}`}>{t}</li>
                ))}
              </ul>
              {comic.mature && (
                <p className="mt-5 border-l-2 border-blood-bright pl-3 text-sm text-muted-foreground">
                  Mature themes: intended for readers 18+. Contains psychological horror and disturbing situations; no graphic gore.
                </p>
              )}
              <p className="mt-5 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                {isEbook(comic) ? comic.demo ? "Session demo · not public or persisted" : "Published ebook · free for everyone" : "Sample archive entry · no downloadable book attached yet"}
              </p>
              <Button asChild variant="blood" className="mt-5"><Link to="/comics/$id" params={{ id: comic.id }}>Open reader page · free</Link></Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
