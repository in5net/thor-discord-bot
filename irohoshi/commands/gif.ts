import { definitions } from '../../types/supabase.ts';
import supabase from '../supabase.ts';
import command from './command.ts';

export default command(
  {
    desc: 'Get a random GIF from yyyyyyy.info',
    options: {}
  },
  async i => {
    const { data } = await supabase
      .rpc<definitions['y7_images']>('get_random_images')
      .select('file_name')
      .like('file_name', '%.gif')
      .single();
    const filename = data?.file_name || '';
    const url = `${Deno.env.get('FILES_ORIGIN')}/y7/images/${filename}`;
    return i.reply(url);
  }
);
