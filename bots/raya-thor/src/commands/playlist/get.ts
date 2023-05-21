import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ComponentType,
  EmbedBuilder
} from 'discord.js';

import command from '$services/commands/slash';
import { COLOR } from '$services/env';
import prisma from '$services/prisma';
import { sec2Str } from '$services/time';
import * as playlist from '../../music/playlist';

export default command(
  {
    desc: 'Shows the songs in your playlist',
    options: {
      name: {
        type: 'string',
        desc: 'The name of the playlist',
        autocomplete: async (search, i) => {
          const playlists = await prisma.playlist.findMany({
            select: {
              name: true
            },
            where: {
              uid: i.user.id,
              name: {
                contains: search
              }
            },
            orderBy: {
              name: 'asc'
            },
            take: 5
          });
          return playlists.map(({ name }) => name);
        }
      }
    }
  },
  async (i, { name }) => {
    const { user } = i;
    const songs = await playlist
      .get(
        {
          uid: user.id,
          name: user.username
        },
        name
      )
      .catch(() => []);
    const { length } = songs;

    const embed = new EmbedBuilder()
      .setTitle('Tracks')
      .setColor(COLOR)
      .setAuthor({
        name: user.username,
        iconURL: user.avatarURL() || undefined
      });
    const backButton = new ButtonBuilder()
      .setCustomId('back')
      .setEmoji('⬅️')
      .setStyle(ButtonStyle.Primary);
    const nextButton = new ButtonBuilder()
      .setCustomId('next')
      .setEmoji('➡️')
      .setStyle(ButtonStyle.Primary);
    const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
      backButton,
      nextButton
    );

    let page = 0;
    const pageSize = 5;

    const generateEmbed = () => {
      embed.setFields();
      backButton.setDisabled(!page);
      nextButton.setDisabled(page * pageSize + pageSize >= length);
      embed.setFooter({
        text: `Page ${page + 1}/${Math.ceil(
          length / pageSize
        )}, total: ${length}`
      });

      for (let i = page * pageSize; i < (page + 1) * pageSize; i++) {
        const song = songs[i];
        if (!song) break;
        const { title, duration } = song;
        embed.addFields({
          name: `${i + 1}. ${title}`,
          value: duration ? `${sec2Str(duration)}` : '\u200B'
        });
      }
    };
    generateEmbed();

    const message = await i.reply({
      embeds: [embed],
      components: [row],
      ephemeral: true
    });

    message
      .createMessageComponentCollector({
        componentType: ComponentType.Button,
        time: 60_000
      })
      .on('collect', async i => {
        const { customId } = i;
        if (customId === 'back') page--;
        else if (customId === 'next') page++;
        generateEmbed();
        await i.editReply({ embeds: [embed], components: [row] });
      });
  }
);
