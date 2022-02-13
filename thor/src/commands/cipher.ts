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

export function encrypt(message: string, offset: number) {
  const codes = message.split('').map((char, i) => {
    const code = char.charCodeAt(0);
    const encryptedCode = code + offset + (offset > 0 ? i : -i);
    return encryptedCode;
  });
  return String.fromCharCode(...codes);
}
export function decrypt(message: string, offset: number) {
  return encrypt(message, -offset);
}
