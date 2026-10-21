import { z } from "zod";
import { draftSchema, ebookSchema } from "./ebooks";
import { MAX_BYTES, validateComicFile } from "./comics";
import { createClient } from "@supabase/supabase-js";
import { publishingUnavailable } from "./ebook-responses";

function connection() {
  const parsed = z.string().url().safeParse(process.env['EBOOK_BACKEND_URL']);
  const key = process.env['EBOOK_BACKEND_API_KEY'];
  if (!parsed.success || !parsed.data.startsWith("https://") || !key) return null;
  return { url: parsed.data.replace(/\/+$/, ""), key };
}
export async function listEbooks() {
  const config = connection();
  if (!config) return { configured: false, uploadUrl: null, ebooks: [], error: null };
  try {
    const response = await fetch(`${config.url}/v1/ebooks?status=published`, { headers: { "X-API-Key": config.key }, signal: AbortSignal.timeout(15000) });
    if (!response.ok) throw new Error("read failed");
    const result = z.object({ ebooks: z.array(ebookSchema).max(1000) }).parse(await response.json());
    return { configured: true, uploadUrl: `${config.url}/v1/creator/ebooks`, ebooks: result.ebooks, error: null };
  } catch { return { configured: true, uploadUrl: `${config.url}/v1/creator/ebooks`, ebooks: [], error: "Published ebooks could not be loaded. Please retry." }; }
}
export async function publishEbook(request: Request) {
  const config = connection();
  if (!config) return publishingUnavailable("Publishing is not configured. MongoDB publishing API and permanent file storage are required. Nothing has been published.", 503);
  const token = request.headers.get("Authorization")?.match(/^Bearer (\S+)$/)?.[1];
  if (!token) return Response.json({ error: "Sign in with a creator or admin account to publish." }, { status: 401 });
  const url = process.env['SUPABASE_URL'];
  const key = process.env['SUPABASE_PUBLISHABLE_KEY'];
  if (!url || !key) return publishingUnavailable("Creator sign-in is not configured.", 503);
  try {
  const auth = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data, error } = await auth.auth.getUser(token);
  if (error || !data.user) return Response.json({ error: "Your session expired. Sign in again." }, { status: 401 });
   if (Number(request.headers.get("content-length") ?? 0) > MAX_BYTES + 1024 * 1024) return Response.json({ error: "File is larger than the 150MB limit." }, { status: 413 });
    // The trusted creator API must verify this bearer and creator/admin role before storing any file.
    const authorization = await fetch(`${config.url}/v1/creator/access`, { headers: { Authorization: `Bearer ${token}`, "X-API-Key": config.key }, signal: AbortSignal.timeout(15000) });
    if (authorization.status === 401 || authorization.status === 403) return Response.json({ error: "This account does not have creator/admin publishing access." }, { status: 403 });
    if (!authorization.ok || (await authorization.json()).allowed !== true) return publishingUnavailable("Creator permissions could not be verified. Publishing was stopped.", 502);
    const form = await request.formData();
    const parsed = draftSchema.safeParse({ title: form.get("title"), genre: form.get("genre"), synopsis: form.get("synopsis") });
    if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Check the required fields." }, { status: 400 });
    const file = form.get("file");
    if (!(file instanceof File)) return Response.json({ error: "Select an ebook file." }, { status: 400 });
    const fileError = validateComicFile(file);
    if (fileError) return Response.json({ error: fileError }, { status: 400 });
    const body = new FormData();
    for (const [name, value] of Object.entries(parsed.data)) body.set(name, value);
    body.set("file", file); body.set("status", "published");
    const response = await fetch(`${config.url}/v1/creator/ebooks`, { method: "POST", headers: { Authorization: `Bearer ${token}`, "X-API-Key": config.key }, body, signal: AbortSignal.timeout(120000) });
    if (!response.ok) return publishingUnavailable(response.status === 403 ? "Creator/admin access is required." : "Publishing failed: the backend could not save the ebook or its file. Nothing was reported as published. Check storage configuration and retry.", 502);
    const result = z.object({ ebook: ebookSchema }).parse(await response.json());
    return Response.json(result, { status: 201, headers: { "Cache-Control": "no-store" } });
  } catch { return publishingUnavailable("Publishing could not be confirmed. Check the publishing connection and storage, then refresh the library before retrying.", 502); }
}