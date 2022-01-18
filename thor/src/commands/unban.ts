import '../env';
import type Command from './command';

const unban: Command = async (
  { author, channel, guild },
  [userMention, ...reason]
) => {
  if (author.id !== process.env.LIMITLESS_PC_ID)
    return channel.send('Invalid LuckPerms');
  if (!userMention) return channel.send('You need to specify a user to unban.');
  const userId = userMention.replace(/[<@!>]/g, '');
  await guild?.members.unban(userId, reason && reason.join(' '));
  return channel.send(
    `Okay, I know it may sound crazy, but <@${userId}> has been UNfucked.`
  );
};
export default unban;
