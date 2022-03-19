import { MessageAttachment } from 'discord.js';
import wav from '../../../wavstream';
import woof from '../../../woof';
import type Command from './command';

const cmd: Command = {
  name: 'hz',
  desc: 'Plays a sound at a given frequency for a given duration',
  usage: '<frequency> <duration?=1>',
  async exec(message, args) {
    const [hzStr, durationStr] = args;
    if (!hzStr)
      return message.reply(`${woof()}, you need to specify a frequency`);
    const hz = parseInt(hzStr);
    if (isNaN(hz))
      return message.reply(`${woof()}, you need to specify a number`);
    if (hz < 0)
      return message.reply(`${woof()}, you need to specify a positive number`);

    let duration = 1;
    if (durationStr) {
      duration = parseInt(durationStr);
      if (isNaN(duration))
        return message.reply(`${woof()}, the duration must be a number`);
      if (duration < 0)
        return message.reply(
          `${woof()}, you need to specify a positive duration`
        );
    }

    const stream = wav(hz, duration);
    return message.channel.send({
      files: [new MessageAttachment(stream, `${hz}.wav`)]
    });
  }
};
export default cmd;
