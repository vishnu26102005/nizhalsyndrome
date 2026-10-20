// Expected publishing failures are recoverable action results, not page failures.
export function publishingUnavailable(error: string, code: 502 | 503) {
  return Response.json({ success: false, code, error }, {
    status: 200,
    headers: { "Cache-Control": "no-store" },
  });
}