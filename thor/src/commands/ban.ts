import '../env';
import type Command from './command';

const ban: Command = async (
  { author, channel, guild },
  [userMention, ...reason]
) => {
  if (author.id !== process.env.LIMITLESS_PC_ID)
    return channel.send('LuckPerms said no, theiy shall not be fucked');
  if (!userMention) return channel.send('You need to specify a user to ban.');
  const userId = userMention.replace(/[<@!>]/g, '');
  await guild?.members.ban(userId, reason && { reason: reason.join(' ') });
  return channel.send(`Get fucked <@${userId}>`);
};
export default ban;
