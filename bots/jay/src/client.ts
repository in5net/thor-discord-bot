import {
	ActivityType,
	Client,
	Options,
	WebhookClient,
	type Collection,
} from "discord.js";
import { type SlashCommand } from "discord/commands/slash";
import { type TextCommand } from "discord/commands/text";
import { loadDiscordEvents } from "discord/loaders/events";
import process from "node:process";
import { slashCommands, textCommands } from "./commands";

const { NAME, DISCORD_TOKEN, NODE_ENV } = process.env;
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

const eventsPath = new URL("events", import.meta.url).pathname;
await loadDiscordEvents(eventsPath, client);
client.textCommands = textCommands;
client.slashCommands = slashCommands;

if (NODE_ENV === "production") {
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
