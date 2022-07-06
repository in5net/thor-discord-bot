import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js@1.35.4?dts';

console.log(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_KEY') || ''
);
const supabase = createClient(
  Deno.env.get('SUPABASE_URL') || '',
  Deno.env.get('SUPABASE_KEY') || ''
);
export default supabase;
