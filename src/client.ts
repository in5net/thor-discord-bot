import type { MessageCommand } from "$lib/discord/commands/message";
import type { SlashCommand } from "$lib/discord/commands/slash";
import type { TextCommand } from "$lib/discord/commands/text";
import { loadDiscordEvents } from "$lib/discord/loaders/events";
import {
  messageCommands,
  slashCommands,
  textCommands,
  buttonHandlers,
} from "./commands";
import type { ButtonHandler } from "./lib/discord/commands/button";
import {
  ActivityType,
  Client,
  Options,
  WebhookClient,
  type ActivityOptions,
  type Collection,
} from "discord.js";
import ms from "ms";
import process from "node:process";
import { scheduleJob } from "node-schedule";

const { NAME, DISCORD_TOKEN } = process.env;
console.log(`⏳ ${NAME} is starting...`);
console.time(NAME);

declare module "discord.js" {
  export interface Client {
    textCommands: Collection<string, TextCommand>;
    aliases: Collection<string, string>;
    slashCommands: Collection<string, SlashCommand>;
    messageCommands: Collection<string, MessageCommand>;
    buttonHandlers: Collection<string, ButtonHandler>;
  }
}

const activity: ActivityOptions = {
  name: "with your feelings",
  type: ActivityType.Playing,
};

const client = new Client({
  presence: {
    activities: [activity],
  },
  intents: [
    "Guilds",
    "GuildMessages",
    "DirectMessages",
    "MessageContent",
    "GuildMessageReactions",
    "GuildVoiceStates",
  ],
  makeCache: Options.cacheWithLimits({
    ...Options.DefaultMakeCacheSettings,
    AutoModerationRuleManager: 0,
    ApplicationCommandManager: 0,
    BaseGuildEmojiManager: 0,
    GuildEmojiManager: 0,
    GuildMemberManager: 8,
    GuildBanManager: 0,
    GuildForumThreadManager: 0,
    GuildInviteManager: 0,
    GuildScheduledEventManager: 0,
    GuildStickerManager: 0,
    GuildTextThreadManager: 0,
    MessageManager: 16,
    PresenceManager: 0,
    ReactionManager: 0,
    ReactionUserManager: 0,
    StageInstanceManager: 0,
    ThreadManager: 0,
    ThreadMemberManager: 0,
    UserManager: 0,
    VoiceStateManager: 16,
  }),
  sweepers: {
    ...Options.DefaultSweeperSettings,
    messages: {
      interval: ms("1 hr") / 1000,
      lifetime: ms("30 min") / 1000,
    },
  },
});
export default client;

const eventsPath = new URL("events", import.meta.url).pathname;
await loadDiscordEvents(eventsPath, client);
client.textCommands = textCommands;
client.slashCommands = slashCommands;
client.messageCommands = messageCommands;
client.buttonHandlers = buttonHandlers;

await client.login(DISCORD_TOKEN);

const webhook = new WebhookClient({ url: process.env.WEBHOOK_URL });

const tz = "America/New_York";
scheduleJob(
  {
    hour: 4 + 12,
    minute: 20,
    tz,
  },
  async () => {
    if (Math.random() > 0.33) {
      await webhook.send("420 BLAZE IT!!! 🔥🔥🔥");
    }
  },
);
scheduleJob(
  {
    hour: 12,
    minute: 0,
    tz,
  },
  async () => {
    if (Math.random() > 0.33) {
      await webhook.send("it's high noon ☀️🤠");
    }
  },
);
scheduleJob(
  {
    minute: 0,
    tz,
  },
  () => {
    client.user?.setActivity("its 7:00 somewhere");
    setTimeout(() => client.user?.setActivity(activity), ms("1 min"));
  },
);
