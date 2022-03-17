import helpCommand from '../../../help';
import { color } from '../config';
import commands from './index';

const help = helpCommand('Thor Music', '-', color, commands);
export default help;
