import supabase from './supabase.ts';
import { definitions } from '../types/supabase.ts';

type Def = definitions['users'];
interface User extends Def {
  counts?: Record<string, number>;
}
export const usersTable = () => supabase.from<User>('users');

export async function getUser(uid: string): Promise<User | null> {
  const { data: user } = await usersTable().select().eq('id', uid).single();
  return user;
}

export const incCount = async (uid: string, name: string) => {
  const { data: user } = await usersTable()
    .select('counts')
    .eq('id', uid)
    .single();
  const counts = user?.counts || {};
  return usersTable().upsert({
    id: uid,
    counts: {
      ...counts,
      [name]: (counts[name] || 0) + 1
    }
  });
};
