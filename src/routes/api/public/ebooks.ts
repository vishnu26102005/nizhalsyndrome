import { createFileRoute } from "@tanstack/react-router";
export const Route = createFileRoute("/api/public/ebooks")({
  server: { handlers: { POST: async ({ request }) => {
    const { publishEbook } = await import("@/lib/ebooks.server");
    return publishEbook(request);
  } } },
});