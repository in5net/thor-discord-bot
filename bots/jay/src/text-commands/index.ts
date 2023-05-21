import type { TextCommand } from '$services/commands/text';
import glsl from './glsl';

const commands = { glsl } as unknown as Record<string, TextCommand>;
export default commands;
