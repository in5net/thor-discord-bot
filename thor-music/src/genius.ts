import { Client } from 'genius-lyrics';
import { config } from 'dotenv';

config();

const client = new Client(process.env.GENIUS_TOKEN);

export async function getLyrics(query: string): Promise<string> {
  const [song] = await client.songs.search(query);
  const lyrics = await song?.lyrics();
  return lyrics || 'No lyrics found';
}
