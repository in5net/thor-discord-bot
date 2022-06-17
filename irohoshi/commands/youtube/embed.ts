import { Embed } from '../../deps.ts';

export const createEmbed = () =>
  new Embed()
    .setColor('#ff0000')
    .setFooter(
      'YouTube',
      'https://upload.wikimedia.org/wikipedia/commons/thumb/0/09/YouTube_full-color_icon_%282017%29.svg/2560px-YouTube_full-color_icon_%282017%29.svg.png'
    );
