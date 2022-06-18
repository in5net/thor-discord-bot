import command from '../command.ts';
import { ratiosTable } from './supabase.ts';

const NUM_RATIOS = 50;

export default command(
  {
    desc: 'Get ratioed',
    options: {}
  },
  async i => {
    const { data } = await ratiosTable.select('text');
    const ratios = data?.map(s => s.text) || [];
    const indices = new Set<number>();
    while (indices.size < Math.min(NUM_RATIOS, ratios.length)) {
      indices.add(Math.floor(Math.random() * ratios.length));
    }
    const ratioStrs = [...indices].map(i => ratios[i] || '');
    i.reply(
      ratioStrs.join(' + ') ||
        'Looks like there are no ratios, see `thor help ratio add` to find out how to add some'
    );
  }
);
