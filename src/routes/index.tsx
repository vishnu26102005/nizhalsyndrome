import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useRef, useState } from "react";
import { ArrowDown, ArrowUpRight, Search } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Header, Wordmark } from "@/components/site/Header";
import { Reveal } from "@/components/site/Reveal";
import { ComicDialog } from "@/components/site/ComicDialog";
import { Upload } from "@/components/site/Upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { COMICS, GENRES, filterComics, type Comic } from "@/lib/comics";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Nizhal Syndrome — An Underground Horror Comic Archive" },
      { name: "description", content: "Psychological horror, twisted revenge and manga-inspired thrillers. An independent archive of original dark comics." },
      { property: "og:title", content: "Nizhal Syndrome — Every Shadow Has a Story" },
      { property: "og:description", content: "An underground archive of original psychological horror and manga thriller comics." },
    ],
  }),
  component: Index,
});

const SORTS = { featured: "Archive order", az: "Title A–Z", status: "Ongoing first" } as const;

function Index() {
  const [query, setQuery] = useState("");
  const [genre, setGenre] = useState<string>("All");
  const [sort, setSort] = useState<keyof typeof SORTS>("featured");
  const [active, setActive] = useState<Comic | null>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const list = useMemo(() => {
    const r = filterComics(COMICS, query, genre);
    if (sort === "az") return [...r].sort((a, b) => a.title.localeCompare(b.title));
    if (sort === "status") return [...r].sort((a, b) => (a.status === b.status ? 0 : a.status === "Ongoing" ? -1 : 1));
    return r;
  }, [query, genre, sort]);

  const featured = COMICS[0];
  const focusSearch = () => {
    document.getElementById("library")?.scrollIntoView({ behavior: "smooth" });
    setTimeout(() => searchRef.current?.focus({ preventScroll: true }), 500);
  };

  return (
    <div id="top" className="grain overflow-x-clip">
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[70] focus:bg-blood focus:px-4 focus:py-2">Skip to content</a>

      {/* Intro loader */}
      <div aria-hidden className="pointer-events-none fixed inset-0 z-[80] flex flex-col items-center justify-center gap-6 bg-background animate-loader">
        <Wordmark className="text-5xl md:text-7xl" />
        <div className="h-px w-48 bg-border"><div className="h-px w-full bg-blood-bright animate-bar" /></div>
        <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-muted-foreground">Opening the archive</p>
      </div>

      <Header onSearch={focusSearch} />

      <main id="main">
        {/* HERO */}
        <section aria-labelledby="hero-h" className="relative flex min-h-[100svh] items-end overflow-hidden pb-16 pt-28 torn-bottom">
          <img src={hero} alt="A lone figure in a rain-soaked alley beneath a looming shadow with red eyes" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover object-[65%_center] opacity-80 animate-drift" />
          <div className="absolute inset-0 fade-ink" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/60 to-transparent" />
          <div className="absolute inset-0 scanlines opacity-40" />
          <div className="absolute inset-0 beam mix-blend-screen" />

          <div className="relative mx-auto grid w-full max-w-7xl gap-10 px-5 md:px-8 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="flex items-center gap-4">
                <span className="h-px w-10 bg-blood-bright" />
                <p className="font-mono text-xs uppercase tracking-[0.35em] text-blood-bright">An underground comic archive</p>
              </div>
              <h1 id="hero-h" data-text="Every shadow has a story." className="glitch mt-6 max-w-5xl font-display text-[clamp(4rem,13vw,12rem)]">
                Every shadow has a story.
              </h1>
              <p className="mt-8 max-w-xl text-lg text-foreground/85 md:text-xl">
                Psychological horror. Twisted revenge. Stories that stay with you after the final page.
              </p>
              <div className="mt-10 flex flex-wrap gap-4">
                <Button asChild variant="blood" size="xl"><a href="#library">Explore the comics <ArrowDown /></a></Button>
                <Button asChild variant="bone" size="xl"><a href="#about">The Syndrome files</a></Button>
              </div>
            </div>
            <aside aria-label="Issue label" className="hidden flex-col items-end justify-end gap-6 lg:flex">
              <div className="stamp px-4 py-3 text-center text-sm">
                <div className="font-display text-4xl tracking-normal">Vol. 00</div>
                Classified
              </div>
              <dl className="grid grid-cols-2 gap-x-6 gap-y-2 border-l border-blood pl-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                <dt>File</dt><dd className="text-foreground">NZ-0013</dd>
                <dt>Chapter</dt><dd className="text-foreground">Zero</dd>
                <dt>Format</dt><dd className="text-foreground">Ink / Shadow</dd>
              </dl>
            </aside>
          </div>
        </section>

        {/* Marquee */}
        <div aria-hidden className="overflow-hidden border-y border-blood/50 py-3">
          <div className="flex w-max animate-marquee gap-10 font-display text-2xl text-muted-foreground">
            {Array.from({ length: 2 }).flatMap((_, j) =>
              ["Psychological horror", "✕", "Twisted revenge", "✕", "Manga thrillers", "✕", "Creator-made", "✕", "Read at your own risk", "✕"].map((t, i) => (
                <span key={`${j}-${i}`} className={t === "✕" ? "text-blood-bright" : ""}>{t}</span>
              )),
            )}
          </div>
        </div>

        {/* FEATURED */}
        <section id="discover" aria-labelledby="feat-h" className="mx-auto max-w-7xl px-5 py-24 md:px-8">
          <Reveal>
            <p className="font-mono text-xs uppercase tracking-[0.3em] text-blood-bright">Spotlight · 01</p>
          </Reveal>
          <div className="mt-6 grid items-stretch gap-0 border border-border lg:grid-cols-[5fr_6fr]">
            <div className="group relative overflow-hidden">
              <img src={featured.cover} alt={`Cover art for ${featured.title}`} width={768} height={1024} loading="lazy" className="h-full max-h-[720px] w-full object-cover transition-transform duration-700 group-hover:scale-105" />
              <div className="absolute inset-0 scanlines opacity-30" />
              <span className="stamp absolute right-5 top-5 bg-background/70 px-3 py-1 text-xs">18+ Fiction</span>
            </div>
            <Reveal className="flex flex-col justify-between gap-8 bg-card p-8 md:p-12">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground">{featured.issue} · {featured.status}</p>
                <h2 id="feat-h" className="mt-4 font-display text-6xl md:text-8xl">The Forbidden <span className="text-blood-bright">Meal</span></h2>
                <div className="my-6 h-px w-24 bg-blood-bright" />
                <p className="text-lg leading-relaxed text-foreground/90">
                  Once a year, a secret society gathers behind an unmarked door for a meal no one may speak of. When a journalist follows a whispered lead into their candlelit hall, she uncovers forbidden rituals, vanished members — and learns, slowly, the price of curiosity.
                </p>
              </div>
              <div>
                <ul className="flex flex-wrap gap-2" aria-label="Genre tags">
                  {featured.tags.map((t) => (
                    <li key={t} className={`border px-3 py-1 font-mono text-[11px] uppercase tracking-widest ${t.includes("18+") ? "border-blood-bright text-blood-bright" : "border-border text-muted-foreground"}`}>{t}</li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-muted-foreground">Mature themes for adult readers. Dread over gore — the horror lives in what isn't shown.</p>
                <Button variant="blood" size="xl" className="mt-6" onClick={() => setActive(featured)}>Read the synopsis <ArrowUpRight /></Button>
              </div>
            </Reveal>
          </div>
        </section>

        {/* LIBRARY */}
        <section id="library" aria-labelledby="lib-h" className="scroll-mt-16 border-t border-border py-24">
          <div className="mx-auto max-w-7xl px-5 md:px-8">
            <div className="flex flex-wrap items-end justify-between gap-6">
              <div>
                <p className="font-mono text-xs uppercase tracking-[0.3em] text-blood-bright">The archive · 02</p>
                <h2 id="lib-h" className="mt-4 font-display text-6xl md:text-8xl">The library</h2>
              </div>
              <p className="max-w-xs font-mono text-[11px] uppercase leading-relaxed tracking-widest text-muted-foreground">
                Sample entries for demonstration. Covers and synopses are original; no books are downloadable yet.
              </p>
            </div>

            <div className="mt-10 grid gap-4 border-y border-border py-5 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
                <Label className="sr-only" htmlFor="q">Search comics</Label>
                <Input id="q" ref={searchRef} type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search titles & stories…" className="h-11 rounded-none pl-10" />
              </div>
              <div role="group" aria-label="Filter by genre" className="flex flex-wrap gap-2">
                {GENRES.map((g) => (
                  <button key={g} type="button" aria-pressed={genre === g} onClick={() => setGenre(g)}
                    className={`h-11 border px-4 font-mono text-[11px] uppercase tracking-widest transition-colors ${genre === g ? "border-blood bg-blood text-bone" : "border-border text-muted-foreground hover:border-bone hover:text-foreground"}`}>
                    {g}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <label htmlFor="sort" className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Sort</label>
                <select id="sort" value={sort} onChange={(e) => setSort(e.target.value as keyof typeof SORTS)} className="h-11 border border-input bg-background px-3 text-sm">
                  {Object.entries(SORTS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>
            </div>

            <p role="status" aria-live="polite" className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              {list.length} {list.length === 1 ? "file" : "files"} recovered
            </p>

            {list.length === 0 ? (
              <div className="mt-10 border border-dashed border-border p-16 text-center">
                <p className="font-display text-4xl">Nothing in the dark.</p>
                <p className="mt-2 text-muted-foreground">No stories match that search.</p>
                <Button variant="bone" className="mt-6" onClick={() => { setQuery(""); setGenre("All"); }}>Clear filters</Button>
              </div>
            ) : (
              <ul className="mt-8 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((c, i) => (
                  <li key={c.id} className={i % 3 === 1 ? "lg:translate-y-12" : ""}>
                    <Reveal delay={(i % 3) * 90}>
                      <article className="group">
                        <div className="relative overflow-hidden border border-border panel-cut">
                          <img src={c.cover} alt={`Cover art for ${c.title}`} width={768} height={1024} loading="lazy" className="aspect-[3/4] w-full object-cover grayscale-[30%] transition-all duration-700 group-hover:scale-105 group-hover:grayscale-0" />
                          <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
                          <div className="absolute left-3 top-3 flex gap-2">
                            <span className={`px-2 py-1 font-mono text-[10px] uppercase tracking-widest ${c.status === "Ongoing" ? "bg-blood text-bone" : "bg-bone text-ink"}`}>{c.status}</span>
                            {c.mature && <span className="border border-blood-bright bg-background/70 px-2 py-1 font-mono text-[10px] uppercase tracking-widest text-blood-bright">18+</span>}
                          </div>
                          <span className="absolute bottom-3 left-3 font-mono text-[10px] uppercase tracking-[0.25em] text-foreground/80">{c.issue}</span>
                          <span className="absolute bottom-1 right-3 font-display text-6xl text-foreground/15">0{COMICS.indexOf(c) + 1}</span>
                        </div>
                        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.25em] text-blood-bright">{c.genre}</p>
                        <h3 className="mt-2 font-display text-4xl">{c.title}</h3>
                        <p className="mt-2 text-muted-foreground">{c.blurb}</p>
                        <Button variant="bone" className="mt-4" onClick={() => setActive(c)} aria-label={`Read details for ${c.title}`}>Read details <ArrowUpRight /></Button>
                      </article>
                    </Reveal>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        {/* READ THE DARKNESS */}
        <section aria-labelledby="dark-h" className="relative mt-16 overflow-hidden border-y border-blood/60">
          <img src={COMICS[4].cover} alt="" width={768} height={1024} loading="lazy" className="absolute inset-0 h-full w-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/80 to-blood/40" />
          <div className="absolute inset-0 scanlines opacity-50" />
          <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-8 px-5 py-28 md:flex-row md:items-end md:justify-between md:px-8">
            <h2 id="dark-h" className="font-display text-[clamp(4rem,12vw,10rem)]">Read the <span className="text-blood-bright">darkness.</span></h2>
            <div className="max-w-sm">
              <p className="text-lg text-foreground/85">Turn the lights down. Pick a file. Every panel is built to linger in the corner of your eye.</p>
              <Button asChild variant="blood" size="xl" className="mt-6"><a href="#library">Open the library</a></Button>
            </div>
          </div>
        </section>

        {/* ABOUT */}
        <section id="about" aria-labelledby="about-h" className="mx-auto max-w-7xl scroll-mt-16 px-5 py-28 md:px-8">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr]">
            <Reveal>
              <p className="font-mono text-xs uppercase tracking-[0.3em] text-blood-bright">The Syndrome files · 03</p>
              <h2 id="about-h" className="mt-4 font-display text-6xl md:text-8xl">Nizhal means <span className="text-blood-bright">shadow.</span></h2>
            </Reveal>
            <Reveal delay={120} className="space-y-6 text-lg leading-relaxed text-foreground/85">
              <p>Nizhal Syndrome is an independent home for original horror comics, manga-inspired thrillers and creator-made stories — the kind that don't fit neatly on a bestseller shelf.</p>
              <p>We care about atmosphere over shock, character over carnage. Our stories are about what people hide, what they owe, and what follows them home after dark.</p>
              <p className="text-muted-foreground">No algorithms deciding what's scary. Just ink, silence, and a growing archive of voices from the underground.</p>
            </Reveal>
          </div>
          <ol className="mt-20 grid border-t border-border sm:grid-cols-3">
            {[
              ["I", "Original work", "Every story is creator-owned and made for this archive."],
              ["II", "Dread, not gore", "Horror built from tension and implication."],
              ["III", "Clearly labelled", "Mature themes are flagged before you open a file."],
            ].map(([n, t, d]) => (
              <li key={n} className="border-b border-border py-8 sm:border-b-0 sm:border-r sm:px-6 sm:first:pl-0 sm:last:border-r-0">
                <span className="font-display text-5xl text-blood-bright">{n}</span>
                <h3 className="mt-3 font-display text-3xl">{t}</h3>
                <p className="mt-2 text-muted-foreground">{d}</p>
              </li>
            ))}
          </ol>
        </section>

        <Upload />
      </main>

      {/* FOOTER */}
      <footer className="mx-auto max-w-7xl px-5 py-16 md:px-8">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Wordmark className="text-5xl md:text-7xl" />
            <p className="mt-4 max-w-sm text-muted-foreground">An underground comic archive. Every shadow has a story.</p>
          </div>
          <nav aria-label="Footer">
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-blood-bright">Archive</h3>
            <ul className="mt-4 space-y-2">
              {[["#discover", "Discover"], ["#library", "Comics"], ["#about", "About"], ["#create", "For creators"]].map(([h, l]) => (
                <li key={h}><a href={h} className="hover:text-blood-bright">{l}</a></li>
              ))}
            </ul>
          </nav>
          <div>
            <h3 className="font-mono text-xs uppercase tracking-[0.25em] text-blood-bright">Follow the shadow</h3>
            <ul className="mt-4 space-y-2 text-muted-foreground">
              {["Instagram", "X / Twitter", "Discord"].map((s) => (
                <li key={s}>{s} <span className="font-mono text-[10px] uppercase tracking-widest">· coming soon</span></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="mt-14 h-px bg-blood/60" />
        <p className="mt-6 max-w-3xl text-sm text-muted-foreground">
          All stories, characters and artwork are works of fiction. Library entries are sample listings for demonstration. Some titles contain mature psychological themes intended for readers 18+.
        </p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">© {new Date().getFullYear()} Nizhal Syndrome. All rights reserved.</p>
      </footer>

      <ComicDialog comic={active} onClose={() => setActive(null)} />
    </div>
  );
}
