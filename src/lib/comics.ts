import forbiddenMeal from "@/assets/cover-forbidden-meal.jpg";
import chapterZero from "@/assets/cover-chapter-zero.jpg";
import hollowWitness from "@/assets/cover-hollow-witness.jpg";
import redThread from "@/assets/cover-red-thread.jpg";
import nocturne from "@/assets/cover-nocturne-13.jpg";
import confession from "@/assets/cover-last-confession.jpg";

export const GENRES = ["All", "Psychological Horror", "Thriller", "Mystery"] as const;
export type Genre = Exclude<(typeof GENRES)[number], "All">;

export type Comic = {
  id: string;
  title: string;
  genre: Genre;
  tags: string[];
  issue: string;
  status: "Ongoing" | "Complete";
  mature: boolean;
  cover: string;
  blurb: string;
  synopsis: string;
};

export const COMICS: Comic[] = [
  {
    id: "forbidden-meal",
    title: "The Forbidden Meal",
    genre: "Psychological Horror",
    tags: ["Psychological Horror", "Mystery", "18+ Fiction"],
    issue: "Issue 01 — 06",
    status: "Ongoing",
    mature: true,
    cover: forbiddenMeal,
    blurb: "A secret society gathers once a year. One journalist got an invitation she was never meant to receive.",
    synopsis:
      "Behind an unmarked door in the old quarter, a society of masked patrons keeps a tradition older than the city itself. When journalist Ira Venkat follows a lead into their candlelit hall, she finds rituals no one will speak of, members who vanish from public record, and a single covered dish at the centre of every table. The deeper she digs, the more the story begins to dig into her. The Forbidden Meal is a slow-burn psychological mystery about obsession, silence, and the price of curiosity — told through dread and suggestion rather than spectacle.",
  },
  {
    id: "chapter-zero",
    title: "Nizhal: Chapter Zero",
    genre: "Psychological Horror",
    tags: ["Psychological Horror", "Origin"],
    issue: "Prologue",
    status: "Complete",
    mature: false,
    cover: chapterZero,
    blurb: "The day a quiet schoolgirl's shadow refused to follow her home.",
    synopsis:
      "Before the Syndrome had a name, there was Meera — and the afternoon her shadow stopped in an empty corridor and did not move when she did. Chapter Zero is the origin of the Nizhal universe: a haunting, single-volume prologue about the parts of ourselves we leave behind, and what happens when they decide to walk on their own.",
  },
  {
    id: "hollow-witness",
    title: "The Hollow Witness",
    genre: "Thriller",
    tags: ["Legal Thriller", "Psychological"],
    issue: "Issue 01 — 04",
    status: "Ongoing",
    mature: true,
    cover: hollowWitness,
    blurb: "The only witness to a crime remembers everything — except his own face.",
    synopsis:
      "A man takes the stand with perfect recall of a night the whole city wants forgotten. The jury sits in shadow. The defence wants him discredited. And each time he testifies, he remembers a little less of who he was before. A courtroom thriller about memory, guilt and the stories we agree to believe.",
  },
  {
    id: "red-thread",
    title: "Red Thread",
    genre: "Thriller",
    tags: ["Revenge", "Thriller"],
    issue: "Issue 01 — 08",
    status: "Complete",
    mature: true,
    cover: redThread,
    blurb: "Fate ties two strangers together. Revenge decides which one gets to cut it.",
    synopsis:
      "Legend says a red thread binds people destined to meet. For Arun and Kael, it binds a debt. Across a sleepless skyline, two strangers are pulled toward each other by a betrayal neither remembers committing. A tense, twisting revenge saga about how the past refuses to stay buried.",
  },
  {
    id: "nocturne-13",
    title: "Nocturne 13",
    genre: "Mystery",
    tags: ["Mystery", "Urban Horror"],
    issue: "Issue 01 — 03",
    status: "Ongoing",
    mature: false,
    cover: nocturne,
    blurb: "Apartment 13 has been empty for twenty years. Someone keeps leaving the door open.",
    synopsis:
      "A night-shift caretaker inherits the keys to a crumbling block and one rule: never answer the knocking from Apartment 13. Each issue is a nocturne — a single night, a single tenant, a single secret leaking out through the red light under the door.",
  },
  {
    id: "last-confession",
    title: "The Last Confession",
    genre: "Mystery",
    tags: ["Mystery", "Gothic"],
    issue: "One-Shot",
    status: "Complete",
    mature: false,
    cover: confession,
    blurb: "A priest hears a confession for a sin that hasn't happened yet.",
    synopsis:
      "On the last night before his chapel closes forever, an ageing priest hears a voice behind the lattice confess to something that will happen at dawn. A gothic one-shot mystery about faith, foreknowledge, and whether a warning can ever be enough.",
  },
];

export function filterComics(list: Comic[], query: string, genre: string) {
  const q = query.trim().toLowerCase();
  return list.filter(
    (c) =>
      (genre === "All" || c.genre === genre) &&
      (!q || c.title.toLowerCase().includes(q) || c.blurb.toLowerCase().includes(q) || c.synopsis.toLowerCase().includes(q)),
  );
}

export const ACCEPTED_EXT = [".pdf", ".epub", ".cbz", ".cbr", ".zip"];
export const MAX_BYTES = 150 * 1024 * 1024;

export function validateComicFile(file: { name: string; size: number }): string | null {
  const ext = file.name.slice(file.name.lastIndexOf(".")).toLowerCase();
  if (!file.name.includes(".") || !ACCEPTED_EXT.includes(ext))
    return `Unsupported file type. Use ${ACCEPTED_EXT.join(", ")}.`;
  if (file.size > MAX_BYTES) return "File is larger than the 150MB limit.";
  if (file.size === 0) return "This file appears to be empty.";
  return null;
}
