import { describe, expect, it } from "vitest";
import { COMICS, filterComics, validateComicFile } from "@/lib/comics";

describe("upload validation", () => {
  it("accepts a 50MB cbz", () => expect(validateComicFile({ name: "a.CBZ", size: 50 * 1024 * 1024 })).toBeNull());
  it("rejects files over 50MB", () => expect(validateComicFile({ name: "a.pdf", size: 50 * 1024 * 1024 + 1 })).not.toBeNull());
  it("rejects other extensions", () => expect(validateComicFile({ name: "a.docx", size: 10 })).not.toBeNull());
});

describe("library filter", () => {
  it("filters by genre", () => expect(filterComics(COMICS, "", "Mystery").map((c) => c.id)).toEqual(["nocturne-13", "last-confession"]));
  it("searches description", () => expect(filterComics(COMICS, "journalist", "All")[0].id).toBe("forbidden-meal"));
});
