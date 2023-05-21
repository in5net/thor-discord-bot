import command from '$commands/slash';

export default command(
  {
    desc: 'Puts a clap between every word',
    options: {
      text: {
        type: 'string',
        desc: 'The text to clapify'
      }
    }
  },
  (i, { text }) => {
    const clapped = text.split(' ').join(' 👏 ');
    return i.reply(clapped);
  }
);
