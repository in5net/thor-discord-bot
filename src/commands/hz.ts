import { MessageAttachment } from 'discord.js';
import wav from '$services/wavstream';
import woof from '$services/woof';
import { command } from '$shared/command';

export default command(
  {
    name: 'hz',
    desc: 'Plays a sound at a given frequency for a given duration',
    args: [
      {
        name: 'frequency',
        type: 'int',
        desc: 'The frequency of the sound in hz'
      },
      {
        name: 'duration',
        type: 'float',
        desc: 'The duration of the sound in seconds',
        default: 1
      }
    ] as const
  },
  async (message, [hz, duration]) => {
    if (hz < 0)
      return message.reply(`${woof()}, you need to specify a positive hz`);
    if (duration < 0)
      return message.reply(
        `${woof()}, you need to specify a positive duration`
      );

    const stream = wav(hz, duration);
    return message.channel.send({
      files: [new MessageAttachment(stream, `${hz}.wav`)]
    });
  }
);
