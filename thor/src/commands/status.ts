import { memoryUsage, uptime } from 'node:process';
import { cpus, freemem, totalmem } from 'node:os';
import { MessageEmbed, version } from 'discord.js';

import type Command from './command';

const cmd: Command = {
  name: 'status',
  desc: 'Shows a bunch of technical information about the bot',
  exec(message) {
    return message.channel.send({
      embeds: [
        new MessageEmbed()
          .setTitle('Status')
          .addField('Uptime', `${Math.floor(uptime() / 60)} min`)
          .addField(
            'Memory',
            `${Math.floor(memoryUsage().heapUsed / 1024 / 1024)} MB`
          )
          .addField(
            'Total OS Memory',
            `${Math.floor(totalmem() / 1024 / 1024)} MB`
          )
          .addField(
            'Free OS Memory',
            `${Math.floor(freemem() / 1024 / 1024)} MB`
          )
          .addField('Logical CPU Cores', `${cpus().length}`)

          .addField('OS', `${process.platform} ${process.arch}`)
          .addField('Discord.js', `v${version}`)
          .addField('Node.js', `${process.version}`)
      ]
    });
  }
};

export default cmd;
