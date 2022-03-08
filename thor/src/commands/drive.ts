import type Command from './command';

const googleDriveURLRegex =
  /^https:\/\/drive\.google\.com\/file\/d\/([a-zA-Z0-9-_]+)\/view$/;

const cmd: Command = async ({ channel }, [urlStr]) => {
  if (!urlStr || !googleDriveURLRegex.test(urlStr))
    return channel.send('You must provide a Google Drive file url');
  const id = urlStr.match(googleDriveURLRegex)?.[1];
  if (!id) return channel.send('Invalid Google Drive file url');
  const url = `https://drive.google.com/uc?id=${id}`;
  return channel.send(url);
};
export default cmd;
