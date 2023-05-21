import { Awaitable } from 'discord.js';

import command, {
  Args,
  Exec,
  TextCommand,
  TextCommandParams
} from '$services/commands/text';
import { getVoice } from '../../music/voice-manager';

export default function musicCommand<T extends Args>(
  params: TextCommandParams<T>,
  exec: (
    params: Parameters<Exec<T>>[0] & { voice: ReturnType<typeof getVoice> }
  ) => Awaitable<any>
): TextCommand<T> {
  return command(params, async ({ message, args, client }) => {
    const { guildId, channel } = message;
    if (!guildId) return;
    const voice = getVoice(guildId);

    if (!channel.isDMBased() && channel.name.toLowerCase().includes('general'))
      await channel.send('Imagine using music commands in general chat');

    return exec({ message, args, client, voice });
  });
}
