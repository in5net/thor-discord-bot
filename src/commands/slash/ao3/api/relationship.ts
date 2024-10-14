import ORIGIN from "./origin";

const ENDPOINT = `${ORIGIN}/autocomplete/relationship`;

export interface Relationship {
  id: string;
  name: string;
}

type Response = Relationship[];
export async function searchRelationships(term: string) {
  if (!term) return [];
  const url = new URL(ENDPOINT);
  url.searchParams.set("term", term);
  const response = await fetch(url);
  const relationships = (await response.json()) as Response;
  return relationships;
}
