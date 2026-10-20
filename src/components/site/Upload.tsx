import { useRef, useState, type DragEvent } from "react";
import { FileUp, RotateCcw, ShieldAlert, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ACCEPTED_EXT, GENRES, validateComicFile } from "@/lib/comics";

const fmt = (b: number) => (b > 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`);

export function Upload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState("Psychological Horror");
  const [desc, setDesc] = useState("");
  const [previewed, setPreviewed] = useState(false);

  const pick = (f?: File) => {
    if (!f) return;
    const err = validateComicFile(f);
    setPreviewed(false);
    if (err) { setError(err); setFile(null); if (inputRef.current) inputRef.current.value = ""; return; }
    setError(null);
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " "));
  };
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); };
  const reset = () => {
    setFile(null); setError(null); setTitle(""); setDesc(""); setGenre("Psychological Horror"); setPreviewed(false);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <section id="create" aria-labelledby="create-h" className="relative border-y border-border bg-smoke/40 py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[5fr_7fr]">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-blood-bright">For creators · 07</p>
          <h2 id="create-h" className="mt-4 font-display text-6xl md:text-8xl">Your next nightmare starts here.</h2>
          <p className="mt-6 max-w-md text-lg text-muted-foreground">
            Bring your comic ebook — EPUB, PDF, CBZ, CBR or ZIP up to 50MB. Shape the title, genre and pitch, and see how it would sit in the archive.
          </p>
          <div role="note" className="mt-8 flex gap-3 border border-blood/60 bg-background/60 p-4 text-sm text-muted-foreground">
            <ShieldAlert className="mt-0.5 size-5 shrink-0 text-blood-bright" aria-hidden />
            <p><strong className="text-foreground">Local preview only.</strong> Your file never leaves this browser and is not published or stored. Permanent public uploads need a connected backend, which this demo doesn't have yet.</p>
          </div>
        </div>

        <form className="grid gap-5 border border-border bg-background p-6 md:p-8 panel-cut" onSubmit={(e) => { e.preventDefault(); if (file && title.trim()) setPreviewed(true); }}>
          <div
            onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
            onDragLeave={() => setDrag(false)}
            onDrop={onDrop}
            className={`relative flex flex-col items-center justify-center gap-3 border-2 border-dashed px-6 py-10 text-center transition-colors ${drag ? "border-blood-bright bg-blood/10" : error ? "border-destructive" : "border-border hover:border-muted-foreground"}`}
          >
            <FileUp className="size-8 text-blood-bright" aria-hidden />
            <p className="font-display text-3xl">{file ? file.name : "Drop your comic here"}</p>
            <p className="text-sm text-muted-foreground">{file ? `${fmt(file.size)} · ${file.name.split(".").pop()?.toUpperCase()}` : `${ACCEPTED_EXT.join(" ")} · max 50MB`}</p>
            <Label htmlFor="comic-file" className="cursor-pointer border border-bone/60 px-4 py-2 font-mono text-xs uppercase tracking-[0.2em] hover:bg-bone hover:text-ink focus-within:outline">
              {file ? "Choose another file" : "Browse files"}
            </Label>
            <input id="comic-file" ref={inputRef} type="file" accept={ACCEPTED_EXT.join(",")} className="sr-only" aria-describedby="file-status" onChange={(e) => pick(e.target.files?.[0])} />
            <p id="file-status" role="status" aria-live="polite" className={`text-sm ${error ? "text-destructive" : "text-muted-foreground"}`}>
              {error ?? (file ? "File ready for local preview." : "No file selected.")}
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="s-title">Story title</Label>
              <Input id="s-title" required maxLength={80} value={title} onChange={(e) => { setTitle(e.target.value); setPreviewed(false); }} placeholder="e.g. The Quiet Floor" className="rounded-none" />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="s-genre">Genre</Label>
              <select id="s-genre" value={genre} onChange={(e) => { setGenre(e.target.value); setPreviewed(false); }} className="h-9 border border-input bg-background px-3 text-sm">
                {GENRES.filter((g) => g !== "All").map((g) => <option key={g}>{g}</option>)}
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="s-desc">Description</Label>
            <Textarea id="s-desc" maxLength={400} rows={3} value={desc} onChange={(e) => { setDesc(e.target.value); setPreviewed(false); }} placeholder="One haunting paragraph about your story." className="rounded-none" />
            <span className="text-right font-mono text-[11px] text-muted-foreground">{desc.length}/400</span>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" variant="blood" size="xl" disabled={!file || !title.trim()}>Preview listing</Button>
            <Button type="button" variant="bone" size="xl" onClick={reset}><RotateCcw /> Reset</Button>
          </div>

          {previewed && file && (
            <div role="status" className="border border-blood/60 bg-card p-5">
              <p className="flex items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-blood-bright"><CheckCircle2 className="size-4" /> Local preview · not published</p>
              <h3 className="mt-3 font-display text-4xl">{title}</h3>
              <p className="mt-1 font-mono text-xs uppercase tracking-widest text-muted-foreground">{genre} · {file.name} · {fmt(file.size)}</p>
              <p className="mt-3 text-foreground/90">{desc || "No description yet."}</p>
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
