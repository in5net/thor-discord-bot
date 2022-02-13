import { decrypt, encrypt } from './cipher';

const message = 'Hello, World!';
const offset = 5;
const encryptedMessage = encrypt(message, offset);
const decryptedMessage = decrypt(encryptedMessage, offset);

console.log(message, '=', decryptedMessage);
