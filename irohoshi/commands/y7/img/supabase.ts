import supabase from '../../../supabase.ts';
import { definitions } from '../../../../types/supabase.ts';

export const imagesTable = () =>
  supabase.from<definitions['y7_images']>('y7_images');
