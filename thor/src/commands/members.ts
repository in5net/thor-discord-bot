import type Command from './command';

const members: Command = ({ channel, guild }) =>
  channel.send(
    `There are ${
      guild?.memberCount || 'an unknown number of'
    } members in this server`
  );

export default members;
