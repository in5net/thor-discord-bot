import img from './img';
import fractal from './fractal';
import random from './random';
import noise from './noise';
import react from './react';
import ping from './ping';
import status from './status';
import cube from './cube';
import owo from './owo';
import chaos from './chaos';
import pixelsort from './pixelsort';
import sort from './sort';
import graph from './graph';
import quest from './quest';
import hex from './hex';
import wordle from './wordle';
import hash from './hash';
import counts from './counts';
import lifehash from './lifehash';
import type Command from '$shared/command';

const commands = [
  img,
  fractal,
  random,
  noise,
  react,
  ping,
  status,
  cube,
  owo,
  chaos,
  pixelsort,
  sort,
  graph,
  quest,
  hex,
  wordle,
  hash,
  counts,
  lifehash
] as unknown as Command[];
export default commands;
