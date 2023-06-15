import process from "node:process";
import {
	ActivityType,
	Client,
	type Collection,
	Options,
	WebhookClient,
} from "discord.js";
import { type TextCommand } from "discord/commands/text";
import { loadDiscordEvents } from "discord/loaders/events";
import { loadSlashCommands } from "discord/loaders/slash-commands";
import { loadTextCommands } from "discord/loaders/text-commands";
import { type SlashCommand } from "discord/commands/slash";

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
const textCommandsPath = new URL("commands/text", import.meta.url).pathname;
client.textCommands = await loadTextCommands(textCommandsPath);
const slashCommandsPath = new URL("commands/slash", import.meta.url).pathname;
client.slashCommands = await loadSlashCommands(slashCommandsPath);

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
