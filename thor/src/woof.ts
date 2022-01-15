const replies = [
  'woof',
  'woof woof',
  'arf, arf',
  'BARK',
  'bark bark',
  '*howls*',
  '*pants*',
  'owo',
  'uwu',
  'ruff',
  'RUFF RUFF',
  'WOOF'
];

export default function woof(): string {
  return replies[Math.floor(Math.random() * replies.length)] || '';
}
