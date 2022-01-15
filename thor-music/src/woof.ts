export default function woof(): string {
  const arr = [
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
  return arr[Math.floor(Math.random() * arr.length)] || '';
}
