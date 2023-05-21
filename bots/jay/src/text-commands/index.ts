import type { TextCommand } from '$services/commands/text';
import glsl from './glsl';
import ryu from './ryu';

const commands = { glsl, ryu } as unknown as Record<string, TextCommand>;
export default commands;
