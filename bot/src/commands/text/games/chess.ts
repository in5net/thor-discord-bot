import { choice } from "@in5net/std/random";
import db, { eq } from "database/drizzle";
import { chessGames } from "database/drizzle/schema";
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
			await db.delete(chessGames).where(eq(chessGames.userId, author.id));
			return "Game cleared!";
		}

		const { Chess } = await import("chess.js");

		const chessGame = await db.query.chessGames.findFirst({
			columns: {
				fen: true,
			},
			where: eq(chessGames.userId, author.id),
		});

		const chess = new Chess(chessGame?.fen);

		if (move) {
			chess.move(move);

			if (chess.isGameOver()) {
				await db.delete(chessGames).where(eq(chessGames.userId, author.id));
			} else {
				const moves = chess.moves();
				const aiMove = choice(moves) || "";
				chess.move(aiMove);

				const fen = chess.fen();
				await (chessGame ?
					db
						.update(chessGames)
						.set({ fen })
						.where(eq(chessGames.userId, author.id))
				:	db.insert(chessGames).values({ userId: author.id, fen }));
			}
		}

		return `\`\`\`${chess.ascii()}\`\`\``;
	},
);
