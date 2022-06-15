import { Embed } from '../../deps.ts';

export const createEmbed = () =>
  new Embed()
    .setColor('#990000')
    .setFooter(
      'Archive of Our Own',
      'https://upload.wikimedia.org/wikipedia/commons/8/88/Archive_of_Our_Own_logo.png'
    );
