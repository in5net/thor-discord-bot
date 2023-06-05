import process from "node:process";
import * as messageCommands from "./commands/messages";
import * as commandsData from "./commands/mod";
import { deploy } from "$services/commands/deploy";
import { type CommandGroups, type Commands } from "$services/commands/slash";

console.log("Commands registering...");

const { default: oddNameCommands, ...normalCommands } = commandsData;

const commands = {
	...normalCommands,
	...oddNameCommands,
} as unknown as Commands | CommandGroups;

const buildCount = await deploy(
	commands,
	Object.values(messageCommands),
	process.env.DISCORD_TOKEN,
	process.env.DISCORD_ID
);

console.log(buildCount, "commands registered");
