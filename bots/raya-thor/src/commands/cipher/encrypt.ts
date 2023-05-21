import command from '$commands/slash';

export default command(
  {
    desc: 'Encrypts a message using a scanning Caesar cipher',
    options: {
      offset: {
        type: 'int',
        desc: 'The offset to use'
      },
      message: {
        type: 'string',
        desc: 'The message to encrypt'
      }
    }
  },
  async (i, { offset, message }) => {
    await i.deferReply();
    await i.deleteReply();
    await i.channel?.send(encrypt(message, offset));
  }
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

function mod(n: number, m: number) {
  return ((n % m) + m) % m;
}
