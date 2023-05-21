import prisma from '$services/prisma';
import musicCommand from './command';

export default musicCommand(
  {
    aliases: ['f', 'philter', 'ph'],
    desc: 'Add song filters',
    args: {
      filters: {
        type: 'words',
        desc: 'The filter to apply',
        optional: true
      }
    },
    permissions: ['vc']
  },
  async ({ message, args: { filters }, voice }) => {
    voice.setChannels(message);

    if (!filters?.length) {
      await voice.setFilters();
      return voice.send('🎚️ Filters cleared');
    }

    const audioFilters = await prisma.audioFilter.findMany({
      where: {
        name: {
          in: filters
        }
      }
    });
    if (audioFilters.length !== filters.length)
      return message.reply(
        `Filters not found: ${filters
          .filter(filter => !audioFilters.find(af => af.name === filter))
          .map(filter => `\`${filter}\``)
          .join(', ')}`
      );

    await voice.setFilters(audioFilters.map(f => f.value));
    return voice.send(
      `🎚️ Filters set to ${audioFilters
        .map(({ name }) => `\`${name}\``)
        .join(', ')}`
    );
  }
);
