import command from './command.ts';

export default command(
  {
    desc: 'Ping!',
    options: {}
  },
  async i => i.reply('Pong!', { ephemeral: true })
);
