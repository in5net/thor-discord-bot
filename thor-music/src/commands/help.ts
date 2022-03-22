import helpCommand from '../../../help';
import { color } from '../config';
// eslint-disable-next-line import/no-cycle
import commands from './index';

const help = helpCommand('Thor Music', '-', color, commands);
export default help;
