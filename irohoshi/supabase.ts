import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@1.35.3?dts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_PUBLIC_KEY') || ''
);
export default supabase;
