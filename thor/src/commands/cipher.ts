import type Command from './command';

const cmd: Command = {
  name: 'cipher',
  desc: 'Encrypts or decrypts a message using a Caesar cipher with an indexed offset',
  exec: message => message.channel.send('See `thor help cipher`'),
  subcommands: [
    {
      name: 'encrypt',
      desc: 'Encrypts a message',
      usage: '<offset> <message>',
      async exec(message, [offsetStr = '', ...words]) {
        const { channel } = message;
        const offset = parseInt(offsetStr);
        if (isNaN(offset)) return channel.send('Must provide an offset');

        const text = words.join(' ');
        if (!text) return channel.send('Must provide a message');

        return channel.send(encrypt(text, offset));
      }
    },
    {
      name: 'iencrypt',
      desc: "Encrypts a message in place (removes the original message so others can't see it)",
      usage: '<offset> <message>',
      async exec(message, [offsetStr = '', ...words]) {
        const { channel } = message;
        const offset = parseInt(offsetStr);
        if (isNaN(offset)) return channel.send('Must provide an offset');

        const text = words.join(' ');
        if (!text) return channel.send('Must provide a message');

        await message.delete();
        return channel.send(encrypt(text, offset));
      }
    },
    {
      name: 'decrypt',
      desc: 'Decrypts a message',
      usage: '<offset> <message>',
      async exec(message, [offsetStr = '', ...words]) {
        const { channel } = message;
        const offset = parseInt(offsetStr);
        if (isNaN(offset)) return channel.send('Must provide an offset');

        const text = words.join(' ');
        if (!text) return channel.send('Must provide a message');

        return channel.send(decrypt(text, offset));
      }
    }
  ]
};
export default cmd;

const spaceCode = ' '.charCodeAt(0);
const tildeCode = '~'.charCodeAt(0);
const codeRange = tildeCode - spaceCode;

export function encrypt(message: string, offset: number) {
  const codes = message.split('').map((char, i) => {
    const code = char.charCodeAt(0);
    const codeFromSpace = code - spaceCode;
    const encryptedCode = codeFromSpace + offset + (offset > 0 ? i : -i);
    return mod(encryptedCode, codeRange) + spaceCode;
  });
  return String.fromCharCode(...codes);
}
export function decrypt(message: string, offset: number) {
  return encrypt(message, -offset);
}

export function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
