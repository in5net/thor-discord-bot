import {
  ActivityOptions,
  ActivityType,
  Client,
  Options,
  WebhookClient
} from 'discord.js';

const { NAME, DISCORD_TOKEN } = process.env;
console.log(`⏳ ${NAME} is starting...`);
console.time(NAME);

const activity: ActivityOptions = {
  name: 'and gaming',
  type: ActivityType.Playing
};

const client = new Client({
  presence: {
    activities: [activity]
  },
  intents: [
    'Guilds',
    'GuildMessages',
    'DirectMessages',
    'MessageContent',
    'GuildMessageReactions'
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
    UserManager: 0
  })
});
export default client;

const webhook = new WebhookClient({ url: process.env.WEBHOOK_URL || '' });

client
  .once('ready', async () => {
    console.timeEnd(NAME);
    console.log(`✅ ${NAME} is ready!`);
    await webhook.send(`✅ ${NAME} is online`);
  })
  .login(DISCORD_TOKEN);

process
  .on('exit', () => console.log(`🚫 ${NAME} is going offline...`))
  .on('SIGINT', async () => {
    await webhook.send(`🚫 ${NAME} is offline`);
    process.exit(0);
  });
