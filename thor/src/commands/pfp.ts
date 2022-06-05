import { MessageEmbed } from 'discord.js';

import { command } from '$shared/command';

export default command(
  {
    name: 'pfp',
    desc: "Gets a user's profile picture",
    args: [
      {
        name: '@user',
        type: 'mention',
        desc: 'The user to get the profile picture of',
        optional: true
      }
    ] as const
  },
  async (message, [user = message.author]) => {
    const avatar = user.avatarURL({ format: 'png', dynamic: true, size: 1024 });
    if (!avatar) return message.channel.send('No profile picture found');

    const embed = new MessageEmbed()
      .setTitle(`${user.username}'s profile picture`)
      .setImage(avatar);
    return message.channel.send({ embeds: [embed] });
  }
);
