import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { z } from "zod";
import { ArrowLeft } from "lucide-react";
import hero from "@/assets/hero.jpg";
import { Logo } from "@/components/site/Logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/hooks/use-session";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in or join — Nizhal Syndrome" },
      { name: "description", content: "Create a free reader account to bookmark stories. Reading on Nizhal Syndrome is always free — no account required." },
      { property: "og:title", content: "Join the archive — Nizhal Syndrome" },
      { property: "og:description", content: "Free reader accounts for bookmarking dark comics. No subscriptions, ever." },
    ],
  }),
  component: AuthPage,
});

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address.").max(255),
  password: z.string().min(8, "Password must be at least 8 characters.").max(72),
});

function friendly(msg: string) {
  const m = msg.toLowerCase();
  if (m.includes("invalid login")) return "That email and password don't match. Try again.";
  if (m.includes("already registered")) return "An account with this email already exists. Sign in instead.";
  if (m.includes("not confirmed")) return "Please confirm your email first — check your inbox for the link.";
  if (m.includes("not allowed") || m.includes("invalid") && m.includes("email")) return "That email address can't receive mail. Please use a real, correctly spelled address.";
  if (m.includes("rate")) return "Too many attempts. Wait a minute and try again.";
  if (m.includes("weak") || m.includes("pwned")) return "That password is too easy to guess. Choose a stronger one.";
  return "Something went wrong. Please try again.";
}

function AuthPage() {
  const nav = useNavigate();
  const { user, ready } = useSession();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotice(null);
    const parsed = schema.safeParse({ email, password });
    if (!parsed.success) return setError(parsed.error.issues[0]?.message ?? "Check your details.");
    setBusy(true);
    if (mode === "signup") {
      const { data, error } = await supabase.auth.signUp({ ...parsed.data, options: { emailRedirectTo: window.location.origin } });
      if (error) setError(friendly(error.message));
      else if (data.user && data.user.identities?.length === 0) setError("An account with this email already exists. Sign in instead.");
      else if (!data.session) setNotice("Almost there — we sent a confirmation link to your email. Open it to activate your account.");
      else nav({ to: "/" });
    } else {
      const { error } = await supabase.auth.signInWithPassword(parsed.data);
      if (error) setError(friendly(error.message));
      else nav({ to: "/" });
    }
    setBusy(false);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <div className="grain grid min-h-screen lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:block">
        <img src={hero} alt="" width={1920} height={1088} className="absolute inset-0 h-full w-full object-cover object-[70%_center]" />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-background" />
        <div className="absolute inset-0 scanlines opacity-40" />
        <p className="absolute bottom-10 left-10 max-w-sm font-display text-6xl">Every shadow has a story.</p>
      </div>

      <main className="flex flex-col justify-center px-6 py-12 sm:px-12">
        <Link to="/" className="mb-10 inline-flex w-fit items-center gap-2 font-mono text-xs uppercase tracking-[0.25em] text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> Back to browsing
        </Link>
        <div className="mx-auto w-full max-w-md">
          <div className="flex items-center gap-4">
            <Logo className="size-16 sm:size-20" />
            <span className="font-display text-3xl">Nizhal<span className="text-blood-bright">/</span>Syndrome</span>
          </div>

          {ready && user ? (
            <div className="mt-10">
              <h1 className="font-display text-6xl">You're in.</h1>
              <p className="mt-4 text-muted-foreground">Signed in as <span className="text-foreground">{user.email}</span>.</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button asChild variant="blood" size="xl"><Link to="/" hash="library">Browse comics</Link></Button>
                <Button variant="bone" size="xl" onClick={signOut}>Sign out</Button>
              </div>
            </div>
          ) : (
            <>
              <h1 className="mt-10 font-display text-6xl">{mode === "signin" ? "Enter the archive." : "Join the archive."}</h1>
              <p className="mt-4 text-muted-foreground">
                Every comic is free to read — no account, subscription or payment needed. A reader account just lets you bookmark stories.
              </p>

              <div role="tablist" aria-label="Account" className="mt-8 grid grid-cols-2 border border-border">
                {(["signin", "signup"] as const).map((m) => (
                  <button key={m} role="tab" aria-selected={mode === m} type="button" onClick={() => { setMode(m); setError(null); setNotice(null); }}
                    className={`h-11 font-mono text-xs uppercase tracking-[0.2em] ${mode === m ? "bg-blood text-bone" : "text-muted-foreground hover:text-foreground"}`}>
                    {m === "signin" ? "Sign in" : "Sign up"}
                  </button>
                ))}
              </div>

              <form onSubmit={submit} noValidate className="mt-6 grid gap-5">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11 rounded-none" required />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <Input id="password" type="password" autoComplete={mode === "signin" ? "current-password" : "new-password"} value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 rounded-none" required minLength={8} />
                  {mode === "signup" && <span className="text-xs text-muted-foreground">At least 8 characters.</span>}
                </div>
                {error && <p role="alert" className="border-l-2 border-destructive pl-3 text-sm text-destructive">{error}</p>}
                {notice && <p role="status" className="border-l-2 border-blood-bright pl-3 text-sm text-foreground">{notice}</p>}
                <Button type="submit" variant="blood" size="xl" disabled={busy}>
                  {busy ? "One moment…" : mode === "signin" ? "Sign in" : "Create free account"}
                </Button>
              </form>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
