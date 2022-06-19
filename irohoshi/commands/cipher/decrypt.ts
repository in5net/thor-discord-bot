import command from '../command.ts';
import { encrypt } from './encrypt.ts';

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
        desc: 'The message to dencrypt'
      }
    }
  },
  (i, { offset, message }) => i.reply(encrypt(message, -offset))
);
