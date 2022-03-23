import { FieldValue } from 'firebase-admin/firestore';

import { db } from './firebase';

interface User {
  counts: Record<string, number>;
}

export const usersRef = db.collection(
  'users'
) as FirebaseFirestore.CollectionReference<User>;

export async function getUser(uid: string): Promise<User | undefined> {
  const userRef = usersRef.doc(uid);
  try {
    const user = await userRef.get();
    return user.data();
  } catch (error) {
    return undefined;
  }
}

const incCount = (uid: string, name: string) =>
  (usersRef as FirebaseFirestore.CollectionReference).doc(uid).set(
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
export const incRatioCount = (uid: string) => incCount(uid, 'ratio');
