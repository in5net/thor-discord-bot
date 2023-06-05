import { cpus, freemem, totalmem } from "node:os";
import { arch, memoryUsage, platform, uptime, versions } from "node:process";
import { EmbedBuilder, formatEmoji, version } from "discord.js";
import command from "$commands/slash";

export default command(
	{
		desc: "Gets information on the bot's environment",
		options: {},
	},
	async i => {
		const { node, v8 } = versions;
		const embed = new EmbedBuilder()
			.setTitle("Status")
			.setColor("#3AA65B")
			.addFields(
				{
					name: `${formatEmoji("1010539296899477526")} Node.js`,
					value: node,
					inline: true,
				},
				{
					name: `${formatEmoji("1010544592833228841")} V8`,
					value: v8,
					inline: true,
				},
				{ name: "\u200B", value: "\u200B" },
				{
					name: `${formatEmoji("1010538929063211128")} Discord.js`,
					value: `v${version}`,
					inline: true,
				},
				{ name: "💻 Platform", value: platform, inline: true },
				{ name: "🏛 Architecture", value: arch, inline: true },
				{ name: "⏱ Uptime", value: `${Math.floor(uptime() / 60)} min` },
				{
					name: "💾 Memory Used",
					value: `${Math.floor(memoryUsage().heapUsed / 1024 / 1024)} MB`,
					inline: true,
				},
				{
					name: "💾 Memory Total",
					value: `${Math.floor(memoryUsage().heapTotal / 1024 / 1024)} MB`,
					inline: true,
				},
				{ name: "\u200B", value: "\u200B" },
				{
					name: "💾 Total OS Memory",
					value: `${Math.floor(totalmem() / 1024 / 1024)} MB`,
					inline: true,
				},
				{
					name: "💾 Free OS Memory",
					value: `${Math.floor(freemem() / 1024 / 1024)} MB`,
					inline: true,
				},
				{
					name: `${formatEmoji("1010543156531568701")} Logical CPU Cores`,
					value: `${cpus().length} cores`,
				}
			);
		return i.reply({ embeds: [embed] });
	}
);
