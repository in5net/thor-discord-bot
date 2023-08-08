import { EmbedBuilder } from "discord.js";
import { env } from "node:process";

export const createEmbed = () => new EmbedBuilder().setColor(env.COLOR);
