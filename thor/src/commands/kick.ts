import { config } from 'dotenv';

import type Command from './command';

config();

const kick: Command = async (
  { author, channel, guild },
  [userMention, ...reason]
) => {
  if (author.id !== process.env.LIMITLESS_PC_ID)
    return channel.send(
      'Invalid Minecraft LuckPerms permissions, nope to you.'
    );
  if (!userMention) return channel.send('You need to specify a user to kick.');
  const userId = userMention.replace(/[<@!>]/g, '');
  await guild?.members.kick(userId, reason && reason.join(' '));
  return channel.send(`lmao get rekt <@${userId}>`);
};
export default kick;
