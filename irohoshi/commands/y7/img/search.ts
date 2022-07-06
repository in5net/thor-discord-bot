import command from '../../command.ts';
import { imagesTable } from './supabase.ts';

export default command(
  {
    desc: 'Search for an image from yyyyyyy.info',
    options: {
      file_name: {
        type: 'string',
        desc: 'The file name to search for',
        autocomplete: async query => {
          const { data } = await imagesTable()
            .select('file_name')
            .textSearch(
              'file_name_search',
              query
                .split(' ')
                .filter(Boolean)
                .map(word => `${word}:*`)
                .join(' & ')
            )
            .limit(5);
          return data?.map(({ file_name }) => file_name) || [];
        }
      }
    }
  },
  (i, { file_name }) => {
    const url = `${Deno.env.get('FILES_ORIGIN')}/y7/images/${file_name}`;
    return i.reply(url);
  }
);
