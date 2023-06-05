import process from "node:process";
import * as commands from "./commands";
import { deploy } from "$services/commands/deploy";
import type { CommandGroups, Commands } from "$services/commands/slash";

console.log("Commands registering...");

const buildCount = await deploy(
	commands as unknown as Commands | CommandGroups,
	process.env.DISCORD_TOKEN,
	process.env.DISCORD_ID
);
console.log(buildCount, "commands registered");
