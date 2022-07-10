import type { MessageEmbed } from 'discord.js';

export const color = 0xfcc203;
export const ownerUsername = 'limitlesspc#2437';
export function addOwnerUsername(embed: MessageEmbed) {
  const text = embed.footer?.text;
  const texts: string[] = [];
  if (text) texts.push(text);
  texts.push(`Thor Music by ${ownerUsername}`);
  if (text)
    embed.setFooter({
      text: texts.join(' • '),
      iconURL: embed.footer?.iconURL
    });
}
