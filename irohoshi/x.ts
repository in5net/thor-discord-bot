import './env.ts';
import supabase from './supabase.ts';
import { definitions } from '../types/supabase.ts';

const { data, error } = await supabase.rpc<definitions['ratios']>(
  'get_random_ratios'
);
//   .select('file_name')
//   .limit(1)
//   .single();
// const filename = data?.file_name || '';
// const url = `${Deno.env.get('FILES_ORIGIN')}/images/${filename}`;
console.log(data, error);
