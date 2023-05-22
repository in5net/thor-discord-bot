import type { TextCommand } from '$services/commands/text';
import glsl from './glsl';
import ryc from './ryc';
import ryu from './ryu';

const commands = {
  glsl,
  ryc,
  ryu
} as unknown as Record<string, TextCommand>;
export default commands;
