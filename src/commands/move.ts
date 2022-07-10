// eslint-disable-next-line import/no-cycle
import { getPlayer } from '../players';
import woof from '$services/woof';
import { command } from '$shared/command';

export default command(
  {
    name: 'move',
    aliases: ['mv'],
    desc: 'Moves song #i to position #j in the queue. You may use `last` to refer to the last song in the queue',
    args: [
      {
        name: 'i',
        type: 'string',
        desc: 'The song number to move'
      },
      {
        name: 'j',
        type: 'string',
        desc: 'The position to move the song to'
      }
    ] as const
  },
  async (message, [fromStr, toStr]) => {
    const { guildId, author } = message;
    if (!guildId) return;
    const player = getPlayer(guildId);

    const channel = message.member?.voice.channel;
    if (channel?.type !== 'GUILD_VOICE')
      return message.reply(`${woof()}, you are not in a voice channel`);

    const from =
      fromStr === 'last' ? player.queue.length - 1 : parseInt(fromStr) - 2;
    const to = toStr === 'last' ? player.queue.length - 1 : parseInt(toStr) - 2;

    if (
      isNaN(from) ||
      isNaN(to) ||
      from < 0 ||
      to < 0 ||
      from >= player.queue.length ||
      to >= player.queue.length
    )
      return message.reply(`${woof()}, please provide valid numbers`);

    return player.move(from, to, author.id);
  }
);
