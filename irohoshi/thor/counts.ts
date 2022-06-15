import { MessageEmbed } from 'discord.js';

import { getUser } from '$services/users';
import { command } from '$shared/command';

export default command(
  {
    name: 'counts',
    desc: 'Displays the number of times a user has used certain commands',
    args: []
  },
  async ({ channel, author, mentions }) => {
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
);
