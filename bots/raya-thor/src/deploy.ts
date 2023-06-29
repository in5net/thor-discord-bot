import { env } from "node:process";
import { deploy } from "discord/commands/deploy";
import logger from "logger";
import { slashCommands } from "./commands";

logger.info("Commands registering...");

await deploy(slashCommands, env.DISCORD_TOKEN, env.DISCORD_ID);

logger.info(slashCommands.size, "commands registered");
