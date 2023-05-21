import { File, Prisma } from '@prisma/client';
import {
  BaseMessageOptions,
  MessagePayload,
  hyperlink,
  userMention
} from 'discord.js';

import { createEmbed } from '$services/embed';
import prisma from '$services/prisma';

export const types = ['image', 'video', 'audio'] as const;
export type Type = (typeof types)[number];
export const extensions: Record<Type, string[]> = {
  image: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
  video: ['mp4', 'mov', 'mkv', 'webm'],
  audio: ['mp3', 'wav', 'ogg']
};

export async function getRandomFile(type?: Type) {
  const [file] = await prisma.$queryRaw<File[]>`SELECT *
    FROM File
    ${
      type
        ? Prisma.sql`WHERE ext IN (${Prisma.join(
            extensions[type].map(e => `.${e}`)
          )})`
        : Prisma.empty
    }
    ORDER BY RAND()
    LIMIT 1`;
  return file;
}

export function sendFile(
  replyable: {
    reply(options: MessagePayload | BaseMessageOptions): Promise<any>;
  },
  { createdAt, ext, authorId, messageId, channelId, guildId, proxyURL }: File
) {
  const embed = createEmbed()
    .setFields(
      {
        name: 'Sent by',
        value: userMention(authorId.toString())
      },
      {
        name: 'Where',
        value: hyperlink(
          'Original message',
          `https://discord.com/channels/${guildId}/${channelId}/${messageId}`
        ),
        inline: true
      }
    )
    .setTimestamp(createdAt);
  const extension = ext.replace('.', '');
  if (extensions.image.includes(extension)) {
    embed.setImage(proxyURL);
    return replyable.reply({
      embeds: [embed]
    });
  }
  return replyable.reply({
    embeds: [embed],
    files: [proxyURL]
  });
}
