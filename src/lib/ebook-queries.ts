import { queryOptions } from "@tanstack/react-query";
import { getPublishedEbooks } from "./ebooks.functions";
export const ebooksQuery = queryOptions({ queryKey: ["published-ebooks"], queryFn: () => getPublishedEbooks(), staleTime: 15000, refetchInterval: 30000, refetchOnWindowFocus: true });