import ORIGIN from "./origin";

const ENDPOINT = `${ORIGIN}/autocomplete/freeform`;

export interface Tag {
  id: string;
  name: string;
}

type Response = Tag[];
export async function searchTags(term: string) {
  if (!term) {
    return [];
  }
  const url = new URL(ENDPOINT);
  url.searchParams.set("term", term);
  const response = await fetch(url);
  const tags = (await response.json()) as Response;
  return tags;
}
