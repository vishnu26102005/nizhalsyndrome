import { useEffect, useRef, useState, type DragEvent } from "react";
import { Link } from "@tanstack/react-router";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import { FileUp, RotateCcw, ShieldAlert, CheckCircle2, Loader2, Send } from "lucide-react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ACCEPTED_EXT, GENRES, validateComicFile } from "@/lib/comics";
import { draftSchema, ebookSchema, toComic } from "@/lib/ebooks";
import { ebooksQuery } from "@/lib/ebook-queries";
import { useSession } from "@/hooks/use-session";
import { supabase } from "@/integrations/supabase/client";
import { EbookFileView } from "./EbookFileView";

const fmt = (b: number) => (b >= 1048576 ? `${(b / 1048576).toFixed(1)} MB` : `${(b / 1024).toFixed(0)} KB`);

export function Upload() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [drag, setDrag] = useState(false);
  const [title, setTitle] = useState("");
  const [genre, setGenre] = useState<string>("Psychological Horror");
  const [desc, setDesc] = useState("");
  const [previewed, setPreviewed] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ id: string } | null>(null);
  const { data: connection } = useSuspenseQuery(ebooksQuery);
  const queryClient = useQueryClient();
  const { user } = useSession();

  useEffect(() => {
    if (!file) { setPreviewUrl(null); return; }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  const changed = () => { setPreviewed(false); setResult(null); setError(null); };
  const pick = (f?: File) => {
    if (!f || busy) return;
    changed();
    const err = validateComicFile(f);
    if (err) { setError(err); setFile(null); if (inputRef.current) inputRef.current.value = ""; return; }
    setFile(f);
    if (!title) setTitle(f.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ").slice(0, 80));
  };
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files[0]); };
  const reset = () => {
    setFile(null); setError(null); setTitle(""); setDesc(""); setGenre("Psychological Horror"); setPreviewed(false); setResult(null);
    if (inputRef.current) inputRef.current.value = "";
  };
  const validate = () => {
    if (!file) { setError("Select an ebook file."); return null; }
    const err = validateComicFile(file);
    if (err) { setError(err); return null; }
    const parsed = draftSchema.safeParse({ title, genre, synopsis: desc });
    if (!parsed.success) { setError(parsed.error.issues[0]?.message ?? "Check the required fields."); return null; }
    setError(null);
    return { draft: parsed.data, file };
  };
  const publish = async () => {
    if (busy || result) return;
    const input = validate();
    if (!input) return;
    if (!previewed) { setError("Preview your ebook before publishing."); return; }
    setBusy(true); setError(null);
    try {
        if (!connection.configured || !connection.uploadUrl) throw new Error("Publishing is not connected yet. The website owner must connect the MongoDB publishing service and permanent file storage. Your draft has not been published.");
        const { data } = await supabase.auth.getSession();
        if (!data.session) throw new Error("Sign in to publish your ebook. Reading stays free without an account.");
        const body = new FormData();
        for (const [name, value] of Object.entries(input.draft)) body.set(name, value);
        body.set("file", input.file);
        const response = await fetch(connection.uploadUrl, { method: "POST", headers: { Authorization: `Bearer ${data.session.access_token}` }, body, signal: AbortSignal.timeout(300000) });
        const payload = await response.json();
        const failure = z.object({ success: z.literal(false), error: z.string() }).safeParse(payload);
        if (failure.success) throw new Error(failure.data.error);
        if (!response.ok) throw new Error(z.object({ error: z.string() }).safeParse(payload).data?.error ?? "Publishing failed. Check the backend and file storage connection.");
        const parsed = z.object({ ebook: ebookSchema }).safeParse(payload);
        if (!parsed.success) throw new Error("The backend did not confirm a stored, published ebook. Refresh the library before retrying.");
        // Add only confirmed metadata. The public query must return the same record on refresh.
        queryClient.setQueryData(ebooksQuery.queryKey, (old: typeof connection | undefined) => ({ ...connection, ...old, error: null, ebooks: [parsed.data.ebook, ...(old?.ebooks ?? []).filter((ebook) => ebook.id !== parsed.data.ebook.id)] }));
        await queryClient.invalidateQueries({ queryKey: ebooksQuery.queryKey });
        setResult({ id: toComic(parsed.data.ebook).id });
    } catch (err) { setError(err instanceof Error ? err.message : "Publishing failed. Please retry."); }
    finally { setBusy(false); }
  };

  return <section id="create" aria-labelledby="create-h" className="relative scroll-mt-20 border-y border-border bg-smoke/40 py-24">
    <div className="mx-auto grid max-w-7xl gap-12 px-5 md:px-8 lg:grid-cols-[5fr_7fr]">
      <div>
        <p className="font-mono text-xs uppercase tracking-[0.3em] text-blood-bright">For creators · 07</p>
        <h2 id="create-h" className="mt-4 font-display text-6xl md:text-8xl">Upload an Ebook</h2>
        <p className="mt-6 max-w-md text-lg text-muted-foreground">Your next nightmare starts here. Published ebooks are free for everyone — no reader account required.</p>
        <div role="note" className="mt-8 flex gap-3 border border-blood/60 bg-background/60 p-4 text-sm text-muted-foreground">
          <ShieldAlert className="mt-0.5 size-5 shrink-0 text-blood-bright" aria-hidden />
          {connection.configured ? <p>Everyone with a verified account can publish. Your ebook will be stored permanently and available free on every device.</p> : <p><strong className="text-foreground">Publishing connection required.</strong> MongoDB and permanent file storage are not connected yet. You can prepare and preview a draft, but it will not be published until the connection is ready.</p>}
        </div>
        {!user && <Button asChild variant="bone" className="mt-5"><Link to="/auth">Sign in to publish</Link></Button>}
      </div>
      <form noValidate aria-busy={busy} className="min-w-0 space-y-5 border border-border bg-background p-6 md:p-8 panel-cut" onSubmit={(e) => { e.preventDefault(); if (validate()) setPreviewed(true); }}>
        <fieldset disabled={busy} className="min-w-0 space-y-5">
          <div onDragOver={(e) => { e.preventDefault(); setDrag(true); }} onDragLeave={() => setDrag(false)} onDrop={onDrop}
            className={`relative flex min-w-0 flex-col items-center justify-center gap-3 border-2 border-dashed px-4 py-10 text-center transition-colors ${drag ? "border-blood-bright bg-blood/10" : "border-border"}`}>
            <FileUp className="size-8 text-blood-bright" aria-hidden />
            <p className="max-w-full break-all font-display text-3xl">{file ? file.name : "Drop your comic here"}</p>
            <p className="text-sm text-muted-foreground">{file ? `${fmt(file.size)} · ${file.name.split(".").pop()?.toUpperCase()}` : `${ACCEPTED_EXT.join(" ")} · max 150 MB`}</p>
            <Button type="button" variant="bone" onClick={() => inputRef.current?.click()}>{file ? "Choose another file" : "Browse files"}</Button>
            <input id="comic-file" aria-label="Ebook file" ref={inputRef} type="file" accept={ACCEPTED_EXT.join(",")} className="sr-only" aria-describedby="file-status" onChange={(e) => pick(e.target.files?.[0])} />
            <p id="file-status" role="status" className="text-sm text-muted-foreground">{file ? "File ready for preview." : "No file selected."}</p>
          </div>
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="grid gap-2"><Label htmlFor="s-title">Story title *</Label><Input id="s-title" required maxLength={80} value={title} onChange={(e) => { setTitle(e.target.value); changed(); }} placeholder="e.g. The Quiet Floor" className="rounded-none" /></div>
            <div className="grid gap-2"><Label htmlFor="s-genre">Genre *</Label><select id="s-genre" required value={genre} onChange={(e) => { setGenre(e.target.value); changed(); }} className="h-9 w-full min-w-0 border border-input bg-background px-3 text-sm">{GENRES.filter((g) => g !== "All").map((g) => <option key={g}>{g}</option>)}</select></div>
          </div>
          <div className="grid gap-2"><Label htmlFor="s-desc">Synopsis *</Label><Textarea id="s-desc" required maxLength={400} rows={3} value={desc} onChange={(e) => { setDesc(e.target.value); changed(); }} placeholder="One haunting paragraph about your story." className="rounded-none" /><span className="text-right font-mono text-[11px] text-muted-foreground">{desc.length}/400</span></div>
          <div className="flex flex-wrap gap-3"><Button type="submit" variant="bone">Preview ebook</Button><Button type="button" variant="bone" onClick={reset}><RotateCcw /> Reset draft</Button></div>
        </fieldset>
        {previewed && file && <div className="min-w-0 border-t border-border pt-5">
          <p className="font-mono text-xs uppercase tracking-widest text-blood-bright">Draft preview · not published</p>
          <h3 className="mt-3 break-words font-display text-4xl">{title}</h3><p className="mt-1 text-sm text-blood-bright">{genre}</p><p className="mt-3 break-words text-muted-foreground">{desc}</p>
          {previewUrl && <EbookFileView url={previewUrl} name={file.name} />}
        </div>}
        {error && <p role="alert" className="border-l-2 border-destructive pl-3 text-sm text-destructive">{error}</p>}
        <Button type="button" variant="blood" size="xl" className="w-full whitespace-normal" disabled={busy || !previewed || !!result} onClick={publish}>
          {busy ? <Loader2 className="animate-spin" /> : <Send />} {busy ? "Publishing…" : "PUBLISH EBOOK"}
        </Button>
        {busy && <p role="status" className="text-sm text-muted-foreground">Saving the file and confirming publication…</p>}
        {result && <div role="status" className="space-y-3 border-l-2 border-blood-bright pl-4">
          <p className="flex items-start gap-2 text-sm"><CheckCircle2 className="size-5 shrink-0 text-blood-bright" />Ebook published successfully. Everyone can now read it free.</p>
          <div className="flex flex-wrap gap-3"><Button asChild variant="blood"><Link to="/comics/$id" params={{ id: result.id }}>Read free</Link></Button><Button asChild variant="bone"><a href="#library">View in library</a></Button><Button type="button" variant="bone" onClick={reset}>New draft</Button></div>
        </div>}
      </form>
    </div>
  </section>;
}