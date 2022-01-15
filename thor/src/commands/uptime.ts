import type Command from './command';

const uptime: Command = async message =>
  message.channel.send(`Uptime: ${Math.floor(process.uptime() / 60)} min`);

export default uptime;
