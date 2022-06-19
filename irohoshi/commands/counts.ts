import { Embed } from '../deps.ts';
import { getUser } from '../users.ts';
import command from './command.ts';

export default command(
  {
    desc: 'Displays the number of times a user has used certain commands',
    options: {
      user: {
        type: 'user',
        desc: 'The user to view the counts for'
      }
    }
  },
  async (i, { user }) => {
    const data = await getUser(user.id);
    const embed = new Embed().setTitle(`${user.username}'s counts`);
    if (data?.counts)
      embed.addFields(
        ...Object.entries(data.counts).map(([name, count]) => ({
          name,
          value: count.toString()
        }))
      );
    else embed.setDescription('No counts found');
    return i.reply({
      embeds: [embed]
    });
  }
);
