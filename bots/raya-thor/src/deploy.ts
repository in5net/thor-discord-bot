import { env } from "node:process";
import { deploy } from "discord/commands/deploy";
import { type CommandGroups, type Commands } from "discord/commands/slash";
import * as commandsData from "./commands";

console.log("Commands registering...");

const { default: oddNameCommands, ...normalCommands } = commandsData;

const commands = {
	...normalCommands,
	...oddNameCommands,
} as unknown as Commands | CommandGroups;

const buildCount = await deploy(commands, env.DISCORD_TOKEN, env.DISCORD_ID);

console.log(buildCount, "commands registered");
