import type Command from './command';

const kana = [
  'あ',
  'い',
  'う',
  'え',
  'お',
  'か',
  'き',
  'く',
  'け',
  'こ',
  'さ',
  'し',
  'す',
  'せ',
  'そ',
  'た',
  'ち',
  'つ',
  'て',
  'と',
  'な',
  'に',
  'ぬ',
  'ね',
  'の',
  'は',
  'ひ',
  'ふ',
  'へ',
  'ほ',
  'ま',
  'み',
  'む',
  'め',
  'も',
  'や',
  'ゆ',
  'よ',
  'ら',
  'り',
  'る',
  'れ',
  'ろ',
  'わ',
  'を',
  'ん',
  'が',
  'ぎ',
  'ぐ',
  'げ',
  'ご',
  'ざ',
  'じ',
  'ず',
  'ぜ',
  'ぞ',
  'だ',
  'ぢ',
  'づ',
  'で',
  'ど',
  'ば',
  'び',
  'ぶ',
  'べ',
  'ぼ',
  'ぱ',
  'ぴ',
  'ぷ',
  'ぺ',
  'ぽ'
];

const cmd: Command = {
  name: 'hiragana',
  desc: 'Sends a bunch of random hiragana characters to practice reading',
  usage: '<length?=100>',
  aliases: ['ひりがな'],
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
