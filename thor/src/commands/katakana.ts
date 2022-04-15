import type Command from './command';

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

const cmd: Command = {
  name: 'katakana',
  desc: 'Sends a bunch of random katakana characters to practice reading',
  usage: '<length?=100>',
  aliases: ['カタカナ'],
  async exec({ channel }, [lengthStr = '100']) {
    const length = parseInt(lengthStr);
    if (isNaN(length) || length < 1) channel.send('Invalid length');
    const text = new Array(100)
      .fill(0)
      .map(() => kana[Math.floor(Math.random() * kana.length)])
      .join('');
    return channel.send(text);
  }
};
export default cmd;
