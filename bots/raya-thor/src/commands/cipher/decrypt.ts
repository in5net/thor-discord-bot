import command from '$commands/slash';
import { encrypt } from './encrypt';

export default command(
  {
    desc: 'Decrypts a message using a scanning Caesar cipher',
    options: {
      offset: {
        type: 'int',
        desc: 'The offset to use'
      },
      message: {
        type: 'string',
        desc: 'The message to decrypt'
      }
    }
  },
  (i, { offset, message }) => i.reply(encrypt(message, -offset))
);
