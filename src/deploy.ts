import "./env";

import { deploy } from "$lib/discord/commands/deploy";
import logger from "$lib/logger";
import { env } from "node:process";
import { messageCommands, slashCommands } from "./commands";

logger.info("$lib/commands registering...", env.DISCORD_ID);

await deploy(
  { slash: slashCommands, message: messageCommands },
  env.DISCORD_TOKEN,
  env.DISCORD_ID,
);

logger.info(slashCommands.size, "slash commands registered");
logger.info(messageCommands.size, "message commands registered");
