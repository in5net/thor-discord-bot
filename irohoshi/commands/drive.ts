import command from './command.ts';

const googleDriveURLRegex =
  /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)\/view$/;

export default command(
  {
    desc: 'Generates a url of a Google Drive file',
    options: {
      url: {
        type: 'string',
        desc: 'The url of the Google Drive file'
      }
    }
  },
  (i, { url }) => {
    if (!googleDriveURLRegex.test(url))
      return i.reply('You must provide a Google Drive file url');
    const id = url.match(googleDriveURLRegex)?.[1];
    if (!id) return i.reply('Invalid Google Drive file url');
    const downloadURL = `https://drive.google.com/uc?id=${id}`;
    return i.reply(downloadURL);
  }
);
