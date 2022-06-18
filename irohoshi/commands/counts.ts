import { Embed } from '../deps.ts';
import { getUser } from '../users.ts';
import command from './command.ts';

export default command(
  {
    desc: 'Displays the number of times a user has used certain commands',
    options: {
      user: {
        type: 'user',
        desc: 'The user to view the counts for',
        optional: true
      }
    }
  },
  async (i, { user = i.user }) => {
    const data = await getUser(user.id);
    return i.reply({
      embeds: [
        new Embed().setTitle(`${user.username}'s counts`).setFields(
          Object.entries(data?.counts || {}).map(([name, count]) => ({
            name,
            value: count.toString()
          }))
        )
      ]
    });
  }
);
