import { cache } from "$lib/prisma";
import { choice } from "@in5net/std/random";
import command from "discord/commands/text";

export default command(
	{
		desc: "Play chess!",
		args: {
			move: {
				type: "word",
				optional: true,
				desc: "Make a move",
			},
		},
	},
	async ({ message: { author }, args: { move } }) => {
		if (["clear", "reset"].includes(move?.toLowerCase() || "")) {
			await cache.chessGame.delete({
				where: {
					userId: BigInt(author.id),
				},
			});
			return "Game cleared!";
		}

		const { Chess } = await import("chess.js");

		const chessGame = await cache.chessGame.findFirst({
			select: {
				fen: true,
			},
			where: {
				userId: BigInt(author.id),
			},
		});

		const chess = new Chess(chessGame?.fen);

		if (move) {
			chess.move(move);

			if (chess.isGameOver()) {
				await cache.chessGame.delete({
					where: {
						userId: BigInt(author.id),
					},
				});
			} else {
				const moves = chess.moves();
				const aiMove = choice(moves) || "";
				chess.move(aiMove);

				const fen = chess.fen();
				await cache.chessGame.upsert({
					where: {
						userId: BigInt(author.id),
					},
					create: {
						userId: BigInt(author.id),
						fen,
					},
					update: {
						fen,
					},
				});
			}
		}

		return `\`\`\`${chess.ascii()}\`\`\``;
	},
);
