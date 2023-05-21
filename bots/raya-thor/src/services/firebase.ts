import { cert, initializeApp } from 'firebase-admin/app';
import { initializeFirestore } from 'firebase-admin/firestore';

import { credentials } from 'storage';

const app = initializeApp({
  credential: cert({
    projectId: credentials.project_id,
    clientEmail: credentials.client_email,
    privateKey: credentials.private_key
  })
});
export const db = initializeFirestore(app, { preferRest: true });
db.settings({ ignoreUndefinedProperties: true });
