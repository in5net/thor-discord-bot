import command from './command.ts';

export default command(
  {
    desc: 'Shankstorm!',
    options: {
      length: {
        type: 'int',
        desc: 'The number of shanks to send',
        min: 1,
        max: 100,
        default: 100
      }
    }
  },
  (i, { length }) => {
    const text = new Array(length)
      .fill(0)
      .map(() => (Math.random() < 0.5 ? '🍗' : '🍖'))
      .join('');
    return i.reply(text);
  }
);
