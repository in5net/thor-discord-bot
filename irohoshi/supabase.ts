import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@1.35.4?dts';

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_KEY') || ''
);
export default supabase;
