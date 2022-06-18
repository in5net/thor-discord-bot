import { Embed } from '../deps.ts';
import command from './command.ts';

export default command(
  {
    desc: "Gets information on the bot's environment",
    options: {}
  },
  i => {
    const { target, arch, os, vendor, env } = Deno.build;
    const embed = new Embed()
      .setTitle('Build Environment')
      .setColor(0x00ae86)
      .addField('🎯 Build target', target)
      .addField('💻 Architecture', arch)
      .addField('💻 Operating system', os)
      .addField('💻 Vendor', vendor);
    if (env) embed.addField('💻 Environment', env);
    return i.reply({ embeds: [embed] });
  }
);
