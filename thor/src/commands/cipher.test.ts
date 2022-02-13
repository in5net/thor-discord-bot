import { decrypt, encrypt } from './cipher';

const message = "Komi can't communicate";
const offset = 24;
const encryptedMessage = encrypt(message, offset);
const decryptedMessage = decrypt(encryptedMessage, offset);

console.log('message:', message);
console.log('encrypted:', encryptedMessage);
console.log('decrypted:', decryptedMessage);
