import { createCommand } from '$shared/command';

export default createCommand(
  {
    name: 'cipher',
    desc: 'Encrypts or decrypts a message using a Caesar cipher with an indexed offset',
    args: [] as const
  },
  ({ channel }) => channel.send('See `thor help cipher`'),
  [
    createCommand(
      {
        name: 'encrypt',
        desc: 'Encrypts a message',
        args: [
          {
            name: 'offset',
            type: 'int',
            desc: 'The offset to use'
          },
          {
            name: 'message',
            type: 'string[]',
            desc: 'The message to encrypt'
          }
        ] as const
      },
      ({ channel }, [offset, words]) =>
        channel.send(encrypt(words.join(' '), offset))
    ),
    createCommand(
      {
        name: 'iencrypt',
        desc: "Encrypts a message in place (removes the original message so others can't see it)",
        args: [
          {
            name: 'offset',
            type: 'int',
            desc: 'The offset to use'
          },
          {
            name: 'message',
            type: 'string[]',
            desc: 'The message to encrypt'
          }
        ] as const
      },
      async (message, [offset, ...words]) => {
        const { channel } = message;
        const text = words.join(' ');
        if (!text) return channel.send('Must provide a message');

        await message.delete();
        return channel.send(encrypt(text, offset));
      }
    ),
    createCommand(
      {
        name: 'decrypt',
        desc: 'Decrypts a message',
        args: [
          {
            name: 'offset',
            type: 'int',
            desc: 'The offset to use'
          },
          {
            name: 'message',
            type: 'string[]',
            desc: 'The message to dencrypt'
          }
        ] as const
      },
      async ({ channel }, [offset, words]) => {
        const text = words.join(' ');
        if (!text) return channel.send('Must provide a message');

        return channel.send(decrypt(text, offset));
      }
    )
  ]
);

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
