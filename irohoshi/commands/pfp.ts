import { Embed } from '../deps.ts';

import command from './command.ts';

export default command(
  {
    desc: "Gets your, a user's, profile picture",
    options: {
      user: {
        type: 'user',
        desc: 'The user to get the profile picture of',
        optional: true
      }
    }
  },
  (i, { user = i.user }) => {
    console.log('here');
    console.log(i.option('user'));
    const avatar = user.avatarURL('dynamic', 1024);
    if (!avatar) return i.reply('No profile picture found');

    const embed = new Embed()
      .setTitle(`${user.username}'s profile picture`)
      .setImage(avatar);
    return i.reply({ embeds: [embed] });
  }
);
