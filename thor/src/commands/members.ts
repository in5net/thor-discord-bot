import type Command from './command';

const cmd: Command = {
  name: 'members',
  desc: 'Shows the number of members in the server',
  exec({ channel, guild }) {
    return channel.send(
      `There are ${
        guild?.memberCount || 'an unknown number of'
      } members in this server`
    );
  }
};
export default cmd;
