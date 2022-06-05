import { command } from '$shared/command';

export default command(
  {
    name: 'members',
    desc: 'Shows the number of members in the server',
    args: [] as const
  },
  ({ channel, guild }) =>
    channel.send(
      `There are ${
        guild?.memberCount || 'an unknown number of'
      } members in this server`
    )
);
