import { definitions } from '../../types/supabase.ts';
import supabase from '../supabase.ts';
import command from './command.ts';

export default command(
  {
    desc: 'Get a random image from yyyyyyy.info',
    options: {}
  },
  async i => {
    const { data } = await supabase
      .rpc<definitions['y7_gifs']>('get_random_images')
      .select('file_name')
      .gt('frames', 1)
      .limit(1)
      .single();
    const filename = data?.file_name || '';
    const url = `${Deno.env.get('FILES_ORIGIN')}/y7/images/${filename}`;
    return i.reply(url);
  }
);
