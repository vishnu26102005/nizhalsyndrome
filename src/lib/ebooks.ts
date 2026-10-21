import { z } from "zod";
import { GENRES, MAX_BYTES, validateComicFile, type Comic } from "./comics";
import archiveCover from "@/assets/hero.jpg";

export const draftSchema = z.object({
  title: z.string().trim().min(1, "Enter a story title.").max(80),
  genre: z.enum([GENRES[1], GENRES[2], GENRES[3]]),
  synopsis: z.string().trim().min(1, "Enter a synopsis.").max(400),
});
export const ebookSchema = draftSchema.extend({
  id: z.string().regex(/^[a-zA-Z0-9_-]{1,100}$/),
  status: z.literal("published"),
  fileUrl: z.string().url().refine((url) => url.startsWith("https://"), "Storage must use HTTPS."),
  storageKey: z.string().min(1).max(1024),
  fileName: z.string().min(1).max(255),
  fileSize: z.number().int().positive().max(MAX_BYTES),
  coverUrl: z.string().url().refine((url) => url.startsWith("https://")).optional(),
}).superRefine((data, ctx) => {
  const error = validateComicFile({ name: data.fileName, size: data.fileSize });
  if (error) ctx.addIssue({ code: z.ZodIssueCode.custom, message: error });
});
export type PublishedEbook = z.infer<typeof ebookSchema>;
export type EbookComic = Comic & { fileUrl: string; fileName: string; storageKey?: string };
export function toComic(ebook: PublishedEbook): EbookComic {
  return { id: ebook.id, title: ebook.title, genre: ebook.genre, synopsis: ebook.synopsis, blurb: ebook.synopsis,
    status: "Complete", issue: "Published ebook", mature: false, tags: [ebook.genre], cover: ebook.coverUrl ?? archiveCover,
    fileUrl: ebook.fileUrl, fileName: ebook.fileName, storageKey: ebook.storageKey };
}
export function isEbook(comic: Comic): comic is EbookComic { return "fileUrl" in comic; }
export function ebookFormat(name: string) { return name.split(".").pop()?.toLowerCase() ?? ""; }