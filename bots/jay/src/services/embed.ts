import { EmbedBuilder } from 'discord.js';

import { COLOR } from './env';

export const createEmbed = () => new EmbedBuilder().setColor(COLOR);
