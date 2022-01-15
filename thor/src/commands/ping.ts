import type Command from './command';

const ping: Command = ({ channel }) => channel.send('pong');

export default ping;
