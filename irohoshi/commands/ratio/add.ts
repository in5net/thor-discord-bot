import command from '../command.ts';
import { ratiosTable } from './supabase.ts';

export default command(
  {
    desc: 'Adds some ratios to the list',
    options: {
      ratios: {
        type: 'string',
        desc: "The ratios to add ('+' separated)"
      }
    }
  },
  async (i, { ratios }) => {
    const ratioStrs = ratios.split('+').map(s => s.trim());
    const { error } = await ratiosTable().upsert(
      ratioStrs.map(s => ({ text: s }))
    );
    if (error) throw new Error(error.message);
    return i.reply('Added to ratios');
  }
);
