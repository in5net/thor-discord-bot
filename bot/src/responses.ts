import { firestore } from "$lib/firebase";
import {
	type CollectionReference,
	type DocumentReference,
	type Timestamp,
} from "firebase-admin/firestore";
import trkl from "trkl";

interface RandomResponse {
	words: string[];
	responses: string[];
	chance?: number;
	cooldown?: number;
	sentAt?: Timestamp;
}

export const randomResponsesRef = firestore.collection(
	"random-responses",
) as CollectionReference<RandomResponse>;

const randomResponses = trkl<Array<RandomResponse & { id: string }>>([]);
export default randomResponses;

randomResponsesRef.onSnapshot(({ docs }) => {
	randomResponses(
		docs.map(document => ({ ...document.data(), id: document.id })),
	);
});

interface Words {
	themes: Record<string, Record<string, string[]>>;
}

const wordsRef = firestore.doc("config/words") as DocumentReference<Words>;

export const words = trkl<Words>({ themes: {} });

wordsRef.onSnapshot(snap => {
	words(snap.data() || { themes: {} });
});
