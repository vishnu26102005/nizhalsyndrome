import { describe, expect, it } from "vitest";
import { publishingUnavailable } from "@/lib/ebook-responses";

describe("recoverable publishing errors", () => {
  it("returns missing configuration as explicit failure without a page-level 503", async () => {
    const response = publishingUnavailable("Publishing is not configured.", 503);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ success: false, code: 503, error: "Publishing is not configured." });
    expect(response.headers.get("Cache-Control")).toBe("no-store");
  });
  it("never treats a storage failure as a confirmed published ebook", async () => {
    const result = await publishingUnavailable("File storage unavailable.", 502).json();
    expect(result.success).toBe(false);
    expect(result.ebook).toBeUndefined();
    expect(result.code).toBe(502);
  });
});