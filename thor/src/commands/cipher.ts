import type Command from './command';

const cipher: Command = async (
  { channel },
  [subcmd, offsetStr = '', ...words]
) => {
  const offset = parseInt(offsetStr);
  if (isNaN(offset)) return channel.send('Must provide an offset');

  const message = words.join(' ');
  if (!message) return channel.send('Must provide a message');

  switch (subcmd) {
    case 'encrypt':
      return channel.send(encrypt(message, offset));
    case 'decrypt':
      return channel.send(decrypt(message, offset));
    default:
      return channel.send(`IDK what cipher ${subcmd} is`);
  }
};
export default cipher;

const letters = 'abcdefghijklmnopqrstuvwxyz';

function encrypt(message: string, offset: number, idx = 1) {
  return message
    .toLowerCase()
    .split('')
    .map((char, i) => {
      const index = letters.indexOf(char);
      if (index === -1) return char;
      return letters[(index + offset + i * idx) % letters.length];
    })
    .join('');
}
function decrypt(message: string, offset: number) {
  return encrypt(message, -offset, -1);
}
