import { type Item } from "./items";

export type Response =
	| string
	| ((
			inventory: string[],
			item: Item,
	  ) =>
			| string
			| {
					text: string;
					effect?: "good" | "bad";
			  });
