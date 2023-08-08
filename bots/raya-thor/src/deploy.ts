import { deploy } from "discord/commands/deploy";
import logger from "logger";
import { env } from "node:process";
import { slashCommands } from "./commands";
import "./env";

logger.info("Commands registering...", env.DISCORD_ID);

await deploy(slashCommands, env.DISCORD_TOKEN, env.DISCORD_ID);

logger.info(slashCommands.size, "commands registered");
