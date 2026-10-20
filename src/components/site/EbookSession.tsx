import { createContext, useContext, useState, type ReactNode } from "react";
import type { EbookComic } from "@/lib/ebooks";
const Context = createContext<{ demos: EbookComic[]; addDemo: (comic: EbookComic) => void; removeDemo: (id: string) => void }>({ demos: [], addDemo: () => {}, removeDemo: () => {} });
export function EbookSession({ children }: { children: ReactNode }) {
  const [demos, setDemos] = useState<EbookComic[]>([]);
  return <Context.Provider value={{ demos, addDemo: (comic) => setDemos((list) => [comic, ...list]), removeDemo: (id) => setDemos((list) => {
    const comic = list.find((item) => item.id === id);
    if (comic) URL.revokeObjectURL(comic.fileUrl);
    return list.filter((item) => item.id !== id);
  }) }}>{children}</Context.Provider>;
}
export const useEbookSession = () => useContext(Context);