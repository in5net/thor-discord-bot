import { deploy } from "discord/commands/deploy";
import { env } from "node:process";
import { slashCommands } from "./commands";
import "./env";

console.log("Commands registering...");

await deploy(slashCommands, env.DISCORD_TOKEN, env.DISCORD_ID);

console.log(slashCommands.size, "commands registered");
