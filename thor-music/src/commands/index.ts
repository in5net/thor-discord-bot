import play from './play';
import playnow from './playnow';
import queue from './queue';
import next from './next';
import pause from './pause';
import shuffle from './shuffle';
import playshuffle from './playshuffle';
import loop from './loop';
import move from './move';
import remove from './remove';
import stop from './stop';
import soundboard from './soundboard';
import lyrics from './lyrics';
import playlist from './playlist';
import hz from './hz';
import type Command from './command';

const commands: Command[] = [
  play,
  playnow,
  queue,
  next,
  pause,
  shuffle,
  playshuffle,
  loop,
  move,
  remove,
  stop,
  soundboard,
  lyrics,
  playlist,
  hz
];
export default commands;
