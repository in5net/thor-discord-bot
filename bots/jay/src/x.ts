import { readFile } from 'node:fs/promises';

const gpt3DescPath = new URL('../../raya-thor/gpt3-desc.txt', import.meta.url);

const reply = await answer('hello', []);
console.log(reply);

export async function answer(
  prompt: string,
  previous: { question: string; answer: string }[]
): Promise<string> {
  const desc = await readFile(gpt3DescPath, 'utf8');

  const response = await fetch('http://localhost:5000/api/v1/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      prompt: `Raya's Persona: ${desc}
Personality: Creative, clever, funny, kind
<START>
${previous.map(
  ({ question, answer }) => `You: ${question}
Raya: ${answer}
`
)}You: ${prompt}
Raya: `,
      max_new_tokens: 10,
      do_sample: true,
      temperature: 0.65,
      top_p: 0.9,
      typical_p: 1,
      repetition_penalty: 1.1,
      top_k: 0,
      min_length: 0,
      no_repeat_ngram_size: 0,
      num_beams: 1,
      penalty_alpha: 0,
      length_penalty: 1,
      early_stopping: false,
      seed: -1,
      add_bos_token: true,
      truncation_length: 2048,
      ban_eos_token: false,
      skip_special_tokens: true,
      stopping_strings: ['You:']
    })
  });
  const data = (await response.json()) as { results: [{ text: string }] };
  return data.results[0].text;
}
