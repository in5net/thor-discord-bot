import process from "node:process";
import {
	ActivityType,
	Client,
	type Collection,
	Options,
	WebhookClient,
} from "discord.js";
import { loadDiscordEvents } from "./loaders/events";
import { loadSlashCommands } from "./loaders/slash-commands";
import { loadTextCommands } from "./loaders/text-commands";
import { type TextCommand } from "$services/commands/text";
import { type SlashCommand } from "$services/commands/slash";

const { NAME, DISCORD_TOKEN, DEV } = process.env;
console.log(`⏳ ${NAME} is starting...`);
console.time(NAME);

declare module "discord.js" {
	export interface Client {
		textCommands: Collection<string, TextCommand>;
		aliases: Collection<string, string>;
		slashCommands: Collection<string, SlashCommand>;
	}
}

const client = new Client({
	presence: {
		activities: [
			{
				name: "and gaming",
				type: ActivityType.Playing,
			},
		],
	},
	intents: [
		"Guilds",
		"GuildMessages",
		"DirectMessages",
		"MessageContent",
		"GuildMessageReactions",
	],
	makeCache: Options.cacheWithLimits({
		ApplicationCommandManager: 0,
		BaseGuildEmojiManager: 0,
		GuildEmojiManager: 0,
		GuildBanManager: 0,
		GuildInviteManager: 0,
		GuildScheduledEventManager: 0,
		GuildStickerManager: 0,
		PresenceManager: 0,
		ReactionManager: 0,
		ReactionUserManager: 0,
		StageInstanceManager: 0,
		ThreadManager: 0,
		ThreadMemberManager: 0,
		UserManager: 0,
	}),
});
export default client;

await loadDiscordEvents(client);
client.textCommands = await loadTextCommands();
client.slashCommands = await loadSlashCommands();

if (DEV !== "1") {
	const webhook = new WebhookClient({ url: process.env.WEBHOOK_URL });

	process.on("SIGINT", async () => {
		await webhook.send(`🚫 ${NAME} is offline`);
		process.exit(0);
	});
}

await client.login(DISCORD_TOKEN);

process.on("exit", () => {
	console.log(`🚫 ${NAME} is going offline...`);
});
