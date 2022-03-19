import { join } from 'node:path';
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

initializeApp({
  credential: cert(join(__dirname, '../service-account.json'))
});

export const db = getFirestore();
