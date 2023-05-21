import owofire from 'owofire';

import command from '$commands/slash';

export default command(
  {
    desc: 'Owoifies a message',
    options: {
      message: {
        type: 'string',
        desc: 'The message to owoify'
      }
    }
  },
  async (i, { message }) => {
    await i.deferReply();
    await i.deleteReply();
    await i.channel?.send(owofire(message));
  }
);
