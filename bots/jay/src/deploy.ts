import { env } from "node:process";
import { deploy } from "discord/commands/deploy";
import { type CommandGroups, type Commands } from "discord/commands/slash";
import * as commands from "./commands";

console.log("Commands registering...");

const buildCount = await deploy(
	commands as unknown as Commands | CommandGroups,
	env.DISCORD_TOKEN,
	env.DISCORD_ID
);
console.log(buildCount, "commands registered");
