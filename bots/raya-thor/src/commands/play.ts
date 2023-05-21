import command from '$services/commands/message';
import { getVoice } from '../music/voice-manager';

export default command('Play', async i => {
  const message = i.targetMessage;
  const { guildId, content } = message;
  if (!guildId) return;
  const voice = getVoice(guildId);

  const queries = content.replace(
    new RegExp(`${process.env.PREFIX}[a-zA-Z]+`),
    ''
  );
  await voice.add(message, queries);
  await i.reply('Added to queue');
});
