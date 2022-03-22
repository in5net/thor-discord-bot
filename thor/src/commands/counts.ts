import { MessageEmbed } from 'discord.js';

import { getUser } from '$services/users';
import type Command from './command';

const cmd: Command = {
  name: 'counts',
  desc: 'Displays the number of times a user has used certain commands',
  async exec({ channel, mentions }) {
    const mention = mentions.users.first();
    if (!mention) return channel.send('You need to mention a user');

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
