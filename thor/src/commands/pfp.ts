import { MessageEmbed } from 'discord.js';
import type Command from './command';

const cmd: Command = {
  name: 'pfp',
  desc: "Gets a user's profile picture",
  usage: 'pfp <@user?>',
  async exec(message) {
    const user = message.mentions.users.first() || message.author;
    const avatar = user.avatarURL({ format: 'png', dynamic: true, size: 1024 });
    if (!avatar) return message.channel.send('No profile picture found');

    const embed = new MessageEmbed()
      .setTitle(`${user.username}'s profile picture`)
      .setImage(avatar);
    return message.channel.send({ embeds: [embed] });
  }
};
export default cmd;
