import { FieldValue } from 'firebase-admin/firestore';

import { db } from './firebase';

export interface User {
  weebCount: number;
}

export const usersRef = db.collection(
  'users'
) as FirebaseFirestore.CollectionReference<User>;

const incCount = (uid: string, name: string) =>
  (usersRef as FirebaseFirestore.CollectionReference).doc(uid).set(
    {
      [`counts.${name}`]: FieldValue.increment(1)
    },
    { merge: true }
  );

export const incWeebCount = (uid: string) => incCount(uid, 'weeb');
export const incSaladMundusCount = (uid: string) =>
  incCount(uid, 'saladMundus');
export const incNoWayCount = (uid: string) => incCount(uid, 'noWay');
