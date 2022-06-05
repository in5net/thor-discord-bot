import { createCommand } from '$shared/command';

const googleDriveURLRegex =
  /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)\/view$/;

export default createCommand(
  {
    name: 'drive',
    aliases: ['ドライブ'],
    desc: 'Generates a url of a Google Drive file',
    args: [
      {
        name: 'url',
        type: 'string',
        desc: 'The url of the Google Drive file'
      }
    ] as const
  },
  async ({ channel }, [url]) => {
    if (!url || !googleDriveURLRegex.test(url))
      return channel.send('You must provide a Google Drive file url');
    const id = url.match(googleDriveURLRegex)?.[1];
    if (!id) return channel.send('Invalid Google Drive file url');
    const downloadURL = `https://drive.google.com/uc?id=${id}`;
    return channel.send(downloadURL);
  }
);
