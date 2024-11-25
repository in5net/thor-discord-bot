import OpenAI from "openai";

export const openai = new OpenAI();

export async function filter(input: string): Promise<boolean> {
  const response = await openai.moderations.create({ input });
  return !response.results[0]?.flagged;
}
