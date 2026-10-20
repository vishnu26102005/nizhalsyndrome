import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { ArrowLeft, BookOpen } from "lucide-react";
import { Logo } from "@/components/site/Logo";
import { BookmarkButton } from "@/components/site/BookmarkButton";
import { Button } from "@/components/ui/button";
import { COMICS } from "@/lib/comics";

export const Route = createFileRoute("/comics/$id")({
  loader: ({ params }) => {
    const comic = COMICS.find((c) => c.id === params.id);
    if (!comic) throw notFound();
    return comic;
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.title} — Read free on Nizhal Syndrome` },
          { name: "description", content: loaderData.blurb },
          { property: "og:title", content: `${loaderData.title} — Nizhal Syndrome` },
          { property: "og:description", content: loaderData.blurb },
          { property: "og:type", content: "article" },
        ]
      : [{ title: "Story not found — Nizhal Syndrome" }, { name: "robots", content: "noindex" }],
  }),
  component: Reader,
});

function Reader() {
  const c = Route.useLoaderData();
  return (
    <div className="grain min-h-screen">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 md:px-8">
          <Link to="/" hash="library" className="inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> Library
          </Link>
          <Link to="/" aria-label="Nizhal Syndrome home"><Logo className="size-10" /></Link>
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-10 px-5 py-12 md:grid-cols-[2fr_3fr] md:px-8">
        <img src={c.cover} alt={`Cover art for ${c.title}`} width={768} height={1024} className="w-full border border-border panel-cut" />
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.25em] text-blood-bright">{c.genre} · {c.issue} · {c.status}</p>
          <h1 className="mt-3 font-display text-6xl md:text-8xl">{c.title}</h1>
          <p className="mt-4 inline-block border border-bone/50 px-2 py-1 font-mono text-[11px] uppercase tracking-widest">Free to read · no account needed</p>
          {c.mature && <p className="mt-4 border-l-2 border-blood-bright pl-3 text-sm text-muted-foreground">Mature themes for readers 18+. Psychological horror, no graphic gore.</p>}
          <p className="mt-6 text-lg leading-relaxed text-foreground/90">{c.synopsis}</p>
          <div className="mt-8"><BookmarkButton comicId={c.id} /></div>

          <section aria-labelledby="pages-h" className="mt-12 border border-dashed border-border p-8 text-center">
            <BookOpen className="mx-auto size-8 text-blood-bright" aria-hidden />
            <h2 id="pages-h" className="mt-3 font-display text-4xl">Pages not published yet</h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              This is a sample archive entry. Its pages will appear here, free for everyone, once the creator publishes them. Nothing to download yet.
            </p>
            <Button asChild variant="bone" className="mt-6"><Link to="/" hash="library">Back to the library</Link></Button>
          </section>
        </div>
      </main>
    </div>
  );
}
