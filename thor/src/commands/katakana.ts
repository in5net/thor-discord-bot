import { command } from '$shared/command';

const kana = [
  'ア',
  'イ',
  'ウ',
  'エ',
  'オ',
  'カ',
  'キ',
  'ク',
  'ケ',
  'コ',
  'サ',
  'シ',
  'ス',
  'セ',
  'ソ',
  'タ',
  'チ',
  'ツ',
  'テ',
  'ト',
  'ナ',
  'ニ',
  'ヌ',
  'ネ',
  'ノ',
  'ハ',
  'ヒ',
  'フ',
  'ヘ',
  'ホ',
  'マ',
  'ミ',
  'ム',
  'メ',
  'モ',
  'ヤ',
  'ユ',
  'ヨ',
  'ラ',
  'リ',
  'ル',
  'レ',
  'ロ',
  'ワ',
  'ヲ',
  'ン',
  'ガ',
  'ギ',
  'グ',
  'ゲ',
  'ゴ',
  'ザ',
  'ジ',
  'ズ',
  'ゼ',
  'ゾ',
  'ダ',
  'ヂ',
  'ヅ',
  'デ',
  'ド',
  'バ',
  'ビ',
  'ブ',
  'ベ',
  'ボ',
  'パ',
  'ピ',
  'プ',
  'ペ',
  'ポ'
];

export default command(
  {
    name: 'katakana',
    aliases: ['カタカナ'],
    desc: 'Sends a bunch of random katakana characters to practice reading',
    args: [
      {
        name: 'length',
        type: 'int',
        desc: 'The number of kana to send',
        default: 100
      }
    ] as const
  },
  async ({ channel }, [length]) => {
    if (length < 1) channel.send('Invalid length');
    const text = new Array(100)
      .fill(0)
      .map(() => kana[Math.floor(Math.random() * kana.length)])
      .join('');
    return channel.send(text);
  }
);
