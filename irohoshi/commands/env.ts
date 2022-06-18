import { Embed } from '../deps.ts';
import command from './command.ts';

export default command(
  {
    desc: "Gets information on the bot's environment",
    options: {}
  },
  i => {
    const {
      version: { deno, v8, typescript },
      build: { target, arch, os, vendor }
    } = Deno;
    const embed = new Embed()
      .setTitle('Environment')
      .setColor(0x00ae86)
      .addField('🦕 Deno version', deno)
      .addField('V8 version', v8)
      .addField('TypeScript version', typescript)
      .addField('🎯 Build target', target)
      .addField('💻 Architecture', arch)
      .addField('💻 Operating system', os)
      .addField('💻 Vendor', vendor);
    return i.reply({ embeds: [embed] });
  }
);
