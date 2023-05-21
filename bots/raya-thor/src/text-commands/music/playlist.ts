import command from '$services/commands/text';
import musicCommand from './command';

export default command(
  {
    aliases: ['pl'],
    desc: 'Manage your personal playlists',
    args: {}
  },
  ({ message: { channel } }) =>
    'send' in channel && channel.send('See `-help playlist`'),
  {
    save: musicCommand(
      {
        desc: 'Saves the songs from a query or the queue to your named playlist',
        args: {
          name: {
            type: 'word',
            desc: 'The name of the playlist to save to'
          },
          query: {
            type: 'text',
            desc: 'The query to save',
            optional: true
          }
        }
      },
      ({ message, args: { name, query }, voice }) => {
        if (!name && 'send' in message.channel)
          return message.channel.send('Please provide a name');
        return voice.playlistSave(message, name, query);
      }
    ),
    add: musicCommand(
      {
        desc: 'Adds the songs from a query or the queue to your named playlist',
        args: {
          name: {
            type: 'word',
            desc: 'The name of the playlist to save to'
          },
          query: {
            type: 'text',
            desc: 'The query to save',
            optional: true
          }
        }
      },
      ({ message, args: { name, query }, voice }) => {
        if (!name && 'send' in message.channel)
          return message.channel.send('Please provide a name');
        return voice.playlistAdd(message, name, query);
      }
    )
  }
);
