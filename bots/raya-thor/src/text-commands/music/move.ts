import woof from '$services/woof';
import musicCommand from './command';

export default musicCommand(
  {
    aliases: ['mv'],
    desc: 'Moves song #i to position #j in the queue. You may use `last` to refer to the last song in the queue',
    args: {
      from: {
        type: 'word',
        desc: 'The song number to move'
      },
      to: {
        type: 'word',
        desc: 'The position to move the song to'
      }
    },
    permissions: ['vc']
  },
  async ({ message, args: { from, to }, voice }) => {
    const queue = await voice.getQueue();
    const { length } = queue;

    const i = from === 'last' ? length - 1 : parseInt(from) - 2;
    const j = to === 'last' ? length - 1 : parseInt(to) - 2;

    if (isNaN(i) || isNaN(j) || i < 0 || j < 0 || i >= length || j >= length)
      return message.reply(`${woof()}, please provide valid numbers`);

    return voice.move(i, j);
  }
);
