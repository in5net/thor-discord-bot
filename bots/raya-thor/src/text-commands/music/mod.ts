import type { TextCommand } from '$services/commands/text';
import filter from './filter';
import join from './join';
import loop from './loop';
import lyrics from './lyrics';
import move from './move';
import next from './next';
import pause from './pause';
import play from './play';
import playlist from './playlist';
import playnext from './playnext';
import playnow from './playnow';
import playshuffle from './playshuffle';
import queue from './queue';
import remove from './remove';
import seek from './seek';
import shuffle from './shuffle';
import stop from './stop';

const commands = {
  filter,
  join,
  loop,
  lyrics,
  move,
  next,
  pause,
  play,
  playlist,
  playnext,
  playnow,
  playshuffle,
  queue,
  remove,
  seek,
  shuffle,
  stop
} as unknown as Record<string, TextCommand>;
export default commands;
