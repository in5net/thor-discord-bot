import { FieldValue } from 'firebase-admin/firestore';

import { db } from './firebase';

export const usersRef = db.collection('users');

const incCount = (uid: string, name: string) =>
  usersRef.doc(uid).set(
    {
      counts: {
        [name]: FieldValue.increment(1)
      }
    },
    { merge: true }
  );

export const incWeebCount = (uid: string) => incCount(uid, 'weeb');
export const incSaladMundusCount = (uid: string) =>
  incCount(uid, 'saladMundus');
export const incNoWayCount = (uid: string) => incCount(uid, 'noWay');
