import command from '../command.ts';
import { imagesTable } from './supabase.ts';

export default command(
  {
    desc: 'Search for an image from yyyyyyy.info',
    options: {
      query: {
        type: 'string',
        desc: 'Query to search for',
        autocomplete: async query => {
          const { data } = await imagesTable()
            .select('file_name')
            .textSearch('file_name', query)
            .limit(5);
          console.log(data);
          return data?.map(({ file_name }) => file_name) || [];
        }
      }
    }
  },
  async i => {
    const { data } = await imagesTable()
      .select('file_name')
      .eq('file_name', '*')
      .limit(1)
      .single();
    const filename = data?.file_name || '';
    const url = `${Deno.env.get('FILES_ORIGIN')}/y7/images/${filename}`;
    return i.reply(url);
  }
);
