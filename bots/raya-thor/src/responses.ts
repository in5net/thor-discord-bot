import { firestore } from "$services/firebase";
import {
	type CollectionReference,
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
