import db, { and, eq } from "$lib/database/drizzle";
import { members } from "$lib/database/schema";
import command from "$lib/discord/commands/slash";
import {
  channelMention,
  EmbedBuilder,
  time,
  type APIEmbedField,
} from "discord.js";

export default command(
  {
    desc: "Gets your, or a user's, server info",
    options: {
      user: {
        type: "user",
        desc: "The user to get the info of",
        optional: true,
      },
    },
  },
  async (i, { user = i.user }) => {
    if (!i.guild) {
      return i.reply("This can only be used in a server");
    }

    const embed = new EmbedBuilder();

    const member = await i.guild.members.fetch(user.id);
    embed.setTitle(member.nickname || user.displayName);

    const avatarUrl = member.displayAvatarURL();
    embed.setThumbnail(avatarUrl);

    const fields: APIEmbedField[] = [];
    if (member.joinedAt) {
      fields.push({
        name: "Joined",
        value: time(member.joinedAt),
      });
    }

    const dbMember = await db.query.members.findFirst({
      columns: {
        lastJoinedVcAt: true,
        lastJoinedVcId: true,
      },
      where: and(eq(members.id, user.id), eq(members.guildId, i.guild.id)),
    });
    if (dbMember?.lastJoinedVcAt && dbMember.lastJoinedVcId) {
      fields.push({
        name: "Last joined VC",
        value: `${time(dbMember.lastJoinedVcAt)} in ${channelMention(dbMember.lastJoinedVcId)}`,
      });
    }

    embed.setFields(fields);

    return i.reply({ embeds: [embed] });
  },
);
