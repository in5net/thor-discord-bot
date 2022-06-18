import command from '../command.ts';
import { incCount } from '../../users.ts';
import supabase from '../../supabase.ts';
import { definitions } from '../../../types/supabase.ts';

const NUM_RATIOS = 50;

export default command(
  {
    desc: 'Get ratioed',
    options: {}
  },
  async i => {
    const { data } = await supabase.rpc<definitions['ratios']>(
      'get_random_ratios',
      { n: NUM_RATIOS }
    );
    const ratios = data?.map(s => s.text) || [];
    await incCount(i.user.id, 'ratio');
    i.reply(
      ratios.join(' + ') ||
        'Looks like there are no ratios, use `/ratio add` to add some'
    );
  }
);
