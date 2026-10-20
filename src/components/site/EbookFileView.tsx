import { Download, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ebookFormat } from "@/lib/ebooks";
export function EbookFileView({ url, name }: { url: string; name: string }) {
  const pdf = ebookFormat(name) === "pdf";
  return <section className="mt-6 min-w-0 space-y-4" aria-label="Ebook file">
    {pdf ? <iframe title={`Read ${name}`} src={url} className="h-[65vh] min-h-80 w-full border border-border bg-card" /> :
      <p className="border-l-2 border-blood-bright pl-4 text-muted-foreground">{ebookFormat(name).toUpperCase()} cannot be previewed in this browser. Download the file and open it in a compatible ebook or comic reader.</p>}
    <div className="flex flex-wrap gap-3">
      {pdf && <Button asChild variant="blood"><a href={url} target="_blank" rel="noopener noreferrer">Open PDF <ExternalLink /></a></Button>}
      <Button asChild variant="bone"><a href={url} download={name} target="_blank" rel="noopener noreferrer">Download {ebookFormat(name).toUpperCase()} <Download /></a></Button>
    </div>
  </section>;
}