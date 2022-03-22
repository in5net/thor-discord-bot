import { MessageEmbed } from 'discord.js';

import { getUser } from '$services/users';
import type Command from './command';

const cmd: Command = {
  name: 'counts',
  desc: 'Displays the number of times a user has used certain commands',
  usage: '<@user>',
  async exec({ channel, author, mentions }) {
    const mention = mentions.users.first() || author;
    const user = await getUser(mention.id);
    return channel.send({
      embeds: [
        new MessageEmbed().setTitle(`${mention.username}'s counts`).setFields(
          Object.entries(user?.counts || {}).map(([name, count]) => ({
            name,
            value: count.toString()
          }))
        )
      ]
    });
  }
};
export default cmd;
