import command from '$services/commands/slash';
import { getVoice } from '../../music/voice-manager';

export default command(
  {
    desc: 'Clear song filter',
    options: {}
  },
  async i => {
    const { guildId } = i;
    if (!guildId) return;
    const voice = getVoice(guildId);

    await voice.setFilters();
    return i.reply('🎚️ Filters cleared');
  }
);
