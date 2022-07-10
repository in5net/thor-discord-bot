import helpCommand from '$shared/help';
// eslint-disable-next-line import/no-cycle
import commands from './index';
import { color } from '../config';

const help = helpCommand('Thor Music', '-', color, commands);
export default help;
