type Response =
	| string
	| ((
			times: number,
			wrong: boolean
	  ) =>
			| string
			| {
					text: string;
					effect?: "good" | "bad" | "wrong";
			  });

export interface Part {
	text: string;
	choices: Array<{
		text: string;
		emoji: string;
		condition?: (times: number) => boolean;
		response?: Response;
		effect?: "good" | "bad" | "wrong";
		next?: (times: number) => Part;
	}>;
}

let part1: Part;
let part2: Part;
let part3: Part;
let part4: Part;
let part5: Part;
let part6: Part;
let part7: Part;
let part8: Part;
let boss: Part;

// eslint-disable-next-line prefer-const
part1 = {
	text: "Here It is… The final part of your quest. A door stands in front of you, an entrance to a labyrinth, the {item} somewhere inside. Take care to not get lost forever!",
	choices: [
		{
			text: "Enter the labyrinth",
			emoji: "🚪",
			response: "You enter the labyrinth",
			next: () => part2,
		},
		{
			text: "Look for a way around",
			emoji: "🔍",
			response:
				"There is no way around, dummy, it’s inside the labyrinth! (run it back)",
			next: () => part1,
		},
		{
			text: "Maybe this can wait a little longer..?",
			emoji: "🕙",
			condition: times => times < 3,
			response(times, wrong) {
				const text =
					"you wait for a while, to steel yourself for the challenge that waits ahead";
				if (!times) return { text, effect: "good" };
				if (wrong) return { text, effect: "bad" };
				return { text, effect: "wrong" };
			},
			next: () => part1,
		},
	],
};

export const part = part1;

part2 = {
	text: "There is a path that branches left, front, and right. Where to?",
	choices: [
		{
			text: "Head left",
			emoji: "⬅️",
			response: "You go left",
			next: () => part3,
		},
		{
			text: "Go to the front",
			emoji: "⬆️",
			response: "You head straight",
			next: () => part4,
		},
		{
			text: "Go right",
			emoji: "➡️",
			response(_times, wrong) {
				const text =
					"The passage to the right abruptly stops, and you have to go back…";
				if (wrong) return { text: `${text} This is tiring…`, effect: "bad" };
				return { text, effect: "wrong" };
			},
			next: () => part2,
		},
		{
			text: "Go back out",
			emoji: "⬇️",
			response:
				"You try to go back, but the doors are shut and you can’t pull them open",
			next: () => part2,
		},
	],
};

part3 = {
	text: "You make the reasonable decision to head left. What next?",
	choices: [
		{
			text: "Take a left",
			emoji: "⬅️",
			response: "You take another left",
			next: () => part5,
		},
		{
			text: "Continue foreward",
			emoji: "⬆️",
			response: "You have a bad feeling about this..",
			next: () => part6,
		},
		{
			text: "Take it back",
			emoji: "⬇️",
			response: "You go back to the starting room",
			next: () => part2,
		},
	],
};

part4 = {
	text: "Alright, what now?",
	choices: [
		{
			text: "Go foreward some more",
			emoji: "⬆️",
			response: "Aw, snap, another dead end… you go back to the first room",
			effect: "wrong",
			next: () => part2,
		},
		{
			text: "Go right, but only a little",
			emoji: "➡️",
			response:
				"You uncover a staircase that goes down into darkness. You follow it for what seems like hours, and eventually it leads in a dead end. Yay.",
			effect: "bad",
			next: () => part2,
		},
		{
			text: "Head back",
			emoji: "⬇️",
			next: () => part7,
		},
	],
};

part5 = {
	text: "You take a brand new left turn and find another left.",
	choices: [
		{
			text: "Go left again",
			emoji: "⬅️",
			response: "You left",
			effect: "wrong",
			next: times => (times === 4 ? boss : part5),
		},
		{
			text: "Go back",
			emoji: "⬇️",
			response: "You head back to the start of the maze",
			effect: "wrong",
			next: () => part2,
		},
	],
};

part6 = {
	text: "A new option awaits you. Where to?",
	choices: [
		{
			text: "Go left",
			emoji: "⬅️",
			response: "And… a dead end.",
			effect: "wrong",
			next: () => part2,
		},
		{
			text: "Go foreward",
			emoji: "⬆️",
			response: "And… a dead end.",
			effect: "wrong",
			next: () => part2,
		},
		{
			text: "Go right",
			emoji: "➡️",
			response: "And… a dead end.",
			effect: "wrong",
			next: () => part2,
		},
		{
			text: "Go back",
			emoji: "⬇️",
			response: "you go back to the second room",
			next: () => part3,
		},
	],
};

part7 = {
	text: "You head back, but somehow, not into the same room as before. The passageway is closed behind you, and there is only 2 corridors, left and right.",
	choices: [
		{
			text: "Take the left path",
			emoji: "⬅️",
			response:
				"You start heading left when suddenly, a trap springs and you slide down a tube back to the first room- oh no!",
			effect: "wrong",
			next: () => part2,
		},
		{
			text: "To the right path",
			emoji: "➡️",
			next: () => part8,
		},
	],
};

part8 = {
	text: "You head right, with twice the sauce as usual. You come back out the same corridor you went into somehow. Which way now?",
	choices: [
		{
			text: "To the left",
			emoji: "⬅️",
			response:
				"You find some treasure! It’s not the {item}, so you don’t care. Suddenly you are swept away-",
			effect: "good",
			next: () => boss,
		},
		{
			text: "Take it right",
			emoji: "➡️",
			effect: "wrong",
			next: () => part8,
		},
	],
};

boss = {
	text: "Boss",
	choices: [
		{
			text: "Test",
			emoji: "🐉",
			response: "test",
		},
	],
};
