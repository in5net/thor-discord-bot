import supabase from '../../supabase.ts';
import { definitions } from '../../../types/supabase.ts';

export const ratiosTable = () => supabase.from<definitions['ratios']>('ratios');
