import supabase from './supabase.ts';
import { definitions } from '../types/supabase.ts';

export const usersTable = supabase.from<definitions['users']>('users');

export async function getUser(
  uid: string
): Promise<definitions['users'] | null> {
  const { data: user } = await usersTable.select().eq('uid', uid).single();
  return user;
}

type CountName = 'weeb';
export const incCount = async (uid: string, name: CountName) => {
  const { data: user } = await usersTable
    .select('counts')
    .eq('uid', uid)
    .single();
  const counts = (user?.counts || {}) as Record<string, number>;
  return usersTable.upsert({
    uid,
    counts: {
      ...counts,
      [name]: (counts[name] || 0) + 1
    }
  });
};
