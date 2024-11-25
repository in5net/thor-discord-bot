import command from "$lib/discord/commands/text";
import { EmbedBuilder, version } from "discord.js";
import { cpus, freemem, totalmem } from "node:os";
import { arch, memoryUsage, platform, uptime, versions } from "node:process";

export default command(
  {
    desc: "Gets information on the bot's environment",
    args: {},
  },
  async ({ message }) => {
    const { node, v8 } = versions;
    const embed = new EmbedBuilder()
      .setTitle("Status")
      .setColor("#3AA65B")
      .addFields(
        {
          name: `⬢ Node.js`,
          value: node,
          inline: true,
        },
        {
          name: `V8`,
          value: v8,
          inline: true,
        },
        { name: "\u200B", value: "\u200B" },
        {
          name: `Discord.js`,
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
          name: `🖥️ Logical CPU Cores`,
          value: `${cpus().length} cores`,
        },
      );
    await message.reply({ embeds: [embed] });
  },
);
