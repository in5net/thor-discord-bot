import helpCommand from '$shared/help';
import commands from './index';

const cmd = helpCommand('Thor', 'thor ', 'ORANGE', commands);
export default cmd;
