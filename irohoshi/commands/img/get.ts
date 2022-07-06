import { definitions } from '../../../types/supabase.ts';
import supabase from '../../supabase.ts';
import command from '../command.ts';

export default command(
  {
    desc: 'Get a random image from files.in5net.io',
    options: {}
  },
  async i => {
    const { data } = await supabase
      .rpc<definitions['images']>('get_random_images')
      .select('file_name')
      .limit(1)
      .single();
    const filename = data?.file_name || '';
    const url = `${Deno.env.get('FILES_ORIGIN')}/images/${filename}`;
    return i.reply(url);
  }
);
