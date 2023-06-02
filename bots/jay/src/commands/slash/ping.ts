import command from '$commands/slash';

export default command(
  {
    desc: 'Ping!',
    options: {}
  },
  i => i.reply(`Pong! ${Date.now() - i.createdTimestamp} ms`)
);
