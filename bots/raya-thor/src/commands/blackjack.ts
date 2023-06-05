import { sum } from "@in5net/limitless";
import {
	ActionRowBuilder,
	ComponentType,
	EmbedBuilder,
	StringSelectMenuBuilder,
} from "discord.js";
import command from "$commands/slash";

const values = {
	// Spades
	"🂡": 1,
	"🂢": 2,
	"🂣": 3,
	"🂤": 4,
	"🂥": 5,
	"🂦": 6,
	"🂧": 7,
	"🂨": 8,
	"🂩": 9,
	"🂪": 10,
	"🂫": 10,
	"🂬": 10,
	"🂭": 10,
	// Hearts
	"🂱": 1,
	"🂲": 2,
	"🂳": 3,
	"🂴": 4,
	"🂵": 5,
	"🂶": 6,
	"🂷": 7,
	"🂸": 8,
	"🂹": 9,
	"🂺": 10,
	"🂻": 10,
	"🂽": 10,
	"🂾": 10,
	// Diamonds
	"🃁": 1,
	"🃂": 2,
	"🃃": 3,
	"🃄": 4,
	"🃅": 5,
	"🃆": 6,
	"🃇": 7,
	"🃈": 8,
	"🃉": 9,
	"🃊": 10,
	"🃋": 10,
	"🃍": 10,
	"🃎": 10,
	// Clubs
	"🃑": 1,
	"🃒": 2,
	"🃓": 3,
	"🃔": 4,
	"🃕": 5,
	"🃖": 6,
	"🃗": 7,
	"🃘": 8,
	"🃙": 9,
	"🃚": 10,
	"🃛": 10,
	"🃝": 10,
	"🃞": 10,
};
type Card = keyof typeof values;

const card2Name: Record<Card, string> = {
	// Spades
	"🂡": `1♤`,
	"🂢": `2♤`,
	"🂣": `3♤`,
	"🂤": `4♤`,
	"🂥": `5♤`,
	"🂦": `6♤`,
	"🂧": `7♤`,
	"🂨": `8♤`,
	"🂩": `9♤`,
	"🂪": `10♤`,
	"🂫": `J♤`,
	"🂬": `Q♤`,
	"🂭": `K♤`,
	// Hearts
	"🂱": `1♡`,
	"🂲": `2♡`,
	"🂳": `3♡`,
	"🂴": `4♡`,
	"🂵": `5♡`,
	"🂶": `6♡`,
	"🂷": `7♡`,
	"🂸": `8♡`,
	"🂹": `9♡`,
	"🂺": `10♡`,
	"🂻": `J♡`,
	"🂽": `Q♡`,
	"🂾": `K♡`,
	// Diamonds
	"🃁": `1♢`,
	"🃂": `2♢`,
	"🃃": `3♢`,
	"🃄": `4♢`,
	"🃅": `5♢`,
	"🃆": `6♢`,
	"🃇": `7♢`,
	"🃈": `8♢`,
	"🃉": `9♢`,
	"🃊": `10♢`,
	"🃋": `J♢`,
	"🃍": `Q♢`,
	"🃎": `K♢`,
	// Clubs
	"🃑": `1♧`,
	"🃒": `2♧`,
	"🃓": `3♧`,
	"🃔": `4♧`,
	"🃕": `5♧`,
	"🃖": `6♧`,
	"🃗": `7♧`,
	"🃘": `8♧`,
	"🃙": `9♧`,
	"🃚": `10♧`,
	"🃛": `J♧`,
	"🃝": `Q♧`,
	"🃞": `K♧`,
};

const standScore = 17;
const threshold = 21;

export default command(
	{
		desc: "Play Blackjack!",
		options: {},
	},
	async i => {
		await i.deferReply();
		const deck = Object.keys(values) as Card[];
		const player: Card[] = [];
		const dealer: Card[] = [];
		let playerScore = 0;
		let dealerScore = 0;

		player.push(takeRandom(deck));
		dealer.push(takeRandom(deck));
		player.push(takeRandom(deck));
		dealer.push(takeRandom(deck));
		playerScore = cards2Score(player);
		dealerScore = cards2Score(dealer);

		const embed = new EmbedBuilder()
			.setTitle("Blackjack")
			.setColor("DarkButNotBlack");

		function setCardFields() {
			embed.setFields(
				{
					name: "Dealer's cards",
					value: `${card2Name[dealer[0]!]}, ${dealer
						.slice(1)
						.map(() => "?")
						.join(", ")}`,
				},
				{
					name: "Your cards",
					value: player.map(card => card2Name[card]).join(", "),
				}
			);
		}

		const row = new ActionRowBuilder().addComponents(
			new StringSelectMenuBuilder().setCustomId("action").addOptions(
				{
					emoji: "💥",
					label: "Hit",
					value: "hit",
				},
				{
					emoji: "💰",
					label: "Stand",
					value: "stand",
				}
			)
		);

		while (playerScore < threshold && dealerScore < threshold) {
			setCardFields();
			await i.editReply({ embeds: [embed], components: [row] });
			const int = await i.channel
				?.awaitMessageComponent({
					componentType: ComponentType.StringSelect,
					filter: int => int.user.id === i.user.id,
					time: 60_000,
				})
				.catch(() => null);
			if (!int) return i.followUp("Blackjack ran out of time ⏱");

			await int.update({});
			const [action = ""] = int.values;

			if (action === "hit") {
				player.push(takeRandom(deck));
				playerScore = cards2Score(player);
			} else if (action === "stand") {
				while (dealerScore <= standScore) {
					dealer.push(takeRandom(deck));
					dealerScore = cards2Score(dealer);
				}

				break;
			} else return i.followUp("Invalid action");

			if (playerScore > threshold) break;
			if (dealerScore <= standScore) {
				dealer.push(takeRandom(deck));
				dealerScore = cards2Score(dealer);
			}
		}

		embed.setFields(
			{
				name: "Dealer's cards",
				value: dealer.map(card => card2Name[card]).join(", "),
			},
			{
				name: "Your cards",
				value: player.map(card => card2Name[card]).join(", "),
			}
		);
		let value = "";
		if (playerScore > threshold) value = `You went over ${threshold}!`;
		else if (dealerScore > threshold) value = `Dealer went over ${threshold}!`;
		else if (playerScore === dealerScore) value = "It was a draw!";
		else if (playerScore > dealerScore) value = "You won!";
		else value = "You lost!";
		embed.addFields(
			{ name: "Dealer score", value: dealerScore.toString() },
			{
				name: "Your score",
				value: playerScore.toString(),
			},
			{ name: "Result", value }
		);
		return i.editReply({ embeds: [embed], components: [] });
	}
);

function cards2Score(cards: Card[]) {
	return sum(cards.map(card => values[card]));
}

function takeRandom<T>(array: T[]): T {
	const index = Math.floor(Math.random() * array.length);
	const item = array[index]!;
	array.splice(index, 1);
	return item;
}
