import { useEffect, useState } from "react";
import { Menu, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";

const LINKS = [
  { href: "#discover", label: "Discover" },
  { href: "#library", label: "Comics" },
  { href: "#about", label: "About" },
];

export function Wordmark({ className = "" }: { className?: string }) {
  return (
    <span className={`font-display text-2xl tracking-wide ${className}`}>
      Nizhal<span className="text-blood-bright">/</span>Syndrome
    </span>
  );
}

export function Header({ onSearch }: { onSearch: () => void }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const f = () => setScrolled(window.scrollY > 40);
    f();
    window.addEventListener("scroll", f, { passive: true });
    return () => window.removeEventListener("scroll", f);
  }, []);
  useEffect(() => {
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${scrolled || open ? "border-b border-border bg-background/90 backdrop-blur" : ""}`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5 md:px-8">
        <a href="#top" aria-label="Nizhal Syndrome home"><Wordmark /></a>
        <nav aria-label="Primary" className="hidden items-center gap-8 md:flex">
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} className="font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground transition-colors hover:text-foreground">
              {l.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" aria-label="Search the library" onClick={onSearch}>
            <Search className="size-5" />
          </Button>
          <Button asChild variant="blood" className="hidden sm:inline-flex">
            <a href="#library">Enter the Archive</a>
          </Button>
          <Button variant="ghost" size="icon" className="md:hidden" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} aria-controls="mobile-nav" onClick={() => setOpen(!open)}>
            {open ? <X className="size-5" /> : <Menu className="size-5" />}
          </Button>
        </div>
      </div>
      {open && (
        <nav id="mobile-nav" aria-label="Mobile" className="border-t border-border bg-background px-5 pb-8 pt-4 md:hidden">
          {LINKS.map((l, i) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)} className="flex items-baseline gap-4 border-b border-border py-4 font-display text-5xl">
              <span className="font-mono text-xs text-blood-bright">0{i + 1}</span>{l.label}
            </a>
          ))}
          <Button asChild variant="blood" className="mt-6 w-full">
            <a href="#library" onClick={() => setOpen(false)}>Enter the Archive</a>
          </Button>
        </nav>
      )}
    </header>
  );
}
