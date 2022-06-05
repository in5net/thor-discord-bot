// eslint-disable-next-line import/no-cycle
import { getPlayer } from '../players';
import woof from '$services/woof';
import { command } from '$shared/command';

export default command(
  {
    name: 'remove',
    aliases: ['rm'],
    desc: 'Removes song #n from the queue. You may use `last` to refer to the last song in the queue',
    args: [
      {
        name: 'n',
        type: 'string',
        desc: 'The song number to remove'
      }
    ] as const
  },
  async (message, [nStr]) => {
    const { guildId, author } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    const channel = message.member?.voice.channel;
    if (channel?.type !== 'GUILD_VOICE')
      return message.reply(`${woof()}, you are not in a voice channel`);

    const index =
      nStr === 'last' ? player.queue.length - 1 : parseInt(nStr) - 2;
    if (isNaN(index) || index < 0 || index >= player.queue.length)
      return message.reply(`${woof()}, please provide a valid number`);

    return player.remove(author.id, index);
  }
);
