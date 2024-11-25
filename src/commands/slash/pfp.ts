import command from "$lib/discord/commands/slash";
import { EmbedBuilder } from "discord.js";

export default command(
  {
    desc: "Gets your, a user's, profile picture",
    options: {
      user: {
        type: "user",
        desc: "The user to get the profile picture of",
        optional: true,
      },
    },
  },
  async (i, { user = i.user }) => {
    const avatar = user.avatarURL({ size: 1024 });
    if (!avatar) {
      return i.reply("No profile picture found");
    }

    const embed = new EmbedBuilder()
      .setTitle(`${user.username}'s profile picture`)
      .setImage(avatar);
    return i.reply({ embeds: [embed] });
  },
);
