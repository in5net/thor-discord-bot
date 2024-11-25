import command from "$lib/discord/commands/slash";
import { incCount } from "$lib/users";
import { ChannelType, EmbedBuilder, type ColorResolvable } from "discord.js";
import got from "got";
import { z } from "zod";

const tagSchema = z.object({
  tag_id: z.number(),
  name: z.string(),
  description: z.string(),
  is_nsfw: z.boolean().default(false),
});
const dataSchema = z.object({
  images: z.array(
    z.object({
      signature: z.string(),
      extension: z.string(),
      image_id: z.number(),
      favourites: z.number(),
      dominant_color: z.string(),
      source: z.string().optional(),
      uploaded_at: z.string(),
      is_nsfw: z.boolean().default(false),
      width: z.number(),
      height: z.number(),
      url: z.string(),
      preview_url: z.string(),
      tags: z.array(tagSchema),
    }),
  ),
});

export default command(
  {
    desc: "Sends a random waifu.im image",
    options: {
      option: {
        type: "choice",
        desc: "Additional query option",
        choices: {
          gif: "Get a GIF instead of a normal image",
          nsfw: "Get a naughty image",
        },
        optional: true,
      },
    },
  },
  async (i, { option }) => {
    if (
      option === "nsfw" &&
      (i.channel?.type === ChannelType.GuildText ||
        i.channel?.type === ChannelType.GuildAnnouncement ||
        i.channel?.type === ChannelType.GuildVoice) &&
      !i.channel.nsfw
    ) {
      return i.reply({
        content: "This isn't a nsfw channel you cheeky boi",
        ephemeral: true,
      });
    }
    await i.deferReply();

    const data = await got("https://api.waifu.im/search", {
      searchParams: {
        gif: option === "gif",
        is_nsfw: option === "nsfw" ? "true" : "false",
      },
    }).json();
    const [image] = dataSchema.parse(data).images;
    if (!image) {
      throw new Error("No waifu found");
    }

    const embed = new EmbedBuilder()
      .setTitle(image.tags.map(t => t.name).join(", "))
      .setURL(image.url)
      .setDescription(image.tags.map(t => t.description).join(", "))
      .setColor(image.dominant_color as ColorResolvable)
      .setImage(image.url)
      .setFooter({
        text: "Powered by waifu.im",
        iconURL: "https://waifu.im/favicon.ico",
      })
      .setTimestamp(new Date(image.uploaded_at));
    if (image.source) {
      embed.setAuthor({
        name: image.source,
        url: image.source,
      });
    }

    await i.editReply({ embeds: [embed] });
    return incCount(i.user.id, "weeb");
  },
);
