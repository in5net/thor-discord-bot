import command from "$commands/slash";

const wins: Record<string, string> = {
	rock: "scissors",
	paper: "rock",
	scissors: "paper",
};
const choice2Name: Record<string, string> = {
	rock: "🪨 rock",
	paper: "📄 paper",
	scissors: "✂️ scissors",
};
const choices = Object.keys(choice2Name);

export default command(
	{
		desc: "Rock, Paper, Scissors!",
		options: {
			choice: {
				type: "choice",
				desc: "The choice you want to play",
				choices: choice2Name,
			},
		},
	},
	async (i, { choice }) => {
		const botChoice = choices[Math.floor(Math.random() * choices.length)] || "";
		if (choice === botChoice)
			return i.reply(`I chose ${choice2Name[botChoice]} too, so it's a draw!`);
		if (wins[choice] === botChoice)
			return i.reply(
				`You chose ${choice2Name[choice]} and I chose ${choice2Name[botChoice]}, you win!`
			);
		return i.reply(
			`You chose ${choice2Name[choice]} and I chose ${choice2Name[botChoice]}, I win!`
		);
	}
);
