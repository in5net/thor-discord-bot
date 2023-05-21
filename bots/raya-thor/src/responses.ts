import { CollectionReference, Timestamp } from 'firebase-admin/firestore';
import trkl from 'trkl';

import { db } from '$services/firebase';

interface RandomResponse {
  words: string[];
  responses: string[];
  chance?: number;
  cooldown?: number;
  sentAt?: Timestamp;
}

export const randomResponsesRef = db.collection(
  'random-responses'
) as CollectionReference<RandomResponse>;

const randomResponses = trkl<(RandomResponse & { id: string })[]>([]);
export default randomResponses;

randomResponsesRef.onSnapshot(({ docs }) =>
  randomResponses(docs.map(doc => ({ ...doc.data(), id: doc.id })))
);
