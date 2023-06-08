import { env } from "node:process";
import { EmbedBuilder } from "discord.js";

export const createEmbed = () => new EmbedBuilder().setColor(env.COLOR);
