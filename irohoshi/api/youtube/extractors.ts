const videoIdPattern = /^[a-zA-Z\d_-]{11,12}$/;
const playlistIdPattern = /^(PL|UU|LL|RD|OL)[a-zA-Z\d_-]{10,}$/;
const videoPattern =
  /^((?:https?:)?\/\/)?(?:(?:www|m|music)\.)?((?:youtube\.com|youtu.be))(\/(?:[\w-]+\?v=|shorts\/|embed\/|v\/)?)([\w-]+)(\S+)?$/;
const playlistPattern =
  /^((?:https?:)?\/\/)?(?:(?:www|m|music)\.)?((?:youtube\.com|youtu.be))\/(?:(playlist|watch))?(.*)?((\?|&)list=)(PL|UU|LL|RD|OL)[a-zA-Z\d_-]{10,}(&.*)?$/;

/**
 * Validate YouTube URL or Id.
 *
 * **CAUTION :** If your search word is 11 or 12 characters long, you might get it validated as video Id.
 *
 * To avoid above, add one more condition to yt_validate
 * ```ts
 * if (url.startsWith('https') && yt_validate(url) === 'video') {
 *      // YouTube Video Url.
 * }
 * ```
 * @param url YouTube URL OR Id
 * @returns
 * ```
 * 'playlist' | 'video' | 'search' | false
 * ```
 */
export function ytValidate(
  url: string
): 'playlist' | 'video' | 'search' | false {
  url = url.trim();
  if (url.indexOf('list=') === -1) {
    if (url.startsWith('https')) {
      if (url.match(videoPattern)) {
        let id: string;
        if (url.includes('youtu.be/'))
          [id] = url.split('youtu.be/')[1].split(/(\?|\/|&)/);
        else if (url.includes('youtube.com/embed/'))
          [id] = url.split('youtube.com/embed/')[1].split(/(\?|\/|&)/);
        else if (url.includes('youtube.com/shorts/'))
          [id] = url.split('youtube.com/shorts/')[1].split(/(\?|\/|&)/);
        else [id] = url.split('watch?v=')[1]?.split(/(\?|\/|&)/) || '';
        if (id?.match(videoIdPattern)) return 'video';
        return false;
      }
      return false;
    }
    if (url.match(videoIdPattern)) return 'video';
    if (url.match(playlistIdPattern)) return 'playlist';
    return 'search';
  }
  if (!url.match(playlistPattern))
    return ytValidate(url.replace(/(\?|&)list=[^&]*/, ''));
  return 'playlist';
}
/**
 * Extracts the video Id from a YouTube URL.
 *
 * Will return the value of `urlOrId` if it looks like a video Id.
 * @param urlOrId A YouTube URL or video Id
 * @returns the video Id or `false` if it can't find a video Id.
 */
function extractVideoId(urlOrId: string): string | false {
  if (urlOrId.startsWith('https://') && urlOrId.match(videoPattern)) {
    let id: string;
    if (urlOrId.includes('youtu.be/'))
      [id] = urlOrId.split('youtu.be/')[1].split(/(\?|\/|&)/);
    else if (urlOrId.includes('youtube.com/embed/'))
      [id] = urlOrId.split('youtube.com/embed/')[1].split(/(\?|\/|&)/);
    else if (urlOrId.includes('youtube.com/shorts/'))
      [id] = urlOrId.split('youtube.com/shorts/')[1].split(/(\?|\/|&)/);
    else
      [id] = (urlOrId.split('watch?v=')[1] ?? urlOrId.split('&v=')[1]).split(
        /(\?|\/|&)/
      );

    if (id.match(videoIdPattern)) return id;
  } else if (urlOrId.match(videoIdPattern)) return urlOrId;

  return false;
}
/**
 * Extract Id of YouTube url.
 * @param url Id or url of YouTube
 * @returns Id of video or playlist.
 */
export function extractId(url: string): string {
  const check = ytValidate(url);
  if (!check || check === 'search')
    throw new Error('This is not a YouTube url or videoId or PlaylistId');
  url = url.trim();
  if (url.startsWith('https')) {
    if (url.indexOf('list=') === -1) {
      const id = extractVideoId(url);
      if (!id)
        throw new Error('This is not a YouTube url or videoId or PlaylistId');
      return id;
    }
    return url.split('list=')[1].split('&')[0];
  }
  return url;
}

export function duration2Sec(durationString: string): number {
  const durationParts = durationString
    .replaceAll(/PT|H|M|S/g, '')
    .split(':')
    .map(str => parseInt(str));

  let hours = 0;
  let minutes = 0;
  let seconds = 0;
  switch (durationParts.length) {
    case 1:
      [seconds] = durationParts;
      break;
    case 2:
      [minutes, seconds] = durationParts;
      break;
    case 3:
      [hours, minutes, seconds] = durationParts;
  }

  return hours * 3600 + minutes * 60 + seconds;
}
