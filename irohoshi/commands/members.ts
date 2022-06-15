import command from './command.ts';

export default command(
  {
    desc: 'Shows the number of members in the server',
    options: {}
  },
  i =>
    i.reply(
      i.guild
        ? `There are ${i.guild.memberCount} members in this server`
        : "This ain't a server, bub"
    )
);
