import { ChannelType, ColorResolvable, EmbedBuilder } from 'discord.js';

import command from '$commands/slash';
import type { paths } from '$openapi/waifu';
import { Fetcher } from '$services/openapi';
import { incCount } from '$services/users';

const fetcher = Fetcher.for<paths>();
fetcher.configure({
  baseUrl: 'https://api.waifu.im'
});

const getRandom = fetcher.path('/random/').method('get').create();

export default command(
  {
    desc: 'Sends a random waifu.im image',
    options: {
      option: {
        type: 'choice',
        desc: 'Additional query option',
        choices: {
          gif: 'Get a GIF instead of a normal image',
          nsfw: 'Get a naughty image'
        },
        optional: true
      }
    }
  },
  async (i, { option }) => {
    if (
      option === 'nsfw' &&
      (i.channel?.type === ChannelType.GuildText ||
        i.channel?.type === ChannelType.GuildAnnouncement ||
        i.channel?.type === ChannelType.GuildVoice) &&
      !i.channel.nsfw
    )
      return i.reply({
        content: "This isn't a nsfw channel you cheeky boi",
        ephemeral: true
      });
    await i.deferReply();

    const { data } = await getRandom({
      gif: option === 'gif',
      is_nsfw: option === 'nsfw' ? 'true' : 'false'
    });
    const image = data.images[0];
    console.log(data);
    if (!image) throw new Error('No waifu found');

    const embed = new EmbedBuilder()
      .setTitle(image.tags.map(t => t.name).join(', '))
      .setURL(image.url)
      .setDescription(image.tags.map(t => t.description).join(', '))
      .setColor(image.dominant_color as ColorResolvable)
      .setImage(image.url)
      .setFooter({
        text: 'Powered by waifu.im',
        iconURL: 'https://waifu.im/favicon.ico'
      })
      .setTimestamp(new Date(image.uploaded_at));
    if (image.source)
      embed.setAuthor({
        name: image.source,
        url: image.source
      });

    await i.editReply({ embeds: [embed] });
    return incCount(i.user.id, 'weeb');
  }
);
