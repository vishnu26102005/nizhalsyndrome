import { createServerFn } from "@tanstack/react-start";
import { listEbooks } from "./ebooks.server";
export const getPublishedEbooks = createServerFn({ method: "GET" }).handler(() => listEbooks());