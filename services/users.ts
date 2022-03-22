import { FieldValue } from 'firebase-admin/firestore';

import { db } from './firebase';

export interface User {
  weebCount: number;
}

export const usersRef = db.collection(
  'users'
) as FirebaseFirestore.CollectionReference<User>;

export const incWeebCount = (uid: string) =>
  (usersRef as FirebaseFirestore.CollectionReference).doc(uid).set(
    {
      weebCount: FieldValue.increment(1)
    },
    { merge: true }
  );
